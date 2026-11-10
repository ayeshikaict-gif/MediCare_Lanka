const db = require('../db/db');

const getDoctors = async (req, res) => {
  try {
    const { department_id, search } = req.query;
    let sql = `
      SELECT d.*, u.full_name, u.email, u.phone, dept.name as department_name, dept.code as department_code,
             COALESCE(AVG(r.rating), 4.8) as rating, COUNT(r.id) as review_count
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN departments dept ON d.department_id = dept.id
      LEFT JOIN reviews r ON d.id = r.doctor_id
    `;
    const params = [];
    const conditions = [];

    if (department_id) {
      conditions.push(`d.department_id = ?`);
      params.push(department_id);
    }

    if (search) {
      conditions.push(`(u.full_name LIKE ? OR d.specialization LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }

    sql += ` GROUP BY d.id ORDER BY u.full_name ASC`;

    const doctors = await db.allAsync(sql, params);
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await db.getAsync(`
      SELECT d.*, u.full_name, u.email, u.phone, dept.name as department_name, dept.code as department_code
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN departments dept ON d.department_id = dept.id
      WHERE d.id = ?
    `, [id]);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const schedules = await db.allAsync(`SELECT * FROM doctor_schedules WHERE doctor_id = ?`, [id]);
    const reviews = await db.allAsync(`
      SELECT r.*, u.full_name as patient_name 
      FROM reviews r
      JOIN patients p ON r.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE r.doctor_id = ?
      ORDER BY r.created_at DESC
    `, [id]);

    res.json({
      success: true,
      doctor,
      schedules,
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Calculate available time slots for a doctor on a given date
const getDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // YYYY-MM-DD format

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date parameter is required.' });
    }

    // Default time slot matrix
    const defaultSlots = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
      '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
      '03:00 PM', '03:30 PM', '04:00 PM'
    ];

    // Find booked slots for this doctor on this date
    const bookedAppointments = await db.allAsync(
      `SELECT time_slot FROM appointments WHERE doctor_id = ? AND date = ? AND status NOT IN ('cancelled')`,
      [id, date]
    );

    const bookedSlotSet = new Set(bookedAppointments.map(a => a.time_slot));

    const slots = defaultSlots.map(slot => ({
      time: slot,
      available: !bookedSlotSet.has(slot)
    }));

    res.json({
      success: true,
      date,
      doctor_id: parseInt(id),
      slots
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit a patient review for a doctor
const addDoctorReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const patient_id = req.user.patient_id;

    if (!patient_id) {
      return res.status(403).json({ success: false, message: 'Only patients can leave doctor reviews.' });
    }

    const numericRating = parseInt(rating, 10);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating between 1 and 5 is required.' });
    }

    const doctor = await db.getAsync(`SELECT id FROM doctors WHERE id = ?`, [id]);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    await db.runAsync(
      `INSERT INTO reviews (patient_id, doctor_id, rating, comment) VALUES (?, ?, ?, ?)`,
      [patient_id, id, numericRating, comment || '']
    );

    res.status(201).json({ success: true, message: 'Review submitted successfully! Thank you for your feedback.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getDoctorAvailability,
  addDoctorReview
};
