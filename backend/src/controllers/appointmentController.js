const db = require('../db/db');

// Book a new appointment
const bookAppointment = async (req, res) => {
  try {
    const { doctor_id, service_id, date, time_slot, notes, patient_id_override } = req.body;

    let patient_id = req.user.patient_id;

    // Receptionists or Admins can book on behalf of a patient
    if ((req.user.role === 'receptionist' || req.user.role === 'admin') && patient_id_override) {
      patient_id = patient_id_override;
    }

    if (!patient_id) {
      return res.status(400).json({ success: false, message: 'Valid patient record is required for booking.' });
    }

    if (!doctor_id || !date || !time_slot) {
      return res.status(400).json({ success: false, message: 'Doctor, date, and time slot are required.' });
    }

    // Check collision
    const existing = await db.getAsync(
      `SELECT * FROM appointments WHERE doctor_id = ? AND date = ? AND time_slot = ? AND status NOT IN ('cancelled')`,
      [doctor_id, date, time_slot]
    );

    if (existing) {
      return res.status(400).json({ success: false, message: 'This time slot has already been booked. Please select another slot.' });
    }

    // Generate unique Appointment Token Number e.g. MCL-2026-8493
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const appointment_no = `MCL-2026-${randomNum}`;

    const result = await db.runAsync(
      `INSERT INTO appointments (appointment_no, patient_id, doctor_id, service_id, date, time_slot, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [appointment_no, patient_id, doctor_id, service_id || 1, date, time_slot, 'confirmed', notes || '']
    );

    const appointmentId = result.lastID;

    // Automatically generate unpaid invoice
    const doctor = await db.getAsync(`SELECT consultation_fee FROM doctors WHERE id = ?`, [doctor_id]);
    const fee = doctor ? doctor.consultation_fee : 2500;
    const invNo = `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    await db.runAsync(
      `INSERT INTO invoices (invoice_no, appointment_id, patient_id, consultation_fee, lab_fee, medicine_fee, discount, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [invNo, appointmentId, patient_id, fee, 0, 0, 0, fee, 'unpaid']
    );

    // Get doctor user ID for notification
    const docUser = await db.getAsync(`SELECT user_id FROM doctors WHERE id = ?`, [doctor_id]);
    const patUser = await db.getAsync(`SELECT user_id FROM patients WHERE id = ?`, [patient_id]);

    if (patUser) {
      await db.runAsync(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
        [patUser.user_id, 'Appointment Booked', `Your appointment (${appointment_no}) is confirmed for ${date} at ${time_slot}.`, 'success']
      );
    }

    if (docUser) {
      await db.runAsync(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
        [docUser.user_id, 'New Patient Appointment', `New appointment booked for ${date} at ${time_slot}.`, 'info']
      );
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      appointment: {
        id: appointmentId,
        appointment_no,
        date,
        time_slot,
        status: 'confirmed'
      }
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get appointments list filtered by role
const getAppointments = async (req, res) => {
  try {
    const { role, patient_id, doctor_id } = req.user;
    const { date, status } = req.query;

    let sql = `
      SELECT a.*, 
             pat_u.full_name as patient_name, pat_u.phone as patient_phone, pat.blood_group, pat.gender,
             doc_u.full_name as doctor_name, d.specialization, d.room_no,
             dept.name as department_name,
             inv.id as invoice_id, inv.total_amount, inv.status as invoice_status
      FROM appointments a
      JOIN patients pat ON a.patient_id = pat.id
      JOIN users pat_u ON pat.user_id = pat_u.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users doc_u ON d.user_id = doc_u.id
      JOIN departments dept ON d.department_id = dept.id
      LEFT JOIN invoices inv ON a.id = inv.appointment_id
    `;

    const params = [];
    const conditions = [];

    if (role === 'patient') {
      conditions.push(`a.patient_id = ?`);
      params.push(patient_id);
    } else if (role === 'doctor') {
      conditions.push(`a.doctor_id = ?`);
      params.push(doctor_id);
    }

    if (date) {
      conditions.push(`a.date = ?`);
      params.push(date);
    }

    if (status) {
      conditions.push(`a.status = ?`);
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }

    sql += ` ORDER BY a.date ASC, a.time_slot ASC`;

    const appointments = await db.allAsync(sql, params);
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['confirmed', 'checked_in', 'in_consultation', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const appt = await db.getAsync(`SELECT * FROM appointments WHERE id = ?`, [id]);
    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (req.user.role === 'patient') {
      if (appt.patient_id !== req.user.patient_id) {
        return res.status(403).json({ success: false, message: 'Unauthorized to modify this appointment.' });
      }
      if (status !== 'cancelled') {
        return res.status(403).json({ success: false, message: 'Patients can only cancel appointments.' });
      }
    }

    await db.runAsync(`UPDATE appointments SET status = ? WHERE id = ?`, [status, id]);

    if (status === 'cancelled') {
      const patUser = await db.getAsync(`SELECT user_id FROM patients WHERE id = ?`, [appt.patient_id]);
      if (patUser) {
        await db.runAsync(
          `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
          [patUser.user_id, 'Appointment Cancelled', `Your appointment (${appt.appointment_no}) scheduled for ${appt.date} has been cancelled.`, 'info']
        );
      }
    }

    res.json({ success: true, message: `Appointment status updated to ${status}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  updateAppointmentStatus
};
