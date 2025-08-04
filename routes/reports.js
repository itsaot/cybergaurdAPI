const express = require('express');
const router = express.Router();

const {
  createReport,
  getAllReports,
  getReportById,
  flagReport,
  getFlaggedReports,
  deleteReport
} = require('../controllers/reportController');

const { auth, isAdmin } = require('../middleware/auth');

// ✅ Public route — anyone can submit a report
router.post('/', createReport);

// ✅ Admin-only routes
router.get('/', auth, isAdmin, getAllReports);               // View all reports
router.get('/flagged', auth, isAdmin, getFlaggedReports);   // View flagged only
router.get('/:id', auth, isAdmin, getReportById);           // View single report by ID
router.patch('/:id/flag', auth, isAdmin, flagReport);       // Flag a report
router.delete('/:id', auth, isAdmin, deleteReport);         // Delete a report
router.patch('/:id/react', auth, reportController.reactToReport);
 
module.exports = router;
