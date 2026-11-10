const db = require('../db/db');

const getDepartments = async (req, res) => {
  try {
    const departments = await db.allAsync(`
      SELECT d.*, COUNT(doc.id) as doctor_count 
      FROM departments d 
      LEFT JOIN doctors doc ON d.id = doc.department_id 
      GROUP BY d.id
    `);
    res.json({ success: true, departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getServices = async (req, res) => {
  try {
    const { department_id } = req.query;
    let sql = `
      SELECT s.*, d.name as department_name 
      FROM services s 
      JOIN departments d ON s.department_id = d.id
    `;
    const params = [];

    if (department_id) {
      sql += ` WHERE s.department_id = ?`;
      params.push(department_id);
    }

    const services = await db.allAsync(sql, params);
    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDepartments,
  getServices
};
