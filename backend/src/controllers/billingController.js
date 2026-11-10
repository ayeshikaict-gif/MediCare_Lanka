const db = require('../db/db');

// Get Invoices list for patient or receptionist/admin
const getInvoices = async (req, res) => {
  try {
    const { role, patient_id } = req.user;
    const { status } = req.query;

    let sql = `
      SELECT inv.*, a.appointment_no, a.date as appointment_date, a.time_slot,
             pat_u.full_name as patient_name, pat_u.phone as patient_phone, pat_u.nic_passport,
             doc_u.full_name as doctor_name, d.specialization, dept.name as department_name,
             p.payment_method, p.transaction_ref, p.paid_at
      FROM invoices inv
      JOIN appointments a ON inv.appointment_id = a.id
      JOIN patients pat ON inv.patient_id = pat.id
      JOIN users pat_u ON pat.user_id = pat_u.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users doc_u ON d.user_id = doc_u.id
      JOIN departments dept ON d.department_id = dept.id
      LEFT JOIN payments p ON inv.id = p.invoice_id
    `;

    const params = [];
    const conditions = [];

    if (role === 'patient') {
      conditions.push(`inv.patient_id = ?`);
      params.push(patient_id);
    }

    if (status) {
      conditions.push(`inv.status = ?`);
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }

    sql += ` ORDER BY inv.created_at DESC`;

    const invoices = await db.allAsync(sql, params);
    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Process mock payment for an invoice
const payInvoice = async (req, res) => {
  try {
    const { invoice_id, payment_method, amount } = req.body;

    if (!invoice_id || !payment_method) {
      return res.status(400).json({ success: false, message: 'Invoice ID and payment method are required.' });
    }

    const invoice = await db.getAsync(`SELECT * FROM invoices WHERE id = ?`, [invoice_id]);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Invoice has already been paid.' });
    }

    const txnRef = `TXN-MCL-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const payAmount = amount || invoice.total_amount;

    // Record Payment
    await db.runAsync(`
      INSERT INTO payments (invoice_id, patient_id, amount, payment_method, transaction_ref, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [invoice_id, invoice.patient_id, payAmount, payment_method, txnRef, 'success']);

    // Update Invoice Status
    await db.runAsync(`UPDATE invoices SET status = 'paid' WHERE id = ?`, [invoice_id]);

    // Send Notification
    const patUser = await db.getAsync(`SELECT user_id FROM patients WHERE id = ?`, [invoice.patient_id]);
    if (patUser) {
      await db.runAsync(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, ?)
      `, [patUser.user_id, 'Payment Received', `Payment of LKR ${payAmount.toLocaleString()} received for invoice ${invoice.invoice_no} (${payment_method.toUpperCase()}).`, 'success']);
    }

    res.json({
      success: true,
      message: 'Payment processed successfully!',
      payment: {
        invoice_no: invoice.invoice_no,
        amount: payAmount,
        payment_method,
        transaction_ref: txnRef,
        status: 'paid'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInvoices,
  payInvoice
};
