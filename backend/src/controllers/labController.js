const db = require('../db/db');

const getLabTests = async (req, res) => {
  try {
    const { role, patient_id } = req.user;
    let sql = `
      SELECT lt.*, a.appointment_no, a.date,
             pat_u.full_name as patient_name, pat_u.phone as patient_phone,
             doc_u.full_name as doctor_name
      FROM lab_tests lt
      JOIN appointments a ON lt.appointment_id = a.id
      JOIN patients pat ON lt.patient_id = pat.id
      JOIN users pat_u ON pat.user_id = pat_u.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users doc_u ON d.user_id = doc_u.id
    `;
    const params = [];

    if (role === 'patient') {
      sql += ` WHERE lt.patient_id = ?`;
      params.push(patient_id);
    }

    sql += ` ORDER BY lt.sample_date DESC`;

    const labTests = await db.allAsync(sql, params);
    res.json({ success: true, labTests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateLabTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, result_notes } = req.body;

    const allowed = ['requested', 'in_progress', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid lab test status.' });
    }

    await db.runAsync(`UPDATE lab_tests SET status = ?, result_notes = ? WHERE id = ?`, [status, result_notes || null, id]);

    if (status === 'completed') {
      const test = await db.getAsync(`
        SELECT lt.test_name, p.user_id 
        FROM lab_tests lt 
        JOIN patients p ON lt.patient_id = p.id 
        WHERE lt.id = ?
      `, [id]);

      if (test) {
        await db.runAsync(
          `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
          [test.user_id, 'Lab Result Available', `Your ${test.test_name} test results are ready for review.`, 'info']
        );
      }
    }

    res.json({ success: true, message: 'Lab test status updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLabTests,
  updateLabTest
};
