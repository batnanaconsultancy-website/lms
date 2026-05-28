const express = require('express');
const r = express.Router();
const ctrl = require('../controllers/assignmentController');
const { authenticate, requireInstructor } = require('../middleware/auth');

r.get('/course/:courseId',          authenticate, ctrl.getCourseAssignments);
r.get('/:id',                       authenticate, ctrl.getAssignment);
r.post('/',                         authenticate, requireInstructor, ctrl.createAssignment);
module.exports = r;
