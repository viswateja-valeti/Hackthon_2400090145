// index.js - login & routing logic

// Hardcoded users and admins
const admins = [
  { email: "admin@example.com", password: "admin123" }
];
const users = [
  { email: "user@example.com", password: "user123" }
];

// Global shared data between admin.js and user.js
window.appData = {
  courses: [
    { code: "CS101", title: "Intro to Computer Science", time: "Mon 09:00-11:00", seatsAvailable: 30, seatsTaken: 0 },
    { code: "MATH201", title: "Calculus I", time: "Tue 09:00-11:00", seatsAvailable: 25, seatsTaken: 0 },
    { code: "ENG150", title: "English Literature", time: "Wed 11:00-13:00", seatsAvailable: 20, seatsTaken: 0 },
  ],
  registrations: [] // { studentEmail, courseCode }
};

const loginScreen = document.getElementById('login-screen');
const adminDashboard = document.getElementById('admin-dashboard');
const userDashboard = document.getElementById('user-dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

let currentUser = null;
let isAdmin = false;

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  loginError.style.display = 'none';
  const email = loginForm.email.value.trim();
  const password = loginForm.password.value.trim();

  // Check admin login
  const adminMatch = admins.find(u => u.email === email && u.password === password);
  if (adminMatch) {
    currentUser = email;
    isAdmin = true;
    startAdminDashboard();
    return;
  }

  // Check user login
  const userMatch = users.find(u => u.email === email && u.password === password);
  if (userMatch) {
    currentUser = email;
    isAdmin = false;
    startUserDashboard();
    return;
  }

  // Show error
  loginError.textContent = 'Invalid email or password.';
  loginError.style.display = 'block';
});

function startAdminDashboard() {
  loginScreen.style.display = 'none';
  userDashboard.style.display = 'none';
  adminDashboard.style.display = 'block';

  // Initialize admin
  if (typeof initAdminDashboard === 'function') {
    initAdminDashboard(currentUser);
  }
}

function startUserDashboard() {
  loginScreen.style.display = 'none';
  adminDashboard.style.display = 'none';
  userDashboard.style.display = 'block';

  // Initialize user
  if (typeof initUserDashboard === 'function') {
    initUserDashboard(currentUser);
  }
}

// Logout buttons
document.getElementById('admin-logout').addEventListener('click', () => {
  logout();
});
document.getElementById('user-logout').addEventListener('click', () => {
  logout();
});

function logout() {
  currentUser = null;
  isAdmin = false;
  adminDashboard.style.display = 'none';
  userDashboard.style.display = 'none';
  loginScreen.style.display = 'block';
  loginForm.reset();
  loginError.style.display = 'none';
}
