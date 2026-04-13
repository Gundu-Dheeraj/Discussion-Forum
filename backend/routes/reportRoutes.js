const express = require('express');
const router = express.Router();
const { createReport, getReports, updateReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, createReport);
router.get('/', protect, authorize('moderator', 'admin'), getReports);
router.put('/:id', protect, authorize('moderator', 'admin'), updateReport);

module.exports = router;
