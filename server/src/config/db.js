const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quizmaster');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed admin user
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      const adminExists = await User.findOne({ role: 'admin' });
      if (!adminExists) {
        await User.create({
          username: 'admin',
          email: adminEmail,
          password: adminPassword,
          role: 'admin'
        });
        console.log(`Admin user successfully seeded: ${adminEmail}`);
      } else {
        console.log('Admin user already exists in database.');
      }
    }
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
