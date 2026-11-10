const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const authController = require('../controllers/authController');
const departmentController = require('../controllers/departmentController');
const doctorController = require('../controllers/doctorController');
const appointmentController = require('../controllers/appointmentController');
const ehrController = require('../controllers/ehrController');
const billingController = require('../controllers/billingController');
const adminController = require('../controllers/adminController');
const labController = require('../controllers/labController');
const notificationController = require('../controllers/notificationController');

// Public Auth Routes
router.post('/auth/register', authController.registerPatient);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticateToken, authController.me);

// Public Directory & Availability Routes
router.get('/departments', departmentController.getDepartments);
router.get('/services', departmentController.getServices);
router.get('/doctors', doctorController.getDoctors);
router.get('/doctors/:id', doctorController.getDoctorById);
router.get('/doctors/:id/availability', doctorController.getDoctorAvailability);
router.post('/doctors/:id/reviews', authenticateToken, doctorController.addDoctorReview);

// Patients Directory (for Staff/Doctors)
router.get('/patients', authenticateToken, authorizeRoles('receptionist', 'admin', 'doctor'), adminController.getPatients);

// Appointment Booking & Management
router.post('/appointments', authenticateToken, appointmentController.bookAppointment);
router.get('/appointments', authenticateToken, appointmentController.getAppointments);
router.patch('/appointments/:id/status', authenticateToken, appointmentController.updateAppointmentStatus);

// Medical Records & EHR
router.get('/ehr/patient/:patient_id', authenticateToken, ehrController.getPatientHistory);
router.post('/ehr/consultation', authenticateToken, authorizeRoles('doctor'), ehrController.saveConsultation);

// Invoices & Billing
router.get('/billing/invoices', authenticateToken, billingController.getInvoices);
router.post('/billing/pay', authenticateToken, billingController.payInvoice);

// Lab Tests
router.get('/lab-tests', authenticateToken, labController.getLabTests);
router.patch('/lab-tests/:id', authenticateToken, labController.updateLabTest);

// Notifications
router.get('/notifications', authenticateToken, notificationController.getNotifications);
router.post('/notifications/read-all', authenticateToken, notificationController.markAsRead);

// Admin Routes
router.get('/admin/stats', authenticateToken, authorizeRoles('admin'), adminController.getDashboardStats);
router.post('/admin/doctors', authenticateToken, authorizeRoles('admin'), adminController.createDoctor);

module.exports = router;
