const express = require('express');
const r = express.Router();
const ctrl = require('../controllers/assignmentController');
const { authenticate, requireInstructor } = require('../middleware/auth');

r.post('/',                           authenticate, ctrl.submitAssignment);
r.get('/mine',                        authenticate, ctrl.getMySubmissions);
r.get('/course/:courseId',            authenticate, requireInstructor, ctrl.getCourseSubmissions);
r.patch('/:id/grade',                 authenticate, requireInstructor, ctrl.gradeSubmission);
module.exports = r;
