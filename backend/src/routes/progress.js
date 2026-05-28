const express = require('express');
const r = express.Router();
const { markLessonComplete, getCourseProgress, getStudentDashboardStats } = require('../controllers/progressController');
const { authenticate } = require('../middleware/auth');

r.post('/complete',             authenticate, markLessonComplete);
r.get('/course/:courseId',      authenticate, getCourseProgress);
r.get('/stats',                 authenticate, getStudentDashboardStats);
module.exports = r;
