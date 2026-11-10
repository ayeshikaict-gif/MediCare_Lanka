const { app, ensureInitialized } = require('./app');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('Initializing database schema and seed data...');
    await ensureInitialized();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🏥 MediCare Lanka Clinic Management API running on:`);
      console.log(`👉 http://localhost:${PORT}/api`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
