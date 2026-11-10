const db = require('../db/db');

// Get full medical history for a patient
const getPatientHistory = async (req, res) => {
  try {
    const { patient_id } = req.params;

    const patient = await db.getAsync(`
      SELECT p.*, u.full_name, u.email, u.phone, u.nic_passport
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [patient_id]);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    // Get medical records
    const records = await db.allAsync(`
      SELECT mr.*, doc_u.full_name as doctor_name, d.specialization, d.slmc_reg_no, a.appointment_no, a.date
      FROM medical_records mr
      JOIN doctors d ON mr.doctor_id = d.id
      JOIN users doc_u ON d.user_id = doc_u.id
      JOIN appointments a ON mr.appointment_id = a.id
      WHERE mr.patient_id = ?
      ORDER BY mr.created_at DESC
    `, [patient_id]);

    // For each record, attach prescriptions & items
    for (const rec of records) {
      const rx = await db.getAsync(`SELECT * FROM prescriptions WHERE medical_record_id = ?`, [rec.id]);
      if (rx) {
        rx.items = await db.allAsync(`SELECT * FROM prescription_items WHERE prescription_id = ?`, [rx.id]);
        rec.prescription = rx;
      } else {
        rec.prescription = null;
      }
    }

    // Get lab tests
    const labTests = await db.allAsync(`
      SELECT lt.*, a.appointment_no
      FROM lab_tests lt
      JOIN appointments a ON lt.appointment_id = a.id
      WHERE lt.patient_id = ?
      ORDER BY lt.sample_date DESC
    `, [patient_id]);

    res.json({
      success: true,
      patient,
      records,
      labTests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Save a Doctor Consultation (Diagnosis + Prescription + Lab Test)
const saveConsultation = async (req, res) => {
  try {
    const { appointment_id, symptoms, diagnosis, treatment_notes, prescription_items, instructions, lab_tests } = req.body;
    const doctor_id = req.user.doctor_id;

    if (!appointment_id || !diagnosis) {
      return res.status(400).json({ success: false, message: 'Appointment ID and Diagnosis are required.' });
    }

    const appointment = await db.getAsync(`SELECT * FROM appointments WHERE id = ?`, [appointment_id]);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const patient_id = appointment.patient_id;

    // 1. Insert or Update Medical Record
    let record = await db.getAsync(`SELECT id FROM medical_records WHERE appointment_id = ?`, [appointment_id]);
    let record_id;

    if (record) {
      await db.runAsync(`
        UPDATE medical_records 
        SET symptoms = ?, diagnosis = ?, treatment_notes = ? 
        WHERE id = ?
      `, [symptoms, diagnosis, treatment_notes, record.id]);
      record_id = record.id;
    } else {
      const result = await db.runAsync(`
        INSERT INTO medical_records (appointment_id, patient_id, doctor_id, symptoms, diagnosis, treatment_notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [appointment_id, patient_id, doctor_id, symptoms, diagnosis, treatment_notes]);
      record_id = result.lastID;
    }

    // 2. Insert or Replace Prescription & Items if provided
    await db.runAsync(`DELETE FROM prescriptions WHERE medical_record_id = ?`, [record_id]);
    let totalMedicineFee = 0;
    if (prescription_items && prescription_items.length > 0) {
      const validItems = prescription_items.filter(item => item.medicine_name && item.medicine_name.trim() !== '');
      if (validItems.length > 0) {
        const rxResult = await db.runAsync(`
          INSERT INTO prescriptions (medical_record_id, patient_id, doctor_id, instructions)
          VALUES (?, ?, ?, ?)
        `, [record_id, patient_id, doctor_id, instructions || 'Take as prescribed after meals.']);

        const rx_id = rxResult.lastID;

        for (const item of validItems) {
          await db.runAsync(`
            INSERT INTO prescription_items (prescription_id, medicine_name, dosage, duration, frequency)
            VALUES (?, ?, ?, ?, ?)
          `, [rx_id, item.medicine_name, item.dosage || '1-0-1', item.duration || '5 days', item.frequency || 'After meals']);
          totalMedicineFee += 350; // Mock fee calculation per medicine line
        }
      }
    }

    // 3. Insert Lab Tests if requested (avoid duplicating existing requested tests for this appointment)
    let totalLabFee = 0;
    if (lab_tests && lab_tests.length > 0) {
      const existingTests = await db.allAsync(`SELECT test_name FROM lab_tests WHERE appointment_id = ?`, [appointment_id]);
      const existingTestNames = new Set(existingTests.map(t => t.test_name));

      for (const testName of lab_tests) {
        if (testName && !existingTestNames.has(testName)) {
          await db.runAsync(`
            INSERT INTO lab_tests (appointment_id, patient_id, test_name, priority, status)
            VALUES (?, ?, ?, ?, ?)
          `, [appointment_id, patient_id, testName, 'Normal', 'requested']);
        }
      }
      const allTests = await db.allAsync(`SELECT id FROM lab_tests WHERE appointment_id = ?`, [appointment_id]);
      totalLabFee = allTests.length * 1500;
    }

    // 4. Update Appointment Status to completed
    await db.runAsync(`UPDATE appointments SET status = 'completed' WHERE id = ?`, [appointment_id]);

    // 5. Update Invoice with medicine & lab fees
    const invoice = await db.getAsync(`SELECT * FROM invoices WHERE appointment_id = ?`, [appointment_id]);
    if (invoice) {
      const updatedTotal = invoice.consultation_fee + totalLabFee + totalMedicineFee - invoice.discount;
      await db.runAsync(`
        UPDATE invoices 
        SET lab_fee = ?, medicine_fee = ?, total_amount = ? 
        WHERE id = ?
      `, [totalLabFee, totalMedicineFee, updatedTotal, invoice.id]);
    }

    // Send notification to patient
    const patUser = await db.getAsync(`SELECT user_id FROM patients WHERE id = ?`, [patient_id]);
    if (patUser) {
      await db.runAsync(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, ?)
      `, [patUser.user_id, 'Consultation Completed', 'Your doctor consultation notes and digital prescription are now available in your dashboard.', 'info']);
    }

    res.json({
      success: true,
      message: 'Consultation saved successfully and appointment marked as completed.',
      medical_record_id: record_id
    });
  } catch (error) {
    console.error('Error saving consultation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPatientHistory,
  saveConsultation
};
