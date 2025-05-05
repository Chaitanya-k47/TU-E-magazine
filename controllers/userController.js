// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Needed for admin user creation

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    // Exclude passwords from the result
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: `User not found with id of ${req.params.id}` });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err.message);
    // Handle potential CastError if ID format is invalid
    if (err.name === 'CastError') {
        return res.status(404).json({ success: false, message: `User not found with id of ${req.params.id}` });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create user (Admin only - allows setting role)
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Basic validation
  if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
  }

  // Validate role if provided
  if (role && !['reader', 'editor', 'admin'].includes(role)) {
       return res.status(400).json({ success: false, message: `Invalid role specified: ${role}` });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user instance
    user = new User({
        name,
        email,
        password,
        role: role || 'reader' // Default to 'reader' if role not specified by admin
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Exclude password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ success: true, data: userResponse });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// @desc    Update user details (Admin only - including role)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  const { name, email, role } = req.body;
  const fieldsToUpdate = {};

  if (name) fieldsToUpdate.name = name;
  if (email) fieldsToUpdate.email = email; // Consider checking if the new email is already taken
  if (role) {
    // Validate role
    if (!['reader', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role specified: ${role}` });
    }
    fieldsToUpdate.role = role;
  }

  // Do not allow password updates via this route. Create a separate password reset flow.

  try {
    // Check if user exists first
    let user = await User.findById(req.params.id);
     if (!user) {
        return res.status(404).json({ success: false, message: `User not found with id of ${req.params.id}` });
    }

    // Optional: Check if updated email already exists for another user
    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: `Email ${email} is already in use` });
        }
    }


    // Update user
    user = await User.findByIdAndUpdate(req.params.id, { $set: fieldsToUpdate }, {
      new: true, // Return the updated document
      runValidators: true // Run schema validators on update
    }).select('-password'); // Exclude password from the returned object

    res.status(200).json({ success: true, data: user });

  } catch (err) {
    console.error(err.message);
     // Handle potential CastError if ID format is invalid
    if (err.name === 'CastError') {
        return res.status(404).json({ success: false, message: `User not found with id of ${req.params.id}` });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: `User not found with id of ${req.params.id}` });
    }

    // Optional: Prevent admin from deleting themselves
    // if (user._id.toString() === req.user.id) {
    //     return res.status(400).json({ success: false, message: `Admin cannot delete their own account via this route` });
    // }

    await User.deleteOne({ _id: req.params.id }); // Use deleteOne with filter

    res.status(200).json({ success: true, message: 'User removed successfully', data: {} }); // Standard practice to return empty object

  } catch (err) {
    console.error(err.message);
     // Handle potential CastError if ID format is invalid
    if (err.name === 'CastError') {
        return res.status(404).json({ success: false, message: `User not found with id of ${req.params.id}` });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};