import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: false,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        );
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout', { refreshToken: localStorage.getItem('refreshToken') }),
  me: () => api.get('/auth/me'),
};

// Courses
export const coursesAPI = {
  list: (params) => api.get('/courses', { params }),
  get: (slug) => api.get(`/courses/${slug}`),
  mine: () => api.get('/courses/mine'),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.patch(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

// Enrollments
export const enrollmentsAPI = {
  enroll: (courseId) => api.post('/enrollments', { courseId }),
  mine: () => api.get('/enrollments/mine'),
  check: (courseId) => api.get(`/enrollments/check/${courseId}`),
};

// Progress
export const progressAPI = {
  complete: (lessonId, watchTimeSeconds) => api.post('/progress/complete', { lessonId, watchTimeSeconds }),
  course: (courseId) => api.get(`/progress/course/${courseId}`),
  stats: () => api.get('/progress/stats'),
};

// Lessons
export const lessonsAPI = {
  get: (id) => api.get(`/lessons/${id}`),
  create: (data) => api.post('/lessons', data),
  update: (id, data) => api.patch(`/lessons/${id}`, data),
  createModule: (data) => api.post('/lessons/modules', data),
};

// Assignments
export const assignmentsAPI = {
  byCourse: (courseId) => api.get(`/assignments/course/${courseId}`),
  get: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data),
};

// Submissions
export const submissionsAPI = {
  submit: (data) => api.post('/submissions', data),
  mine: () => api.get('/submissions/mine'),
  byCourse: (courseId) => api.get(`/submissions/course/${courseId}`),
  grade: (id, data) => api.patch(`/submissions/${id}/grade`, data),
};

// Admin
export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  users: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
  courses: () => api.get('/admin/courses'),
};

export default api;
