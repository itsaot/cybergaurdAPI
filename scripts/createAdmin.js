require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // adjust path if needed

const createAdmin = async () => {
  try {
    // 1️⃣ Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // 2️⃣ Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'ntokozocyber' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists:', existingAdmin.username);
      return;
    }

    // 3️⃣ Hash the password
    const hashedPassword = await bcrypt.hash('Ntokozo@cyber', 10);

    // 4️⃣ Create admin user
    const adminUser = new User({
      username: 'ntokozocyber',
      password: hashedPassword,
      role: 'admin', // ✅ ensure this matches your backend role
      refreshTokens: [],
    });

    await adminUser.save();
    console.log('🎉 Admin user created successfully on Atlas!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
createAdmin();
