const db = require('../db/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// Register Patient
const registerPatient = async (req, res) => {
  try {
    const { email, password, full_name, phone, nic_passport, dob, gender, blood_group, address, emergency_contact, allergies } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Email, password, and full name are required.' });
    }

    const existingUser = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const userResult = await db.runAsync(
      `INSERT INTO users (email, password, role, full_name, phone, nic_passport) VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, 'patient', full_name, phone || null, nic_passport || null]
    );

    const userId = userResult.lastID;

    const patientResult = await db.runAsync(
      `INSERT INTO patients (user_id, dob, gender, blood_group, address, emergency_contact, allergies) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, dob || null, gender || null, blood_group || 'O+', address || null, emergency_contact || null, allergies || 'None']
    );

    const token = jwt.sign(
      { id: userId, email, role: 'patient', full_name, patient_id: patientResult.lastID },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully.',
      token,
      user: {
        id: userId,
        patient_id: patientResult.lastID,
        email,
        role: 'patient',
        full_name,
        phone,
        nic_passport
      }
    });
  } catch (error) {
    console.error('Error registering patient:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Attach role profile IDs
    let patient_id = null;
    let doctor_id = null;
    let receptionist_id = null;

    if (user.role === 'patient') {
      const p = await db.getAsync('SELECT id FROM patients WHERE user_id = ?', [user.id]);
      patient_id = p ? p.id : null;
    } else if (user.role === 'doctor') {
      const d = await db.getAsync('SELECT id FROM doctors WHERE user_id = ?', [user.id]);
      doctor_id = d ? d.id : null;
    } else if (user.role === 'receptionist') {
      const r = await db.getAsync('SELECT id FROM receptionists WHERE user_id = ?', [user.id]);
      receptionist_id = r ? r.id : null;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name, patient_id, doctor_id, receptionist_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        phone: user.phone,
        nic_passport: user.nic_passport,
        patient_id,
        doctor_id,
        receptionist_id
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current logged in profile details
const me = async (req, res) => {
  try {
    const user = await db.getAsync('SELECT id, email, role, full_name, phone, nic_passport, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let profile = null;
    if (user.role === 'patient') {
      profile = await db.getAsync('SELECT * FROM patients WHERE user_id = ?', [user.id]);
    } else if (user.role === 'doctor') {
      profile = await db.getAsync(`
        SELECT d.*, dept.name as department_name 
        FROM doctors d 
        JOIN departments dept ON d.department_id = dept.id 
        WHERE d.user_id = ?
      `, [user.id]);
    } else if (user.role === 'receptionist') {
      profile = await db.getAsync('SELECT * FROM receptionists WHERE user_id = ?', [user.id]);
    }

    res.json({
      success: true,
      user,
      profile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerPatient,
  login,
  me
};
