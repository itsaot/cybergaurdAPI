const express = require('express');
const router = express.Router();
const Report = require('../models/Report'); // correct path


const {
  createReport,
  getAllReports,
  getReportById,
  flagReport,
  getFlaggedReports,
  deleteReport,
  reactToReport
} = require('../controllers/reportController');

const { auth, isAdmin } = require('../middleware/auth');

// ✅ Public route — anyone can submit a report
router.post('/', createReport);
router.get('/', getAllReports);               // View all reports

// ✅ Admin-only routes

router.get('/flagged', isAdmin, getFlaggedReports);   // View flagged only
router.get('/:id', auth, isAdmin, getReportById);           // View single report by ID
router.patch('/:id/flag'auth, isAdmin, flagReport);       // Flag a report
router.delete('/:id', auth, isAdmin, deleteReport);         // Delete a report
router.patch('/:id/react', auth, reactToReport);            // React to a report

module.exports = router;
