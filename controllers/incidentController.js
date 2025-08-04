const Incident = require('../models/Incident');

// Simple in-memory counter (replace with better approach in prod)
let incidentCounter = 1;

function generateReferenceId() {
  const year = new Date().getFullYear();
  const id = String(incidentCounter).padStart(4, '0');
  incidentCounter += 1;
  return `RPT-${year}-${id}`;
}

exports.createIncident = async (req, res) => {
  try {
    const {
      incidentType,
      severity,
      description,
      location,
      date,
      time,
      witnesses,
      evidence,
      reporterType,
      anonymous,
      contactInfo,
      schoolNotification,
      parentNotification,
    } = req.body;

    if (!incidentType || !severity || !description || !location || !date || !time || !reporterType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const referenceId = generateReferenceId();

    const incident = new Incident({
      incidentType,
      severity,
      description,
      location,
      date: new Date(date),
      time,
      witnesses,
      evidence,
      reporterType,
      anonymous,
      contactInfo,
      schoolNotification,
      parentNotification,
      referenceId,
    });

    await incident.save();

    res.status(201).json({ message: 'Incident report created', referenceId });
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
