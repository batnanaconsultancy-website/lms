const express = require('express');
const r = express.Router();
const { enroll, getMyEnrollments, checkEnrollment } = require('../controllers/enrollmentController');
const { authenticate } = require('../middleware/auth');

r.post('/',                         authenticate, enroll);
r.get('/mine',                      authenticate, getMyEnrollments);
r.get('/check/:courseId',           authenticate, checkEnrollment);

module.exports = r;
