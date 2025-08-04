const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  incidentType: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  witnesses: { type: String },
  evidence: { type: String },
  reporterType: { type: String, required: true },
  anonymous: { type: Boolean, default: true },
  contactInfo: { type: String },
  schoolNotification: { type: Boolean, default: false },
  parentNotification: { type: Boolean, default: false },
  referenceId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const Incident = mongoose.model('Incident', IncidentSchema);

module.exports = Incident;
