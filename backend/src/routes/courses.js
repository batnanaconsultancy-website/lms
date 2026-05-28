// courses.js
const express = require('express');
const r = express.Router();
const c = require('../controllers/courseController');
const { authenticate, requireInstructor } = require('../middleware/auth');

r.get('/',          c.listCourses);
r.get('/mine',      authenticate, requireInstructor, c.getMyCourses);
r.get('/:slug',     c.getCourse);
r.post('/',         authenticate, requireInstructor, c.createCourse);
r.patch('/:id',     authenticate, requireInstructor, c.updateCourse);
r.delete('/:id',    authenticate, requireInstructor, c.deleteCourse);

module.exports = r;
