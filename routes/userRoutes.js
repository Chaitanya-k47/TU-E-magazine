// routes/userRoutes.js
const express = require('express');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController'); // Adjust path if needed

// Import Middlewares
const { protect } = require('../middlewares/authMiddleware'); // Your existing protect middleware
const { authorize } = require('../middlewares/authorizeMiddleware'); // The new authorize middleware

const router = express.Router();

// Apply protect and authorize middleware to all routes in this file
// Only authenticated ('protect') admins ('authorize('admin')') can access these
router.use(protect);
router.use(authorize('admin'));

// Define routes
router.route('/')
  .get(getUsers)       // GET /api/users
  .post(createUser);   // POST /api/users

router.route('/:id')
  .get(getUserById)    // GET /api/users/:id
  .put(updateUser)     // PUT /api/users/:id
  .delete(deleteUser); // DELETE /api/users/:id

module.exports = router;