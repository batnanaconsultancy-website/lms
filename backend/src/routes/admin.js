const express = require('express');
const r = express.Router();
const { getDashboardStats, listUsers, toggleUserActive, listAllCourses } = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

r.use(authenticate, requireAdmin);
r.get('/stats',           getDashboardStats);
r.get('/users',           listUsers);
r.patch('/users/:id/toggle', toggleUserActive);
r.get('/courses',         listAllCourses);
module.exports = r;
