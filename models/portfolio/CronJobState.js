const mongoose = require('mongoose');

const CronJobStateSchema = new mongoose.Schema({
  jobName: String,
  lastRunTime: Date,
});

const CronJobState = mongoose.model('CronJobState', CronJobStateSchema);

module.exports = CronJobState; // Make sure to export it
