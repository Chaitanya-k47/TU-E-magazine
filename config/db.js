const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Connect to MongoDB without deprecated options
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1); // Exit the process if connection fails
    }
};

module.exports = connectDB;
