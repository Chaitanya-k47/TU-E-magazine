// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../middlewares/asyncHandler');
const { ErrorResponse } = require('../middlewares/errorMiddleware');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc    Get single user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = asyncHandler(async (req, res, next) => {
    // ID format validation is handled by express-validator (isMongoId)
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: user });
});

// @desc    Create user (Admin only - allows setting role)
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    // Validation for name, email, password, role is handled by express-validator
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return next(new ErrorResponse('User already exists with this email', 400));
    }

    user = new User({
        name,
        email,
        password, // Hashed below or by pre-save hook
        role: role || User.schema.path('role').defaultValue
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ success: true, data: userResponse });
});

// @desc    Update user details (Admin can update any user's role, name, email. User can update their own name, email)
// @route   PUT /api/users/:id
// @access  Private (Admin or Owner of the account for name/email)
exports.updateUser = asyncHandler(async (req, res, next) => {
    const { name, email, role } = req.body; // Role will only be processed if user is admin
    const userIdToUpdate = req.params.id;
    const loggedInUser = req.user; // From 'protect' middleware

    const fieldsToUpdate = {};

    // Authorization:
    // 1. Admin can update anything specified for any user.
    // 2. Non-admin can only update their own name and email. They cannot change their role or other users.
    if (loggedInUser.role === 'admin') {
        if (req.body.hasOwnProperty('name')) fieldsToUpdate.name = name;
        if (req.body.hasOwnProperty('email')) fieldsToUpdate.email = email;
        if (req.body.hasOwnProperty('role')) { // Only admin can change role
            if (!User.schema.path('role').enumValues.includes(role)) {
                return next(new ErrorResponse(`Invalid role: ${role}`, 400));
            }
            // Prevent admin from accidentally demoting the last admin (more complex logic needed for this robustly)
            // Prevent admin from demoting themselves if they are the one being updated via this general route by ID
            if (loggedInUser.id === userIdToUpdate && role !== 'admin') {
                 return next(new ErrorResponse('Admins cannot change their own role to non-admin via this route.', 400));
            }
            fieldsToUpdate.role = role;
        }
    } else if (loggedInUser.id === userIdToUpdate) {
        // Non-admin updating their own profile
        if (req.body.hasOwnProperty('name')) fieldsToUpdate.name = name;
        if (req.body.hasOwnProperty('email')) fieldsToUpdate.email = email;
        if (req.body.hasOwnProperty('role') && role !== loggedInUser.role) {
            return next(new ErrorResponse('You are not authorized to change your role.', 403));
        }
    } else {
        // Non-admin trying to update someone else's profile
        return next(new ErrorResponse('You are not authorized to update this user.', 403));
    }

    // Check if user exists
    let userToUpdate = await User.findById(userIdToUpdate);
    if (!userToUpdate) {
        return next(new ErrorResponse(`User not found with id of ${userIdToUpdate}`, 404));
    }

    // Email uniqueness check if email is being changed
    if (fieldsToUpdate.email && fieldsToUpdate.email !== userToUpdate.email) {
        const existingUserWithEmail = await User.findOne({ email: fieldsToUpdate.email });
        if (existingUserWithEmail && existingUserWithEmail._id.toString() !== userIdToUpdate) {
             return next(new ErrorResponse(`Email ${fieldsToUpdate.email} is already in use.`, 400));
        }
    }

    // Only proceed if there are actual fields to update
    if (Object.keys(fieldsToUpdate).length === 0) {
        // Fetch again without password to send back current data if no changes
        const currentUserData = await User.findById(userIdToUpdate).select('-password');
        return res.status(200).json({ success: true, data: currentUserData, message: "No changes provided." });
    }

    const updatedUser = await User.findByIdAndUpdate(userIdToUpdate, { $set: fieldsToUpdate }, {
        new: true,
        runValidators: true
    }).select('-password');

    if (!updatedUser) { // Should not happen normally
        return next(new ErrorResponse(`User update failed for id ${userIdToUpdate}`, 500));
    }

    res.status(200).json({ success: true, data: updatedUser });
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    // ID format validation is handled by express-validator
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    if (req.user && user._id.toString() === req.user.id) {
         return next(new ErrorResponse('Admin cannot delete their own account via this route', 400));
    }

    await User.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, message: 'User removed successfully', data: {} });
});

// @desc    Get users eligible to be authors (editors, admins)
// @route   GET /api/users/authors
// @access  Private (Editor, Admin)
exports.getPotentialAuthors = asyncHandler(async (req, res, next) => {
    // Define roles eligible to be authors
    const authorRoles = ['editor', 'admin'];

    // Fetch users with these roles, selecting only necessary fields
    // Exclude the currently logged-in user from the list if desired (optional)
    // const users = await User.find({ role: { $in: authorRoles }, _id: { $ne: req.user.id } }) // Excludes self
    const users = await User.find({ role: { $in: authorRoles } }) // Includes self if they have the role
        .select('_id name email role') // Select fields needed for the dropdown
        .sort({ name: 1 }); // Sort by name

    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
});
