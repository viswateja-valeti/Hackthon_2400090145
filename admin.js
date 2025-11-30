// admin.js - admin dashboard functionality

// Using window.appData from index.js

// DOM references
const courseTableBody = document.querySelector('#course-table tbody');
const registrationsTableBody = document.querySelector('#registrations-table tbody');
const conflictsList = document.getElementById('conflicts-list');
const addCourseForm = document.getElementById('add-course-form');

function initAdminDashboard(adminEmail) {
  renderAdminCourses();
  renderRegistrations();
  renderConflicts();

  addCourseForm.onsubmit = e => {
    e.preventDefault();
    addNewCourse();
  };
}

function renderAdminCourses() {
  const courses = window.appData.courses;
  courseTableBody.innerHTML = "";
  courses.forEach(course => {
    const seatsLeft = course.seatsAvailable - course.seatsTaken;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${course.code}</td>
      <td>${course.title}</td>
      <td>${course.time}</td>
      <td>${seatsLeft}</td>
      <td>
        <button class="btn-remove btn-small" data-code="${course.code}">Delete</button>
      </td>
    `;
    courseTableBody.appendChild(tr);
  });

  // Add delete event listeners
  courseTableBody.querySelectorAll('button.btn-remove').forEach(btn => {
    btn.onclick = () => {
      const code = btn.dataset.code;
      deleteCourse(code);
    };
  });
}

function addNewCourse() {
  const code = addCourseForm['course-code'].value.trim();
  const title = addCourseForm['course-title'].value.trim();
  const time = addCourseForm['course-time'].value;
  const seats = parseInt(addCourseForm['course-seats'].value, 10);

  if (!code || !title || !time || isNaN(seats) || seats <= 0) {
    alert('Please fill all fields correctly.');
    return;
  }

  // Check duplicate code
  if (window.appData.courses.find(c => c.code === code)) {
    alert('Course code already exists.');
    return;
  }

  window.appData.courses.push({
    code, title, time,
    seatsAvailable: seats,
    seatsTaken: 0
  });

  addCourseForm.reset();
  renderAdminCourses();
}

function deleteCourse(code) {
  // Remove from courses
  window.appData.courses = window.appData.courses.filter(c => c.code !== code);
  // Remove registrations for this course
  window.appData.registrations = window.appData.registrations.filter(r => r.courseCode !== code);

  renderAdminCourses();
  renderRegistrations();
  renderConflicts();
}

function renderRegistrations() {
  registrationsTableBody.innerHTML = "";
  window.appData.registrations.forEach(reg => {
    const course = window.appData.courses.find(c => c.code === reg.courseCode);
    if (!course) return; // safety

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${reg.studentEmail}</td>
      <td>${course.code}</td>
      <td>${course.title}</td>
      <td>${course.time}</td>
      <td><button class="btn-remove btn-small" data-student="${reg.studentEmail}" data-code="${course.code}">Remove</button></td>
    `;
    registrationsTableBody.appendChild(tr);
  });

  registrationsTableBody.querySelectorAll('button.btn-remove').forEach(btn => {
    btn.onclick = () => {
      const student = btn.dataset.student;
      const code = btn.dataset.code;
      removeRegistration(student, code);
    };
  });
}

function removeRegistration(studentEmail, courseCode) {
  // Remove registration
  window.appData.registrations = window.appData.registrations.filter(r => !(r.studentEmail === studentEmail && r.courseCode === courseCode));
  
  // Update seatsTaken count
  updateSeatsTaken();

  renderRegistrations();
  renderAdminCourses();
  renderConflicts();
}

function updateSeatsTaken() {
  // Reset seatsTaken counts
  window.appData.courses.forEach(c => c.seatsTaken = 0);
  window.appData.registrations.forEach(r => {
    const course = window.appData.courses.find(c => c.code === r.courseCode);
    if (course) course.seatsTaken++;
  });
}

function renderConflicts() {
  conflictsList.innerHTML = "";

  // Find students with scheduling conflicts:
  // For each student, find courses registered, check if any overlap in times.
  const regs = window.appData.registrations;
  const students = [...new Set(regs.map(r => r.studentEmail))];

  let conflictMessages = [];

  students.forEach(student => {
    const coursesForStudent = regs.filter(r => r.studentEmail === student)
      .map(r => window.appData.courses.find(c => c.code === r.courseCode))
      .filter(Boolean);

    // Compare each pair for time conflict
    for (let i = 0; i < coursesForStudent.length; i++) {
      for (let j = i + 1; j < coursesForStudent.length; j++) {
        if (coursesForStudent[i].time === coursesForStudent[j].time) {
          conflictMessages.push(`Student <b>${student}</b> has a conflict: <b>${coursesForStudent[i].code}</b> and <b>${coursesForStudent[j].code}</b> both at <i>${coursesForStudent[i].time}</i>`);
        }
      }
    }
  });

  if (conflictMessages.length === 0) {
    conflictsList.innerHTML = "<p>No scheduling conflicts found.</p>";
  } else {
    conflictsList.innerHTML = conflictMessages.map(msg => `<p>${msg}</p>`).join("");
  }
}

// To keep seatsTaken accurate on load
updateSeatsTaken();
