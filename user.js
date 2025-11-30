const userCourseTableBody = document.querySelector('#user-course-table tbody');
const userScheduleTableBody = document.querySelector('#user-schedule-table tbody');
const userConflictWarning = document.getElementById('user-conflict-warning');

let currentUserEmail = null;

function initUserDashboard(userEmail) {
  currentUserEmail = userEmail;
  renderUserCourses();
  renderUserSchedule();
  userConflictWarning.textContent = '';
}

function renderUserCourses() {
  const courses = window.appData.courses;
  userCourseTableBody.innerHTML = "";

  courses.forEach(course => {
    const seatsLeft = course.seatsAvailable - course.seatsTaken;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${course.code}</td>
      <td>${course.title}</td>
      <td>${course.time}</td>
      <td>${seatsLeft}</td>
      <td>
        <button class="btn-add btn-small" data-code="${course.code}" ${seatsLeft <= 0 ? 'disabled' : ''}>Add</button>
      </td>
    `;
    userCourseTableBody.appendChild(tr);
  });

  userCourseTableBody.querySelectorAll('button.btn-add').forEach(btn => {
    btn.onclick = () => {
      const code = btn.dataset.code;
      addCourseForUser(code);
    };
  });
}

function renderUserSchedule() {
  userScheduleTableBody.innerHTML = "";

  const regs = window.appData.registrations.filter(r => r.studentEmail === currentUserEmail);

  regs.forEach(reg => {
    const course = window.appData.courses.find(c => c.code === reg.courseCode);
    if (!course) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${course.code}</td>
      <td>${course.title}</td>
      <td>${course.time}</td>
      <td><button class="btn-remove btn-small" data-code="${course.code}">Remove</button></td>
    `;
    userScheduleTableBody.appendChild(tr);
  });

  userScheduleTableBody.querySelectorAll('button.btn-remove').forEach(btn => {
    btn.onclick = () => {
      const code = btn.dataset.code;
      removeCourseForUser(code);
    };
  });

  checkUserConflicts();
}

function addCourseForUser(code) {
  const isAlreadyRegistered = window.appData.registrations.some(r => r.studentEmail === currentUserEmail && r.courseCode === code);
  if (isAlreadyRegistered) {
    alert('You already registered for this course.');
    return;
  }

  const course = window.appData.courses.find(c => c.code === code);
  if (!course) {
    alert('Course not found.');
    return;
  }
  const seatsLeft = course.seatsAvailable - course.seatsTaken;
  if (seatsLeft <= 0) {
    alert('No seats available for this course.');
    return;
  }

  const userRegs = window.appData.registrations.filter(r => r.studentEmail === currentUserEmail);
  const userCourses = userRegs.map(r => window.appData.courses.find(c => c.code === r.courseCode)).filter(Boolean);
  if (userCourses.some(c => c.time === course.time)) {
    alert('This course conflicts with your existing schedule.');
    return;
  }

  window.appData.registrations.push({ studentEmail: currentUserEmail, courseCode: code });
  updateSeatsTaken();

  renderUserCourses();
  renderUserSchedule();
}

function removeCourseForUser(code) {
  window.appData.registrations = window.appData.registrations.filter(r => !(r.studentEmail === currentUserEmail && r.courseCode === code));
  updateSeatsTaken();
  renderUserCourses();
  renderUserSchedule();
}

function updateSeatsTaken() {
  window.appData.courses.forEach(c => c.seatsTaken = 0);
  window.appData.registrations.forEach(r => {
    const course = window.appData.courses.find(c => c.code === r.courseCode);
    if (course) course.seatsTaken++;
  });
}

function checkUserConflicts() {
  const regs = window.appData.registrations.filter(r => r.studentEmail === currentUserEmail);
  const courses = regs.map(r => window.appData.courses.find(c => c.code === r.courseCode)).filter(Boolean);

  const times = {};
  let conflictFound = false;
  for (const c of courses) {
    if (times[c.time]) {
      conflictFound = true;
      break;
    }
    times[c.time] = true;
  }

  if (conflictFound) {
    userConflictWarning.textContent = 'Warning: You have scheduling conflicts!';
  } else {
    userConflictWarning.textContent = '';
  }
}
