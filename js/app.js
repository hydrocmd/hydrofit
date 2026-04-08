// app.js - HYDROFIT Complete Application with Google Apps Script Integration

// Global variables
let currentUser = null;
let timerInterval = null;
let slideInterval = null;

// Default user data structure
let userData = {
  assessments: [],
  attendance: [],
  goals: []
};

// DOM Elements
const contentDiv = document.getElementById('tab-content');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const profileModal = document.getElementById('profileModal');

// Helper Functions
function showToast(msg, isError = false) {
  let toast = document.createElement('div');
  toast.innerText = msg;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.background = isError ? '#d63031' : '#2d3436';
  toast.style.color = 'white';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '40px';
  toast.style.zIndex = '9999';
  toast.style.fontWeight = 'bold';
  toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function playBeep() {
  let audio = document.getElementById('alertSound');
  if(audio) audio.play().catch(e=>console.log);
}

function playLoudBell() {
  let bell = document.getElementById('loudBell');
  if(bell) {
    bell.currentTime = 0;
    bell.play().catch(e=>console.log);
    setTimeout(() => bell.pause(), 3000);
  }
}

// ============ LOGIN / REGISTRATION WITH GOOGLE APPS SCRIPT ============

async function login(schoolId, password) {
  if (!schoolId || !password) {
    showToast('Please enter School ID and Password', true);
    return false;
  }
  
  const btn = document.getElementById('loginBtn');
  const inputs = document.querySelectorAll('#loginModal input');
  
  btn.disabled = true;
  inputs.forEach(input => input.disabled = true);
  btn.textContent = 'Logging in...';
  
  try {
    const result = await loginUser(schoolId, password);
    
    if (result && result.success) {
      currentUser = {
        schoolId: result.schoolId,
        fullName: result.fullName,
        program: result.program,
        subject: result.subject || 'Pathfit',
        yearLevel: result.yearLevel,
        section: result.section,
        sectionCode: result.sectionCode
      };
      
      // Store session
      sessionStorage.setItem('hydrofit_current_user', JSON.stringify(currentUser));
      
      // Load user data from sheets
      const attendanceResult = await getUserAttendance(schoolId);
      if (attendanceResult && attendanceResult.success) {
        userData.attendance = attendanceResult.attendance || [];
      }
      
      const assessmentsResult = await getUserAssessments(schoolId);
      if (assessmentsResult && assessmentsResult.success) {
        userData.assessments = assessmentsResult.assessments || [];
      }
      
      loginModal.style.display = 'none';
      showToast(`✅ Welcome ${result.fullName}!`);
      switchTab('dashboard');
      return true;
    } else {
      showToast(result?.message || 'Invalid School ID or Password', true);
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('Connection error. Please check your internet and try again.', true);
    return false;
  } finally {
    btn.disabled = false;
    inputs.forEach(input => input.disabled = false);
    btn.textContent = 'Login';
  }
}

async function register(registrationData) {
  // Validation
  if (!registrationData.fullName) {
    showToast('Please enter your full name', true);
    return false;
  }
  if (!registrationData.schoolId) {
    showToast('Please enter your School ID', true);
    return false;
  }
  if (!registrationData.program) {
    showToast('Please select your program', true);
    return false;
  }
  if (!registrationData.yearLevel) {
    showToast('Please select your year level', true);
    return false;
  }
  if (!registrationData.section) {
    showToast('Please enter your section', true);
    return false;
  }
  if (!registrationData.password) {
    showToast('Please enter a password', true);
    return false;
  }
  if (registrationData.password !== registrationData.confirmPassword) {
    showToast('Passwords do not match', true);
    return false;
  }
  
  const btn = document.getElementById('registerBtn');
  const inputs = document.querySelectorAll('#registerModal input, #registerModal select');
  
  btn.disabled = true;
  inputs.forEach(input => input.disabled = true);
  btn.textContent = 'Registering...';
  
  try {
    const result = await registerUser(registrationData);
    
    if (result && result.success) {
      showToast('✅ Registration successful! Please login.');
      registerModal.style.display = 'none';
      loginModal.style.display = 'flex';
      
      // Clear form
      document.getElementById('regFullName').value = '';
      document.getElementById('regSchoolId').value = '';
      document.getElementById('regSubject').value = '';
      document.getElementById('regProgram').value = '';
      document.getElementById('regYearLevel').value = '';
      document.getElementById('regSection').value = '';
      document.getElementById('regPassword').value = '';
      document.getElementById('regConfirmPassword').value = '';
      return true;
    } else {
      showToast(result?.message || 'Registration failed', true);
      return false;
    }
  } catch (error) {
    console.error('Registration error:', error);
    showToast('Connection error. Please check your internet and try again.', true);
    return false;
  } finally {
    btn.disabled = false;
    inputs.forEach(input => input.disabled = false);
    btn.textContent = 'Register';
  }
}

function logout() {
  if (slideInterval) clearInterval(slideInterval);
  currentUser = null;
  sessionStorage.removeItem('hydrofit_current_user');
  loginModal.style.display = 'flex';
  registerModal.style.display = 'none';
  profileModal.style.display = 'none';
  showToast('Logged out successfully');
}

function checkAuth() {
  const savedUser = sessionStorage.getItem('hydrofit_current_user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    loginModal.style.display = 'none';
    // Load data asynchronously
    Promise.all([
      getUserAttendance(currentUser.schoolId),
      getUserAssessments(currentUser.schoolId)
    ]).then(([attendanceResult, assessmentsResult]) => {
      if (attendanceResult && attendanceResult.success) {
        userData.attendance = attendanceResult.attendance || [];
      }
      if (assessmentsResult && assessmentsResult.success) {
        userData.assessments = assessmentsResult.assessments || [];
      }
      switchTab('dashboard');
    }).catch(() => {
      switchTab('dashboard');
    });
  } else {
    loginModal.style.display = 'flex';
  }
}

function showQRCode() {
  if (!currentUser) return;
  
  const qrContainer = document.getElementById('qrCodeContainer');
  qrContainer.innerHTML = '';
  
  const qrData = JSON.stringify({
    id: currentUser.schoolId,
    name: currentUser.fullName,
    program: currentUser.program,
    section: currentUser.section
  });
  
  new QRCode(qrContainer, {
    text: qrData,
    width: 200,
    height: 200
  });
  
  document.getElementById('qrUserInfo').innerHTML = `
    <strong>${currentUser.fullName}</strong><br>
    School ID: ${currentUser.schoolId}<br>
    Program: ${currentUser.program}<br>
    Section: ${currentUser.yearLevel}-${currentUser.section}
  `;
  
  profileModal.style.display = 'flex';
}

// Slideshow function with logo and MCC text
function initSlideshow() {
  const slides = [
    'https://ik.imagekit.io/0sf7uub8b/HydroFit/slides_1.jpg',
    'https://ik.imagekit.io/0sf7uub8b/HydroFit/slides_2.jpg',
    'https://ik.imagekit.io/0sf7uub8b/HydroFit/slides_3.jpg'
  ];
  
  if (slideInterval) clearInterval(slideInterval);
  
  let slideIndex = 0;
  const container = document.getElementById('slideshowContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  slides.forEach((slide, idx) => {
    const div = document.createElement('div');
    div.className = `slide ${idx === 0 ? 'active' : ''}`;
    div.style.backgroundImage = `url('${slide}')`;
    div.style.backgroundSize = 'cover';
    div.style.backgroundPosition = 'center';
    div.onerror = function() {
      this.style.backgroundImage = 'none';
      this.style.background = 'linear-gradient(135deg, var(--primary), var(--dark))';
      this.innerHTML = '<i class="fas fa-water" style="font-size: 80px;"></i>';
      this.style.display = 'flex';
      this.style.alignItems = 'center';
      this.style.justifyContent = 'center';
    };
    container.appendChild(div);
  });
  
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'slide-dots';
  slides.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = `dot ${idx === 0 ? 'active' : ''}`;
    dot.onclick = () => showSlide(idx);
    dotsContainer.appendChild(dot);
  });
  container.appendChild(dotsContainer);
  
  function showSlide(n) {
    const slideElements = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    slideElements.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    slideIndex = n;
    if (slideElements[slideIndex]) slideElements[slideIndex].classList.add('active');
    if (dots[slideIndex]) dots[slideIndex].classList.add('active');
  }
  
  slideInterval = setInterval(() => {
    slideIndex = (slideIndex + 1) % slides.length;
    showSlide(slideIndex);
  }, 5000);
  
  window.showSlide = showSlide;
}

// ============ RENDER FUNCTIONS ============

function renderDashboard() {
  if (!contentDiv) return;
  
  const firstName = currentUser?.fullName?.split(',')[0] || 'User';
  const sectionCode = currentUser?.yearLevel && currentUser?.section ? `${currentUser.yearLevel}-${currentUser.section}` : 'N/A';
  
  contentDiv.innerHTML = `
    <div class="slideshow-wrapper">
      <div class="slideshow-container" id="slideshowContainer"></div>
      <div class="slideshow-overlay">
        <div class="school-badge">
          <img src="https://ik.imagekit.io/0sf7uub8b/HydroFit/images%20(4).jpg" alt="Minsu Logo" class="minsu-logo" onerror="this.style.display='none'">
          <div class="school-text">
            <strong>MCC-Calapan Campus</strong>
            <span>Pathfit Department</span>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
        <div style="background: var(--primary); border-radius: 60px; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center;">
          <i class="fas fa-user" style="font-size: 35px; color: white;"></i>
        </div>
        <div style="flex: 1;">
          <h2>Welcome, ${firstName}!</h2>
          <p><strong>Program:</strong> ${currentUser?.program || 'N/A'}</p>
          <p><strong>School ID:</strong> ${currentUser?.schoolId || 'N/A'}</p>
          <p><strong>Section:</strong> ${sectionCode}</p>
        </div>
        <button class="btn" id="dashboardQRBtn"><i class="fas fa-qrcode"></i> Show QR Code</button>
      </div>
    </div>
  `;
  
  initSlideshow();
  document.getElementById('dashboardQRBtn')?.addEventListener('click', showQRCode);
}

function renderProfile() {
  if (!contentDiv) return;
  const sectionCode = currentUser?.yearLevel && currentUser?.section ? `${currentUser.yearLevel}-${currentUser.section}` : 'N/A';
  
  contentDiv.innerHTML = `
    <div class="profile-card">
      <div class="profile-avatar">
        <i class="fas fa-user"></i>
      </div>
      <h2>${currentUser?.fullName}</h2>
      <p>${currentUser?.program} Student</p>
      <div class="profile-info-grid">
        <div class="info-item">
          <label>School ID</label>
          <p>${currentUser?.schoolId}</p>
        </div>
        <div class="info-item">
          <label>Program</label>
          <p>${currentUser?.program}</p>
        </div>
        <div class="info-item">
          <label>Year Level</label>
          <p>${currentUser?.yearLevel || 'N/A'}</p>
        </div>
        <div class="info-item">
          <label>Section</label>
          <p>${sectionCode}</p>
        </div>
        <div class="info-item">
          <label>Subject</label>
          <p>${currentUser?.subject || 'Pathfit'}</p>
        </div>
        <div class="info-item">
          <label>Member Since</label>
          <p>${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
    <div class="card">
      <h3><i class="fas fa-chart-line"></i> Recent Activity</h3>
      <p>Total Assessments: ${userData.assessments?.length || 0}</p>
      <p>Total Attendances: ${userData.attendance?.length || 0}</p>
      <button class="btn btn-sm" id="refreshProfileBtn" onclick="refreshProfileData()"><i class="fas fa-sync-alt"></i> Refresh Data</button>
    </div>
  `;
}

async function refreshProfileData() {
  showToast('Refreshing data...');
  const attendanceResult = await getUserAttendance(currentUser.schoolId);
  if (attendanceResult && attendanceResult.success) {
    userData.attendance = attendanceResult.attendance || [];
  }
  const assessmentsResult = await getUserAssessments(currentUser.schoolId);
  if (assessmentsResult && assessmentsResult.success) {
    userData.assessments = assessmentsResult.assessments || [];
  }
  renderProfile();
  showToast('Data refreshed!');
}

async function renderRanking() {
  if (!contentDiv) return;
  
  contentDiv.innerHTML = `<div class="loading-placeholder">Loading rankings...</div>`;
  
  const sectionCode = currentUser?.yearLevel && currentUser?.section ? `${currentUser.yearLevel}-${currentUser.section}` : null;
  
  try {
    const result = await getRankings(currentUser?.program, sectionCode);
    
    if (!result || !result.success) {
      contentDiv.innerHTML = `<div class="card"><p>Error loading rankings. Please try again.</p><button class="btn" onclick="renderRanking()">Retry</button></div>`;
      return;
    }
    
    function renderRankTable(data, title) {
      if (!data || data.length === 0) {
        return `<div class="ranking-section"><h3>${title}</h3><p>No data available.</p></div>`;
      }
      
      let html = `<div class="ranking-section"><h3>${title}</h3><table class="ranking-table"><thead><tr><th>Rank</th><th>Name</th><th>Program/Section</th><th>Grade</th></tr></thead><tbody>`;
      
      let currentRank = 1;
      let prevGrade = null;
      let sameRankCount = 0;
      
      for (let i = 0; i < data.length; i++) {
        if (prevGrade !== null && data[i].grade < prevGrade) {
          currentRank += sameRankCount + 1;
          sameRankCount = 0;
        }
        
        const isTie = prevGrade !== null && data[i].grade === prevGrade;
        if (isTie) {
          sameRankCount++;
        } else {
          sameRankCount = 0;
        }
        
        const rankText = isTie ? '↳' : currentRank;
        
        html += `<tr ${isTie ? 'class="tied-rank"' : ''}>
          <td><strong>${rankText}</strong></td>
          <td>${data[i].fullName || data[i].name || 'N/A'}</td>
          <td>${data[i].program || data[i].sectionCode || 'N/A'}</td>
          <td><strong>${data[i].grade || data[i].score || 'N/A'}</strong></td>
        </tr>`;
        
        prevGrade = data[i].grade;
      }
      
      html += `</tbody></table></div>`;
      return html;
    }
    
    contentDiv.innerHTML = `
      ${renderRankTable(result.campus, "🏆 Campus Ranking (Top 15)")}
      ${renderRankTable(result.program, `📚 ${currentUser?.program} Program Ranking (Top 10)`)}
      ${renderRankTable(result.class, `👥 Class ${sectionCode} Ranking (Top 10)`)}
      <div style="text-align: center; margin-top: 20px;">
        <button class="btn btn-sm" onclick="renderRanking()"><i class="fas fa-sync-alt"></i> Refresh Rankings</button>
      </div>
    `;
  } catch (error) {
    console.error('Ranking error:', error);
    contentDiv.innerHTML = `<div class="card"><p>Error loading rankings. Please check your connection.</p><button class="btn" onclick="renderRanking()">Retry</button></div>`;
  }
}

function renderActivity() {
  contentDiv.innerHTML = `
    <div class="card">
      <h3><i class="fas fa-clipboard-list"></i> Fitness Activity Log</h3>
      <p>Track your fitness activities here.</p>
      <button class="btn" onclick="showToast('Activity logged!')">Log New Activity</button>
    </div>
    <div class="card">
      <h3><i class="fas fa-history"></i> Recent Assessments</h3>
      <div id="assessmentList">
        ${userData.assessments?.length > 0 ? 
          userData.assessments.slice(-5).map(a => `<div>📊 ${a.type || 'Assessment'}: Score ${a.score || 'N/A'} on ${a.date || 'N/A'}</div>`).join('') : 
          '<p>No assessments yet.</p>'}
      </div>
      <button class="btn btn-sm" id="addAssessmentBtn">Add Assessment</button>
    </div>
  `;
  
  document.getElementById('addAssessmentBtn')?.addEventListener('click', async () => {
    const type = prompt('Enter assessment type (e.g., Push-ups, Sit-ups):');
    const score = prompt('Enter your score:');
    if (type && score) {
      const result = await addAssessment(currentUser.schoolId, currentUser.fullName, type, parseInt(score));
      if (result && result.success) {
        showToast('Assessment recorded!');
        refreshProfileData();
        renderActivity();
      } else {
        showToast('Failed to record assessment', true);
      }
    }
  });
}

function renderMovementLib() { contentDiv.innerHTML = `<div class="card"><h3>Movement Library</h3><p>Exercise videos and instructions coming soon!</p></div>`; }
function renderAIAssist() { contentDiv.innerHTML = `<div class="card"><h3>AI Exercise Guide</h3><p>Get personalized workout recommendations.</p><button class="btn" onclick="showToast('AI Coach: Try 10 pushups!')">Ask AI</button></div>`; }
function renderScheduler() { contentDiv.innerHTML = `<div class="card"><h3>Workout Scheduler</h3><p>Plan your weekly workouts.</p><button class="btn">Set Schedule</button></div>`; }

function renderTimerSystem() {
  contentDiv.innerHTML = `
    <div class="card">
      <h3><i class="fas fa-hourglass-half"></i> Exercise Timer</h3>
      <div class="timer-inputs">
        <div class="timer-input-group">
          <label>Hours</label>
          <input type="number" id="hoursInput" min="0" max="23" value="0">
        </div>
        <div class="timer-input-group">
          <label>Minutes</label>
          <input type="number" id="minutesInput" min="0" max="59" value="0">
        </div>
        <div class="timer-input-group">
          <label>Seconds</label>
          <input type="number" id="secondsInput" min="0" max="59" value="30">
        </div>
      </div>
      <div class="timer-display" id="timerDisp">00:00:00</div>
      <button class="btn" id="startTimerBtn">Start Timer</button>
      <button class="btn btn-secondary" id="stopTimerBtn">Stop</button>
    </div>
  `;
  
  let timerIntervalVar = null;
  
  document.getElementById('startTimerBtn')?.addEventListener('click', () => {
    let hours = parseInt(document.getElementById('hoursInput').value) || 0;
    let minutes = parseInt(document.getElementById('minutesInput').value) || 0;
    let seconds = parseInt(document.getElementById('secondsInput').value) || 0;
    let totalSeconds = hours * 3600 + minutes * 60 + seconds;
    
    if (totalSeconds <= 0) {
      showToast('Please set a time greater than 0', true);
      return;
    }
    
    if (timerIntervalVar) clearInterval(timerIntervalVar);
    
    const display = document.getElementById('timerDisp');
    
    function updateDisplay() {
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      display.innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
      
      if (totalSeconds <= 0) {
        clearInterval(timerIntervalVar);
        playLoudBell();
        showToast('🔔 Time is up! Great work!');
        display.innerText = '00:00:00';
      }
      totalSeconds--;
    }
    
    updateDisplay();
    timerIntervalVar = setInterval(updateDisplay, 1000);
  });
  
  document.getElementById('stopTimerBtn')?.addEventListener('click', () => {
    if (timerIntervalVar) clearInterval(timerIntervalVar);
    showToast('Timer stopped');
  });
}

function renderWarmupGen() { contentDiv.innerHTML = `<div class="card"><h3>Warm-up Generator</h3><button class="btn" onclick="showToast('Arm circles, leg swings, light jog')">Generate Warmup</button></div>`; }
function renderInjuryGuide() { contentDiv.innerHTML = `<div class="card"><h3>Injury Prevention Guide</h3><p>✅ Proper form tips and safety guidelines.</p></div>`; }

function renderAttendance() { 
  contentDiv.innerHTML = `<div class="card"><h3>Class Attendance</h3><p>Total attendances: ${userData.attendance?.length || 0}</p><button class="btn" id="markClassAttend">Mark Present</button><div id="attendanceList" class="mt-4"></div></div>`;
  
  // Show attendance history
  const attendanceList = document.getElementById('attendanceList');
  if (attendanceList && userData.attendance && userData.attendance.length > 0) {
    attendanceList.innerHTML = `<h4>Recent Attendance:</h4><ul>${userData.attendance.slice(-10).map(a => `<li>✅ ${a.date || a}</li>`).join('')}</ul>`;
  }
  
  document.getElementById('markClassAttend')?.addEventListener('click', async () => { 
    const today = new Date().toISOString().split('T')[0];
    const result = await markAttendance(currentUser.schoolId, currentUser.fullName, today);
    if (result && result.success) {
      showToast('Attendance marked!');
      refreshProfileData();
      renderAttendance();
    } else {
      showToast(result?.message || 'Already marked today!', true);
    }
  });
}

function renderGoalPlanner() { contentDiv.innerHTML = `<div class="card"><h3>Goal Planner</h3><input id="goalInput" placeholder="Enter your fitness goal"><button id="setGoal" class="btn">Set Goal</button><div id="goalsList"></div></div>`;
  // Load goals from localStorage (temporary - can be moved to sheets)
  const savedGoals = JSON.parse(localStorage.getItem(`hydrofit_goals_${currentUser?.schoolId}`) || '[]');
  userData.goals = savedGoals;
  document.getElementById('setGoal')?.addEventListener('click', () => { let g = document.getElementById('goalInput').value; if(g){ userData.goals.push(g); localStorage.setItem(`hydrofit_goals_${currentUser?.schoolId}`, JSON.stringify(userData.goals)); renderGoalPlanner(); } });
  document.getElementById('goalsList').innerHTML = (userData.goals || []).map(g => `<div>🎯 ${g}</div>`).join('');
}
function renderBodyFocus() { contentDiv.innerHTML = `<div class="card"><h3>Body Focus Trainer</h3><select><option>Legs</option><option>Core</option><option>Arms</option></select><button class="btn">Start Workout</button></div>`; }
function renderCalorieTracker() { contentDiv.innerHTML = `<div class="card"><h3>Calorie Tracker</h3><input id="calMin" placeholder="Minutes"><button class="btn" id="calcCal">Calculate</button><div id="calRes"></div></div>`;
  document.getElementById('calcCal')?.addEventListener('click', () => { let min = parseInt(document.getElementById('calMin').value)||0; let cal = min*7; document.getElementById('calRes').innerHTML = `🔥 ${cal} kcal burned`; });
}
function renderBMITracker() { contentDiv.innerHTML = `<div class="card"><h3>BMI Tracker</h3><input id="bmiHeight" placeholder="Height (cm)"><input id="bmiWeight" placeholder="Weight (kg)"><button class="btn" id="calcBMI">Compute BMI</button><div id="bmiResult"></div></div>`;
  document.getElementById('calcBMI')?.addEventListener('click', () => { let h = parseFloat(document.getElementById('bmiHeight').value)/100; let w = parseFloat(document.getElementById('bmiWeight').value); let bmi = (w/(h*h)).toFixed(1); document.getElementById('bmiResult').innerHTML = `BMI: ${bmi} - ${bmi<18.5?'Underweight':bmi<25?'Normal':'Overweight'}`; });
}
function renderRecovery() { contentDiv.innerHTML = `<div class="card"><h3>Recovery Tracker</h3><p>Track your rest and recovery days.</p><button class="btn">Log Rest Day</button></div>`; }
function renderBodyType() { contentDiv.innerHTML = `<div class="card"><h3>Body Type Identifier</h3><select><option>Ectomorph (slim)</option><option>Mesomorph (athletic)</option><option>Endomorph (curvy)</option></select><button class="btn">Identify</button></div>`; }

// Tab switching
function renderTab(tabId) {
  switch(tabId) {
    case 'dashboard': renderDashboard(); break;
    case 'profile': renderProfile(); break;
    case 'ranking': renderRanking(); break;
    case 'activity': renderActivity(); break;
    case 'movement': renderMovementLib(); break;
    case 'ai-assist': renderAIAssist(); break;
    case 'scheduler': renderScheduler(); break;
    case 'timer': renderTimerSystem(); break;
    case 'warmup': renderWarmupGen(); break;
    case 'injury': renderInjuryGuide(); break;
    case 'attendance': renderAttendance(); break;
    case 'goals': renderGoalPlanner(); break;
    case 'bodyparts': renderBodyFocus(); break;
    case 'calorie': renderCalorieTracker(); break;
    case 'bmi': renderBMITracker(); break;
    case 'recovery': renderRecovery(); break;
    case 'bodytype': renderBodyType(); break;
    default: renderDashboard();
  }
}

function switchTab(tabId) {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  let activeBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  const titleElement = document.getElementById('active-title');
  if (titleElement) titleElement.innerText = activeBtn?.innerText?.trim() || 'HYDROFIT';
  renderTab(tabId);
  document.querySelector('.sidebar')?.classList.remove('open');
}

// Mobile menu toggle
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.querySelector('.sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !menuBtn.contains(e.target) && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    });
  }
}

// Make refresh function global for onclick
window.refreshProfileData = refreshProfileData;
window.renderRanking = renderRanking;

// ============ EVENT LISTENERS ============

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    let tab = btn.getAttribute('data-tab');
    switchTab(tab);
  });
});

document.getElementById('logoutBtn')?.addEventListener('click', logout);
document.getElementById('showRegister')?.addEventListener('click', (e) => {
  e.preventDefault();
  loginModal.style.display = 'none';
  registerModal.style.display = 'flex';
});
document.getElementById('showLogin')?.addEventListener('click', (e) => {
  e.preventDefault();
  registerModal.style.display = 'none';
  loginModal.style.display = 'flex';
});
document.getElementById('closeProfileModal')?.addEventListener('click', () => {
  profileModal.style.display = 'none';
});
document.getElementById('loginBtn')?.addEventListener('click', async () => {
  const schoolId = document.getElementById('loginSchoolId').value;
  const password = document.getElementById('loginPassword').value;
  await login(schoolId, password);
});
document.getElementById('registerBtn')?.addEventListener('click', async () => {
  const registrationData = {
    fullName: document.getElementById('regFullName').value,
    schoolId: document.getElementById('regSchoolId').value,
    subject: document.getElementById('regSubject').value,
    program: document.getElementById('regProgram').value,
    yearLevel: document.getElementById('regYearLevel').value,
    section: document.getElementById('regSection').value,
    password: document.getElementById('regPassword').value,
    confirmPassword: document.getElementById('regConfirmPassword').value
  };
  await register(registrationData);
});

window.addEventListener('click', (e) => {
  if (e.target === loginModal) loginModal.style.display = 'none';
  if (e.target === registerModal) registerModal.style.display = 'none';
  if (e.target === profileModal) profileModal.style.display = 'none';
});

document.getElementById('loginPassword')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById('loginBtn').click();
});

// ============ INITIALIZATION ============

async function init() {
  initMobileMenu();
  
  // Test API connection
  if (typeof CONFIG !== 'undefined' && CONFIG.API_URL) {
    initSheetDB(CONFIG.API_URL);
    const testResult = await testAPIConnection();
    if (testResult && testResult.success) {
      console.log('✅ API connected successfully');
    } else {
      console.warn('⚠️ API connection issue, using fallback mode');
    }
  }
  
  checkAuth();
}

// Make functions global for HTML onclick
window.showToast = showToast;
window.addAssessment = addAssessment;
window.markAttendance = markAttendance;

// Start the app
init();