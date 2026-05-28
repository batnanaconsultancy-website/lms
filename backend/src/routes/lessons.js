const express = require('express');
const r = express.Router();
const { getLesson, createLesson, updateLesson, deleteLesson, createModule } = require('../controllers/lessonController');
const { authenticate, requireInstructor } = require('../middleware/auth');

r.get('/:id',        authenticate, getLesson);
r.post('/',          authenticate, requireInstructor, createLesson);
r.patch('/:id',      authenticate, requireInstructor, updateLesson);
r.delete('/:id',     authenticate, requireInstructor, deleteLesson);
r.post('/modules',   authenticate, requireInstructor, createModule);

module.exports = r;
