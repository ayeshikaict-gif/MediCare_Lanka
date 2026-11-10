const db = require('../db/db');
const bcrypt = require('bcryptjs');

const getDashboardStats = async (req, res) => {
  try {
    const patientCount = await db.getAsync(`SELECT COUNT(*) as count FROM patients`);
    const doctorCount = await db.getAsync(`SELECT COUNT(*) as count FROM doctors`);
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = await db.getAsync(`SELECT COUNT(*) as count FROM appointments WHERE date = ?`, [today]);
    const totalRevenue = await db.getAsync(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'success'`);

    // Appointment stats breakdown
    const statusBreakdown = await db.allAsync(`
      SELECT status, COUNT(*) as count 
      FROM appointments 
      GROUP BY status
    `);

    // Department breakdown
    const deptBreakdown = await db.allAsync(`
      SELECT dept.name, COUNT(a.id) as appointment_count
      FROM departments dept
      LEFT JOIN doctors d ON dept.id = d.department_id
      LEFT JOIN appointments a ON d.id = a.doctor_id
      GROUP BY dept.id
    `);

    // Monthly revenue mock/live trend
    const revenueTrend = [
      { month: 'Jan', revenue: 450000 },
      { month: 'Feb', revenue: 520000 },
      { month: 'Mar', revenue: 610000 },
      { month: 'Apr', revenue: 580000 },
      { month: 'May', revenue: 720000 },
      { month: 'Jun', revenue: 690000 },
      { month: 'Jul', revenue: 810000 },
      { month: 'Aug', revenue: totalRevenue ? totalRevenue.total + 350000 : 845000 }
    ];

    const recentPatients = await db.allAsync(`
      SELECT p.id, u.full_name, u.email, u.phone, p.blood_group, u.created_at
      FROM patients p
      JOIN users u ON p.user_id = u.id
      ORDER BY u.created_at DESC
      LIMIT 5
    `);

    const recentAppointments = await db.allAsync(`
      SELECT a.*, pat_u.full_name as patient_name, doc_u.full_name as doctor_name, dept.name as department_name
      FROM appointments a
      JOIN patients pat ON a.patient_id = pat.id
      JOIN users pat_u ON pat.user_id = pat_u.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users doc_u ON d.user_id = doc_u.id
      JOIN departments dept ON d.department_id = dept.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        total_patients: patientCount.count,
        total_doctors: doctorCount.count,
        today_appointments: todayAppointments.count,
        total_revenue_lkr: totalRevenue.total
      },
      statusBreakdown,
      deptBreakdown,
      revenueTrend,
      recentPatients,
      recentAppointments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new doctor user
const createDoctor = async (req, res) => {
  try {
    const { email, password, full_name, phone, nic_passport, department_id, specialization, slmc_reg_no, consultation_fee, room_no, bio } = req.body;

    if (!email || !password || !full_name || !department_id || !slmc_reg_no) {
      return res.status(400).json({ success: false, message: 'Email, password, name, department, and SLMC registration number are required.' });
    }

    const existingUser = await db.getAsync(`SELECT * FROM users WHERE email = ?`, [email]);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const userResult = await db.runAsync(
      `INSERT INTO users (email, password, role, full_name, phone, nic_passport) VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, 'doctor', full_name, phone || null, nic_passport || null]
    );

    const docResult = await db.runAsync(
      `INSERT INTO doctors (user_id, department_id, specialization, slmc_reg_no, consultation_fee, room_no, bio) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userResult.lastID, department_id, specialization || 'Specialist', slmc_reg_no, consultation_fee || 2500, room_no || 'Room 101', bio || '']
    );

    // Create default schedule
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    for (const day of days) {
      await db.runAsync(
        `INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_mins) VALUES (?, ?, ?, ?, ?)`,
        [docResult.lastID, day, '09:00', '13:00', 30]
      );
    }

    res.status(201).json({ success: true, message: 'Doctor profile created successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get list of registered patients (for receptionist/admin/doctor walk-in booking & search)
const getPatients = async (req, res) => {
  try {
    const { search } = req.query;
    let sql = `
      SELECT p.id, p.dob, p.gender, p.blood_group, p.address,
             u.full_name, u.email, u.phone, u.nic_passport, u.created_at
      FROM patients p
      JOIN users u ON p.user_id = u.id
    `;
    const params = [];

    if (search) {
      sql += ` WHERE u.full_name LIKE ? OR u.phone LIKE ? OR u.nic_passport LIKE ? OR u.email LIKE ?`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY u.full_name ASC`;

    const patients = await db.allAsync(sql, params);
    res.json({ success: true, patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  createDoctor,
  getPatients
};
