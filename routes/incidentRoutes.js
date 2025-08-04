const express = require('express');
const { createIncident } = require('../controllers/incidentController');

const router = express.Router();

router.post('/incidents', createIncident);

module.exports = router;
