const express = require('express');
const router = express.Router();
const {
    updateUsername,
    updatePassword,
    deleteAccount,
    getAllUsers,
    toggleSavedThread,
    getSavedThreads,
    uploadProfilePicture,
    deleteProfilePicture
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getAllUsers);
router.put('/username', protect, updateUsername);
router.put('/password', protect, updatePassword);
router.delete('/account', protect, deleteAccount);

router.post('/profile-picture', protect, upload.single('image'), uploadProfilePicture);
router.delete('/profile-picture', protect, deleteProfilePicture);

router.get('/saved-threads', protect, getSavedThreads);
router.post('/saved-threads/:id', protect, toggleSavedThread);

const roleMiddleware = require("../middleware/roleMiddleware");

router.delete("/user/:id", authMiddleware, roleMiddleware(["admin"]), deleteUser);
router.delete("/thread/:id", authMiddleware, roleMiddleware(["admin", "moderator"]), deleteThread);

module.exports = router;
