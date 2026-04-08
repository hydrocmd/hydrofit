// ========================================
// HYDROFIT - MAIN APPLICATION
// ========================================

// Global variables
let currentUser = null;
let currentTab = "dashboard";
let workoutChart = null;

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("HYDROFIT Initializing...");
    
    // Check if user is logged in
    if (isLoggedIn()) {
        currentUser = getCurrentUser();
        showApp();
    } else {
        showLoginModal();
    }
    
    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // Register button
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', handleRegister);
    }
    
    // Switch to Register - IMPORTANT FIX
    const showRegisterLink = document.getElementById('showRegister');
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Switching to register modal");
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('registerModal').style.display = 'flex';
        });
    }
    
    // Switch to Login
    const showLoginLink = document.getElementById('showLogin');
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Switching to login modal");
            document.getElementById('registerModal').style.display = 'none';
            document.getElementById('loginModal').style.display = 'flex';
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('open');
        });
    }
    
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
            // Close mobile menu on mobile
            if (window.innerWidth <= 768) {
                document.querySelector('.sidebar').classList.remove('open');
            }
        });
    });
    
    // Close profile modal
    const closeProfileBtn = document.getElementById('closeProfileModal');
    if (closeProfileBtn) {
        closeProfileBtn.addEventListener('click', function() {
            document.getElementById('profileModal').style.display = 'none';
        });
    }
    
    // Click outside modal to close
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Enter key press for login
    const loginPassword = document.getElementById('loginPassword');
    if (loginPassword) {
        loginPassword.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
    
    // Enter key press for register
    const regConfirmPassword = document.getElementById('regConfirmPassword');
    if (regConfirmPassword) {
        regConfirmPassword.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleRegister();
            }
        });
    }
}

// ========================================
// MODAL FUNCTIONS
// ========================================

function showLoginModal() {
    console.log("Showing login modal");
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('registerModal').style.display = 'none';
    
    // Clear inputs
    document.getElementById('loginSchoolId').value = '';
    document.getElementById('loginPassword').value = '';
}

function showRegisterModal() {
    console.log("Showing register modal");
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('registerModal').style.display = 'flex';
    
    // Clear register form
    document.getElementById('regFullName').value = '';
    document.getElementById('regSchoolId').value = '';
    document.getElementById('regSubject').value = '';
    document.getElementById('regProgram').value = '';
    document.getElementById('regYearLevel').value = '';
    document.getElementById('regSection').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regConfirmPassword').value = '';
}

function showApp() {
    console.log("Showing main app");
    document.querySelector('.app-container').style.display = 'flex';
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('registerModal').style.display = 'none';
    
    // Load dashboard by default
    switchTab('dashboard');
    
    // Update user display
    updateUserDisplay();
}

// ========================================
// AUTHENTICATION HANDLERS
// ========================================

async function handleLogin() {
    console.log("Login attempt...");
    
    const schoolId = document.getElementById('loginSchoolId').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!schoolId || !password) {
        showToast('Please enter School ID and Password', 'error');
        return;
    }
    
    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn.innerHTML;
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    
    const result = await loginUser(schoolId, password);
    
    if (result.success) {
        currentUser = result.user;
        showToast(`Welcome back, ${currentUser.fullName}!`, 'success');
        showApp();
    } else {
        showToast(result.message, 'error');
        loginBtn.disabled = false;
        loginBtn.innerHTML = originalText;
    }
}

async function handleRegister() {
    console.log("Register attempt...");
    
    const userData = {
        fullName: document.getElementById('regFullName').value.trim(),
        schoolId: document.getElementById('regSchoolId').value.trim(),
        subject: document.getElementById('regSubject').value.trim(),
        program: document.getElementById('regProgram').value,
        yearLevel: document.getElementById('regYearLevel').value,
        section: document.getElementById('regSection').value.trim(),
        password: document.getElementById('regPassword').value,
        confirmPassword: document.getElementById('regConfirmPassword').value
    };
    
    // Validation
    if (!userData.fullName || !userData.schoolId || !userData.password) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (userData.password !== userData.confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (userData.password.length < 4) {
        showToast('Password must be at least 4 characters', 'error');
        return;
    }
    
    if (!userData.program) {
        showToast('Please select your program', 'error');
        return;
    }
    
    if (!userData.yearLevel) {
        showToast('Please select your year level', 'error');
        return;
    }
    
    const registerBtn = document.getElementById('registerBtn');
    const originalText = registerBtn.innerHTML;
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    
    const result = await registerUser(userData);
    
    if (result.success) {
        showToast('Account created successfully! Please login.', 'success');
        // Clear form
        document.getElementById('regFullName').value = '';
        document.getElementById('regSchoolId').value = '';
        document.getElementById('regSubject').value = '';
        document.getElementById('regProgram').value = '';
        document.getElementById('regYearLevel').value = '';
        document.getElementById('regSection').value = '';
        document.getElementById('regPassword').value = '';
        document.getElementById('regConfirmPassword').value = '';
        // Show login modal
        showLoginModal();
    } else {
        showToast(result.message, 'error');
        registerBtn.disabled = false;
        registerBtn.innerHTML = originalText;
    }
}

function handleLogout() {
    console.log("Logging out...");
    logoutUser();
    currentUser = null;
    document.querySelector('.sidebar').classList.remove('open');
    showLoginModal();
    showToast('Logged out successfully', 'success');
}

// ========================================
// UI FUNCTIONS
// ========================================

function switchTab(tabName) {
    console.log("Switching to tab:", tabName);
    currentTab = tabName;
    
    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update title
    const titles = {
        dashboard: 'HYDROFIT Dashboard',
        profile: 'My Profile',
        ranking: 'Ranking Board',
        activity: 'Activity Log',
        movement: 'Movement Library',
        'ai-assist': 'AI Exercise Guide',
        scheduler: 'Workout Scheduler',
        timer: 'Exercise Timer',
        warmup: 'Warmup Generator',
        injury: 'Injury Prevention Guide',
        attendance: 'Class Tracker',
        goals: 'Goal Planner',
        bodyparts: 'Body Focus',
        calorie: 'Calorie Tracker',
        bmi: 'BMI Tracker',
        recovery: 'Recovery & Rest',
        bodytype: 'Body Type Analysis'
    };
    
    document.getElementById('active-title').innerText = titles[tabName] || 'HYDROFIT';
    
    // Load tab content
    loadTabContent(tabName);
}

async function loadTabContent(tabName) {
    const container = document.getElementById('tab-content');
    container.innerHTML = '<div class="loading-placeholder"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    
    switch(tabName) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'profile':
            await loadProfile();
            break;
        case 'ranking':
            await loadRanking();
            break;
        case 'activity':
            await loadActivity();
            break;
        case 'timer':
            loadTimer();
            break;
        case 'attendance':
            await loadAttendanceTracker();
            break;
        default:
            await loadGenericTab(tabName);
    }
}

// ========================================
// DASHBOARD
// ========================================

async function loadDashboard() {
    const container = document.getElementById('tab-content');
    
    const slideshowHtml = `
        <div class="slideshow-wrapper">
            <div class="slideshow-container" id="slideshowContainer">
                <div class="slideshow-overlay">
                    <div class="school-badge">
                        <img src="https://upload.wikimedia.org/wikipedia/en/thumb/c/c9/Mindoro_State_University_seal.png/200px-Mindoro_State_University_seal.png" alt="MinSU" class="minsu-logo" onerror="this.style.display='none'">
                        <div class="school-text">
                            <strong>Mindoro State University</strong>
                            <span>Calapan City Campus</span>
                        </div>
                    </div>
                </div>
                <div class="slide active slide-placeholder" style="background: linear-gradient(135deg, var(--primary), var(--dark));">
                    <i class="fas fa-water" style="font-size: 5rem; margin-right: 20px;"></i>
                    <span>HYDROFIT</span>
                </div>
            </div>
            <div class="slide-dots" id="slideDots"></div>
        </div>
    `;
    
    const statsHtml = `
        <div class="card-grid">
            <div class="card">
                <h3><i class="fas fa-star"></i> Total Points</h3>
                <div class="flex-between">
                    <span style="font-size: 2rem; font-weight: 800;">${currentUser.totalPoints || 0}</span>
                    <i class="fas fa-trophy" style="font-size: 2rem; color: gold;"></i>
                </div>
                <div class="progress-bar mt-4">
                    <div class="progress-fill" style="width: ${Math.min((currentUser.totalPoints / 1000) * 100, 100)}%"></div>
                </div>
                <p class="mt-4">Next level: ${1000 - (currentUser.totalPoints % 1000)} points to go</p>
            </div>
            
            <div class="card">
                <h3><i class="fas fa-dumbbell"></i> Workouts</h3>
                <div style="font-size: 2rem; font-weight: 800;">${currentUser.workoutsCompleted || 0}</div>
                <p>Total workouts completed</p>
                <button class="btn btn-sm mt-4" onclick="switchTab('timer')">Start Workout →</button>
            </div>
            
            <div class="card">
                <h3><i class="fas fa-calendar-check"></i> Attendance</h3>
                <div style="font-size: 2rem; font-weight: 800;">${currentUser.attendanceCount || 0}</div>
                <p>Classes attended</p>
                <button class="btn btn-sm mt-4" onclick="recordTodayAttendance()">Record Today →</button>
            </div>
        </div>
    `;
    
    const quickActionsHtml = `
        <div class="card" style="margin-top: 20px;">
            <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <button class="btn" onclick="switchTab('timer')"><i class="fas fa-play-circle"></i> Start Workout</button>
                <button class="btn btn-secondary" onclick="switchTab('warmup')"><i class="fas fa-sun"></i> Warmup</button>
                <button class="btn btn-secondary" onclick="switchTab('ai-assist')"><i class="fas fa-robot"></i> AI Guide</button>
                <button class="btn btn-secondary" onclick="showQRCode()"><i class="fas fa-qrcode"></i> My QR Code</button>
            </div>
        </div>
    `;
    
    container.innerHTML = slideshowHtml + statsHtml + quickActionsHtml;
    
    // Initialize slideshow
    initSlideshow();
}

// ========================================
// PROFILE
// ========================================

async function loadProfile() {
    const container = document.getElementById('tab-content');
    
    const profileHtml = `
        <div class="profile-card">
            <div class="profile-avatar">
                <i class="fas fa-user-circle"></i>
            </div>
            <h2>${escapeHtml(currentUser.fullName)}</h2>
            <p>${currentUser.program} - Year ${currentUser.yearLevel}</p>
            <p>Section: ${currentUser.section} | Subject: ${currentUser.subject}</p>
            <button class="btn mt-4" onclick="showQRCode()"><i class="fas fa-qrcode"></i> Show QR Code</button>
        </div>
        
        <div class="profile-info-grid">
            <div class="info-item">
                <label>School ID</label>
                <p>${currentUser.schoolId}</p>
            </div>
            <div class="info-item">
                <label>Total Points</label>
                <p>${currentUser.totalPoints || 0}</p>
            </div>
            <div class="info-item">
                <label>Workouts Completed</label>
                <p>${currentUser.workoutsCompleted || 0}</p>
            </div>
            <div class="info-item">
                <label>Attendance Count</label>
                <p>${currentUser.attendanceCount || 0}</p>
            </div>
            <div class="info-item">
                <label>Member Since</label>
                <p>${new Date().toLocaleDateString()}</p>
            </div>
        </div>
        
        <div class="card mt-4">
            <h3><i class="fas fa-chart-line"></i> Progress Chart</h3>
            <canvas id="progressChart"></canvas>
        </div>
    `;
    
    container.innerHTML = profileHtml;
    
    // Load progress chart
    loadProgressChart();
}

// ========================================
// RANKING
// ========================================

async function loadRanking() {
    const container = document.getElementById('tab-content');
    container.innerHTML = '<div class="loading-placeholder"><i class="fas fa-spinner fa-spin"></i> Loading rankings...</div>';
    
    const rankingData = await getRankingData();
    
    let overallHtml = '<div class="ranking-section"><h3><i class="fas fa-trophy"></i> Overall Rankings</h3><table class="ranking-table"><thead><tr><th>Rank</th><th>Name</th><th>Program</th><th>Points</th><th>Workouts</th></tr></thead><tbody>';
    
    rankingData.forEach((student, index) => {
        const rank = index + 1;
        const rankClass = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
        overallHtml += `
            <tr ${student.fullName === currentUser.fullName ? 'style="background: #e3f2fd;"' : ''}>
                <td>${rankClass}</td>
                <td>${escapeHtml(student.fullName)}</td>
                <td>${student.program}</td>
                <td><strong>${student.totalPoints}</strong></td>
                <td>${student.workoutsCompleted}</td>
            </tr>
        `;
    });
    
    overallHtml += '</tbody></table></div>';
    container.innerHTML = overallHtml;
}

// ========================================
// ACTIVITY LOG
// ========================================

async function loadActivity() {
    const container = document.getElementById('tab-content');
    container.innerHTML = '<div class="loading-placeholder"><i class="fas fa-spinner fa-spin"></i> Loading activity...</div>';
    
    const workouts = await getUserWorkouts(currentUser.schoolId);
    
    let activityHtml = `
        <div class="card">
            <h3><i class="fas fa-history"></i> Recent Activities</h3>
            <div class="badge-list">
                <span class="badge">🏋️ Workouts: ${currentUser.workoutsCompleted || 0}</span>
                <span class="badge">📅 Attendance: ${currentUser.attendanceCount || 0}</span>
                <span class="badge">⭐ Points: ${currentUser.totalPoints || 0}</span>
            </div>
        </div>
        <div class="card mt-4">
            <h3><i class="fas fa-dumbbell"></i> Workout History</h3>
    `;
    
    if (workouts.length === 0) {
        activityHtml += '<p>No workouts recorded yet. Start your first workout!</p>';
    } else {
        activityHtml += '<div class="activity-list">';
        workouts.forEach(workout => {
            activityHtml += `
                <div class="activity-item" style="padding: 12px; border-bottom: 1px solid var(--gray);">
                    <div class="flex-between">
                        <span><i class="fas fa-check-circle" style="color: var(--success);"></i> ${escapeHtml(workout.activity)}</span>
                        <span>${new Date(workout.timestamp).toLocaleDateString()}</span>
                    </div>
                    <small>+${workout.points} points</small>
                </div>
            `;
        });
        activityHtml += '</div>';
    }
    
    activityHtml += '</div>';
    container.innerHTML = activityHtml;
}

// ========================================
// EXERCISE TIMER
// ========================================

function loadTimer() {
    const container = document.getElementById('tab-content');
    
    const timerHtml = `
        <div class="card">
            <h3><i class="fas fa-hourglass-half"></i> Exercise Timer</h3>
            <div class="timer-inputs">
                <div class="timer-input-group">
                    <label>Minutes</label>
                    <input type="number" id="timerMinutes" value="0" min="0" max="99">
                </div>
                <div class="timer-input-group">
                    <label>Seconds</label>
                    <input type="number" id="timerSeconds" value="30" min="0" max="59">
                </div>
            </div>
            <div class="timer-display" id="timerDisplay">00:30</div>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button class="btn" id="startTimerBtn"><i class="fas fa-play"></i> Start</button>
                <button class="btn btn-secondary" id="pauseTimerBtn" disabled><i class="fas fa-pause"></i> Pause</button>
                <button class="btn btn-secondary" id="resetTimerBtn"><i class="fas fa-redo"></i> Reset</button>
            </div>
            <div class="mt-4" style="text-align: center;">
                <p>Complete a workout to earn <strong>10 points</strong>!</p>
                <button class="btn" id="completeWorkoutBtn" style="margin-top: 10px;"><i class="fas fa-check-circle"></i> Complete Workout</button>
            </div>
        </div>
    `;
    
    container.innerHTML = timerHtml;
    
    // Timer variables
    let timerInterval = null;
    let timeLeft = 30;
    let isRunning = false;
    
    const minutesInput = document.getElementById('timerMinutes');
    const secondsInput = document.getElementById('timerSeconds');
    const timerDisplay = document.getElementById('timerDisplay');
    const startBtn = document.getElementById('startTimerBtn');
    const pauseBtn = document.getElementById('pauseTimerBtn');
    const resetBtn = document.getElementById('resetTimerBtn');
    const completeBtn = document.getElementById('completeWorkoutBtn');
    
    function updateDisplay() {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    function getTotalSeconds() {
        return (parseInt(minutesInput.value) || 0) * 60 + (parseInt(secondsInput.value) || 0);
    }
    
    function startTimer() {
        if (isRunning) return;
        const totalSeconds = getTotalSeconds();
        if (totalSeconds > 0) {
            timeLeft = totalSeconds;
            updateDisplay();
        }
        isRunning = true;
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
                if (timeLeft === 0) {
                    stopTimer();
                    playSound();
                    showToast('Time is up! Great job!', 'success');
                }
            }
        }, 1000);
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        minutesInput.disabled = true;
        secondsInput.disabled = true;
    }
    
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        isRunning = false;
    }
    
    function pauseTimer() {
        stopTimer();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
    
    function resetTimer() {
        stopTimer();
        minutesInput.disabled = false;
        secondsInput.disabled = false;
        const totalSeconds = getTotalSeconds();
        timeLeft = totalSeconds > 0 ? totalSeconds : 30;
        updateDisplay();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
    
    function playSound() {
        const audio = document.getElementById('loudBell');
        if (audio) {
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
    }
    
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    minutesInput.addEventListener('input', resetTimer);
    secondsInput.addEventListener('input', resetTimer);
    
    // Complete workout button
    completeBtn.addEventListener('click', async () => {
        const duration = getTotalSeconds();
        if (duration === 0) {
            showToast('Please set a timer duration first', 'warning');
            return;
        }
        
        completeBtn.disabled = true;
        completeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recording...';
        
        const result = await recordWorkout(currentUser.schoolId, 'Exercise Timer', duration);
        
        if (result.success) {
            currentUser.workoutsCompleted = result.workoutsCompleted;
            currentUser.totalPoints = result.newPoints;
            updateUserDisplay();
            showToast(result.message, 'success');
        } else {
            showToast(result.message, 'error');
        }
        
        completeBtn.disabled = false;
        completeBtn.innerHTML = '<i class="fas fa-check-circle"></i> Complete Workout';
    });
    
    resetTimer();
}

// ========================================
// ATTENDANCE TRACKER
// ========================================

async function loadAttendanceTracker() {
    const container = document.getElementById('tab-content');
    
    const attendanceHtml = `
        <div class="card">
            <h3><i class="fas fa-user-check"></i> Class Attendance</h3>
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 4rem; font-weight: 800;">${currentUser.attendanceCount || 0}</div>
                <p>Total Classes Attended</p>
                <button class="btn mt-4" id="recordAttendanceBtn"><i class="fas fa-calendar-plus"></i> Record Today's Attendance</button>
                <p class="mt-4" style="font-size: 0.8rem; color: var(--primary);">Each attendance gives you <strong>15 points</strong>!</p>
            </div>
        </div>
        <div class="card mt-4">
            <h3><i class="fas fa-chart-line"></i> Attendance Progress</h3>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min((currentUser.attendanceCount / 20) * 100, 100)}%"></div>
            </div>
            <p class="mt-4">Target: 20 attendances per semester</p>
        </div>
    `;
    
    container.innerHTML = attendanceHtml;
    
    const recordBtn = document.getElementById('recordAttendanceBtn');
    if (recordBtn) {
        recordBtn.addEventListener('click', recordTodayAttendance);
    }
}

async function recordTodayAttendance() {
    const btn = document.getElementById('recordAttendanceBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recording...';
    }
    
    const result = await recordAttendance(currentUser.schoolId);
    
    if (result.success) {
        currentUser.attendanceCount = result.attendanceCount;
        currentUser.totalPoints = result.newPoints;
        updateUserDisplay();
        showToast(result.message, 'success');
        loadAttendanceTracker();
    } else {
        showToast(result.message, 'error');
    }
    
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-calendar-plus"></i> Record Today\'s Attendance';
    }
}

// ========================================
// GENERIC TAB
// ========================================

async function loadGenericTab(tabName) {
    const container = document.getElementById('tab-content');
    
    const titles = {
        movement: 'Movement Library',
        'ai-assist': 'AI Exercise Guide',
        scheduler: 'Workout Scheduler',
        warmup: 'Warmup Generator',
        injury: 'Injury Prevention Guide',
        goals: 'Goal Planner',
        bodyparts: 'Body Focus',
        calorie: 'Calorie Tracker',
        bmi: 'BMI Tracker',
        recovery: 'Recovery & Rest',
        bodytype: 'Body Type Analysis'
    };
    
    container.innerHTML = `
        <div class="card">
            <h3><i class="fas fa-construction"></i> Coming Soon</h3>
            <p style="padding: 40px; text-align: center;">The <strong>${titles[tabName]}</strong> feature is currently under development.</p>
            <p style="text-align: center;">Stay tuned for updates!</p>
            <div style="text-align: center; margin-top: 20px;">
                <i class="fas fa-water" style="font-size: 3rem; color: var(--primary);"></i>
            </div>
        </div>
    `;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function updateUserDisplay() {
    // Update localStorage
    localStorage.setItem("hydrofit_user", JSON.stringify(currentUser));
}

function showQRCode() {
    const qrContainer = document.getElementById('qrCodeContainer');
    const userInfo = document.getElementById('qrUserInfo');
    
    qrContainer.innerHTML = '';
    
    const qrData = JSON.stringify({
        schoolId: currentUser.schoolId,
        name: currentUser.fullName,
        program: currentUser.program
    });
    
    // Use QRCode library
    if (typeof QRCode !== 'undefined') {
        new QRCode(qrContainer, {
            text: qrData,
            width: 200,
            height: 200
        });
    } else {
        qrContainer.innerHTML = '<p>QR Code library loading...</p>';
    }
    
    userInfo.innerHTML = `<strong>${escapeHtml(currentUser.fullName)}</strong><br>School ID: ${currentUser.schoolId}<br>${currentUser.program} - Year ${currentUser.yearLevel}`;
    
    document.getElementById('profileModal').style.display = 'flex';
}

function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00b894' : type === 'error' ? '#d63031' : '#00b4d8'};
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 0.9rem;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function initSlideshow() {
    // Placeholder for slideshow functionality
    console.log('Slideshow initialized');
}

async function loadProgressChart() {
    const ctx = document.getElementById('progressChart')?.getContext('2d');
    if (!ctx) return;
    
    // Destroy existing chart if any
    if (workoutChart) {
        workoutChart.destroy();
    }
    
    workoutChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Points Earned',
                data: [currentUser.totalPoints ? Math.floor(currentUser.totalPoints * 0.25) : 0, 
                       currentUser.totalPoints ? Math.floor(currentUser.totalPoints * 0.5) : 0,
                       currentUser.totalPoints ? Math.floor(currentUser.totalPoints * 0.75) : 0,
                       currentUser.totalPoints || 0],
                borderColor: '#00b4d8',
                backgroundColor: 'rgba(0, 180, 216, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Make functions global for HTML onclick handlers
window.switchTab = switchTab;
window.showQRCode = showQRCode;
window.recordTodayAttendance = recordTodayAttendance;
window.showToast = showToast;