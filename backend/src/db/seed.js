const db = require('./db');
const { initSchema } = require('./schema');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    await initSchema();

    // Check if users exist already
    const existingUsers = await db.allAsync('SELECT * FROM users');
    if (existingUsers.length > 0) {
      console.log('Database already seeded. Skipping seed execution.');
      return;
    }

    console.log('Seeding MediCare Lanka database with sample data...');

    const defaultPassword = bcrypt.hashSync('password123', 10);

    // 1. Insert Departments
    await db.runAsync(`INSERT INTO departments (name, code, description, icon) VALUES
      ('General Medicine', 'GEN', 'Primary care, comprehensive physical checkups, and routine treatments.', 'Stethoscope'),
      ('Cardiology', 'CARD', 'Heart health, ECG diagnostics, and cardiovascular treatments.', 'Heart'),
      ('Pediatrics', 'PED', 'Child healthcare, vaccinations, and pediatric consultations.', 'Baby'),
      ('Neurology', 'NEUR', 'Brain, spinal cord, and nerve disorder diagnosis and care.', 'Brain'),
      ('Orthopedics', 'ORTH', 'Bone, joint, and musculoskeletal system treatment.', 'Bone')
    `);

    // 2. Insert Services
    await db.runAsync(`INSERT INTO services (department_id, name, price, duration_mins) VALUES
      (1, 'General Consultation', 2500, 20),
      (1, 'Routine Physical Checkup', 3500, 30),
      (2, 'Cardiology Consultation & ECG', 5000, 30),
      (2, 'Echocardiogram Special Review', 7500, 45),
      (3, 'Pediatric Consultation & Immunization', 3000, 20),
      (4, 'Neurology Specialist Consultation', 5500, 30),
      (5, 'Orthopedic Consultation & Joint Check', 4000, 30)
    `);

    // 3. Insert Admin User
    await db.runAsync(
      `INSERT INTO users (email, password, role, full_name, phone, nic_passport) VALUES (?, ?, ?, ?, ?, ?)`,
      ['admin@medicare.lk', defaultPassword, 'admin', 'Dr. Sarath Wijesinghe (Admin)', '+94 77 123 4567', '197512345678']
    );

    // 4. Insert Doctor Users & Profiles
    const doc1 = await db.runAsync(
      `INSERT INTO users (email, password, role, full_name, phone, nic_passport) VALUES (?, ?, ?, ?, ?, ?)`,
      ['doctor.perera@medicare.lk', defaultPassword, 'doctor', 'Dr. Nimal Perera', '+94 71 888 1234', '198210987654']
    );
    await db.runAsync(
      `INSERT INTO doctors (user_id, department_id, specialization, slmc_reg_no, consultation_fee, room_no, bio) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [doc1.lastID, 1, 'Senior General Physician', 'SLMC-45892', 2500, 'Room 102', 'Over 15 years of experience in primary healthcare and internal medicine. Former consultant at Colombo National Hospital.']
    );

    const doc2 = await db.runAsync(
      `INSERT INTO users (email, password, role, full_name, phone, nic_passport) VALUES (?, ?, ?, ?, ?, ?)`,
      ['doctor.silva@medicare.lk', defaultPassword, 'doctor', 'Dr. Anusha Silva', '+94 77 333 9988', '198754321098']
    );
    await db.runAsync(
      `INSERT INTO doctors (user_id, department_id, specialization, slmc_reg_no, consultation_fee, room_no, bio) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [doc2.lastID, 2, 'Consultant Cardiologist', 'SLMC-67210', 5000, 'Room 205', 'Specialist in non-invasive cardiology, hypertension management, and preventive heart health.']
    );

    const doc3 = await db.runAsync(
      `INSERT INTO users (email, password, role, full_name, phone, nic_passport) VALUES (?, ?, ?, ?, ?, ?)`,
      ['doctor.fernando@medicare.lk', defaultPassword, 'doctor', 'Dr. Kusal Fernando', '+94 76 555 4321', '199012398745']
    );
    await db.runAsync(
      `INSERT INTO doctors (user_id, department_id, specialization, slmc_reg_no, consultation_fee, room_no, bio) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [doc3.lastID, 3, 'Pediatric Consultant', 'SLMC-78901', 3000, 'Room 108', 'Dedicated to compassionate child healthcare and neonatal wellness.']
    );

    // 5. Insert Receptionist Users & Profiles
    const rec1 = await db.runAsync(
      `INSERT INTO users (email, password, role, full_name, phone, nic_passport) VALUES (?, ?, ?, ?, ?, ?)`,
      ['reception.colombo@medicare.lk', defaultPassword, 'receptionist', 'Kasun Bandara', '+94 71 222 3344', '199412093847']
    );
    await db.runAsync(
      `INSERT INTO receptionists (user_id, branch_name, staff_id) VALUES (?, ?, ?)`,
      [rec1.lastID, 'Colombo Central', 'REC-CLM-01']
    );

    // 6. Insert Doctor Schedules
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let d = 1; d <= 3; d++) {
      for (const day of days) {
        await db.runAsync(
          `INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_mins) VALUES (?, ?, ?, ?, ?)`,
          [d, day, '09:00', '13:00', 30]
        );
      }
    }

    // 7. Insert Patient Users & Profiles
    const pat1 = await db.runAsync(
      `INSERT INTO users (email, password, role, full_name, phone, nic_passport) VALUES (?, ?, ?, ?, ?, ?)`,
      ['patient.kamal@gmail.com', defaultPassword, 'patient', 'Kamal Perera', '+94 77 444 5566', '199234567890']
    );
    const pat1_profile = await db.runAsync(
      `INSERT INTO patients (user_id, dob, gender, blood_group, address, emergency_contact, allergies) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [pat1.lastID, '1992-05-14', 'Male', 'O+', 'No. 45, Galle Road, Colombo 03', '+94 77 444 5500 (Wife)', 'Penicillin']
    );

    const pat2 = await db.runAsync(
      `INSERT INTO users (email, password, role, full_name, phone, nic_passport) VALUES (?, ?, ?, ?, ?, ?)`,
      ['patient.dilhani@gmail.com', defaultPassword, 'patient', 'Dilhani Jayasinghe', '+94 71 999 8877', '199587654321']
    );
    const pat2_profile = await db.runAsync(
      `INSERT INTO patients (user_id, dob, gender, blood_group, address, emergency_contact, allergies) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [pat2.lastID, '1995-11-20', 'Female', 'A+', 'No. 12, Kandy Road, Kiribathgoda', '+94 71 999 8800 (Father)', 'None']
    );

    // 8. Insert Sample Appointments
    const app1 = await db.runAsync(
      `INSERT INTO appointments (appointment_no, patient_id, doctor_id, service_id, date, time_slot, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['MCL-2026-001', 1, 1, 1, '2026-08-07', '10:00 AM', 'completed', 'Patient reported high fever and persistent migraine for 3 days.']
    );

    const app2 = await db.runAsync(
      `INSERT INTO appointments (appointment_no, patient_id, doctor_id, service_id, date, time_slot, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['MCL-2026-002', 2, 2, 3, '2026-08-07', '10:30 AM', 'in_consultation', 'Routine chest tightness checkup and ECG test.']
    );

    const app3 = await db.runAsync(
      `INSERT INTO appointments (appointment_no, patient_id, doctor_id, service_id, date, time_slot, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['MCL-2026-003', 1, 2, 3, '2026-08-10', '11:00 AM', 'confirmed', 'Follow-up appointment for cardiology evaluation.']
    );

    // 9. Insert Medical Record for Completed Appointment (app1)
    const record1 = await db.runAsync(
      `INSERT INTO medical_records (appointment_id, patient_id, doctor_id, symptoms, diagnosis, treatment_notes) VALUES (?, ?, ?, ?, ?, ?)`,
      [app1.lastID, 1, 1, 'Fever (38.8 C), body aches, severe headache, dry cough.', 'Acute Upper Respiratory Infection (Viral)', 'Prescribed oral antipyretics and analgesics. Advised 3 days complete bed rest and ample fluid hydration. Follow up if fever exceeds 101 F.']
    );

    // 10. Insert Prescription & Items
    const rx1 = await db.runAsync(
      `INSERT INTO prescriptions (medical_record_id, patient_id, doctor_id, instructions) VALUES (?, ?, ?, ?)`,
      [record1.lastID, 1, 1, 'Take medicines after meals. Drink at least 3 liters of water daily. Avoid cold drinks.']
    );

    await db.runAsync(
      `INSERT INTO prescription_items (prescription_id, medicine_name, dosage, duration, frequency) VALUES (?, ?, ?, ?, ?)`,
      [rx1.lastID, 'Paracetamol 500mg', '1-1-1 (Every 8h)', '5 days', 'After meals']
    );
    await db.runAsync(
      `INSERT INTO prescription_items (prescription_id, medicine_name, dosage, duration, frequency) VALUES (?, ?, ?, ?, ?)`,
      [rx1.lastID, 'Vitamin C 500mg', '1-0-1 (Morning & Night)', '7 days', 'After meals']
    );
    await db.runAsync(
      `INSERT INTO prescription_items (prescription_id, medicine_name, dosage, duration, frequency) VALUES (?, ?, ?, ?, ?)`,
      [rx1.lastID, 'Cetirizine 10mg', '0-0-1 (At Night)', '3 days', 'Before sleep']
    );

    // 11. Insert Lab Test Request
    await db.runAsync(
      `INSERT INTO lab_tests (appointment_id, patient_id, test_name, priority, status, result_notes) VALUES (?, ?, ?, ?, ?, ?)`,
      [app1.lastID, 1, 'Full Blood Count (FBC)', 'High', 'completed', 'WBC: 8.5 x 10^9/L (Normal), Platelets: 240 x 10^9/L (Normal), Hemoglobin: 14.2 g/dL. No dengue antigen detected.']
    );
    await db.runAsync(
      `INSERT INTO lab_tests (appointment_id, patient_id, test_name, priority, status, result_notes) VALUES (?, ?, ?, ?, ?, ?)`,
      [app2.lastID, 2, 'Fasting Blood Sugar (FBS)', 'Normal', 'requested', null]
    );

    // 12. Insert Invoices & Payments
    const inv1 = await db.runAsync(
      `INSERT INTO invoices (invoice_no, appointment_id, patient_id, consultation_fee, lab_fee, medicine_fee, discount, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['INV-2026-0001', app1.lastID, 1, 2500, 1500, 800, 0, 4800, 'paid']
    );

    await db.runAsync(
      `INSERT INTO payments (invoice_id, patient_id, amount, payment_method, transaction_ref, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [inv1.lastID, 1, 4800, 'card', 'TXN-MC-8839201', 'success']
    );

    const inv2 = await db.runAsync(
      `INSERT INTO invoices (invoice_no, appointment_id, patient_id, consultation_fee, lab_fee, medicine_fee, discount, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['INV-2026-0002', app2.lastID, 2, 5000, 1200, 0, 200, 6000, 'unpaid']
    );

    // 13. Insert Initial Notifications
    await db.runAsync(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
      [pat1.lastID, 'Appointment Confirmed', 'Your appointment with Dr. Anusha Silva is scheduled for 10 Aug 2026 at 11:00 AM.', 'success']
    );
    await db.runAsync(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
      [pat1.lastID, 'Lab Result Available', 'Your Full Blood Count (FBC) test results are ready for review.', 'info']
    );

    // 14. Insert Sample Doctor Review
    await db.runAsync(
      `INSERT INTO reviews (patient_id, doctor_id, rating, comment) VALUES (?, ?, ?, ?)`,
      [1, 1, 5, 'Dr. Nimal Perera was extremely thorough, polite, and reassuring. High standard of care!']
    );

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

if (require.main === module) {
  seedData().then(() => process.exit(0));
}

module.exports = { seedData };
