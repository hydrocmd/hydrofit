// ========================================
// HYDROFIT - MAIN APPLICATION (NO POINTS)
// ========================================

// Global variables
let currentUser = null;
let currentTab = "dashboard";

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
    
    // Switch to Register
    const showRegisterLink = document.getElementById('showRegister');
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Switching to register modal");
            showRegisterModal();
        });
    }
    
    // Switch to Login
    const showLoginLink = document.getElementById('showLogin');
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Switching to login modal");
            showLoginModal();
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
                <h3><i class="fas fa-user-graduate"></i> Student Info</h3>
                <div style="font-size: 1.2rem; font-weight: 600;">${escapeHtml(currentUser.fullName)}</div>
                <p>${currentUser.program} - Year ${currentUser.yearLevel}</p>
                <p>Section: ${currentUser.section}</p>
            </div>
            
            <div class="card">
                <h3><i class="fas fa-calendar-check"></i> Attendance</h3>
                <div style="font-size: 2rem; font-weight: 800;">${currentUser.attendanceCount || 0}</div>
                <p>Total classes attended</p>
                <button class="btn btn-sm mt-4" onclick="switchTab('attendance')">View Details →</button>
            </div>
            
            <div class="card">
                <h3><i class="fas fa-qrcode"></i> QR Code</h3>
                <p>Scan to identify yourself</p>
                <button class="btn btn-sm mt-4" onclick="showQRCode()">Show QR Code →</button>
            </div>
        </div>
    `;
    
    const quickActionsHtml = `
        <div class="card" style="margin-top: 20px;">
            <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <button class="btn" onclick="recordTodayAttendance()"><i class="fas fa-calendar-plus"></i> Record Attendance</button>
                <button class="btn btn-secondary" onclick="switchTab('profile')"><i class="fas fa-user"></i> My Profile</button>
                <button class="btn btn-secondary" onclick="switchTab('ranking')"><i class="fas fa-trophy"></i> View Rankings</button>
                <button class="btn btn-secondary" onclick="showQRCode()"><i class="fas fa-qrcode"></i> My QR Code</button>
            </div>
        </div>
    `;
    
    container.innerHTML = slideshowHtml + statsHtml + quickActionsHtml;
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
                <label>Program</label>
                <p>${currentUser.program}</p>
            </div>
            <div class="info-item">
                <label>Year Level</label>
                <p>${currentUser.yearLevel}</p>
            </div>
            <div class="info-item">
                <label>Section</label>
                <p>${currentUser.section}</p>
            </div>
            <div class="info-item">
                <label>Subject</label>
                <p>${currentUser.subject}</p>
            </div>
            <div class="info-item">
                <label>Total Attendance</label>
                <p>${currentUser.attendanceCount || 0}</p>
            </div>
        </div>
    `;
    
    container.innerHTML = profileHtml;
}

// ========================================
// RANKING (by attendance)
// ========================================

async function loadRanking() {
    const container = document.getElementById('tab-content');
    container.innerHTML = '<div class="loading-placeholder"><i class="fas fa-spinner fa-spin"></i> Loading rankings...</div>';
    
    const rankingData = await getRankingData();
    
    let overallHtml = `
        <div class="ranking-section">
            <h3><i class="fas fa-trophy"></i> Attendance Rankings</h3>
            <p style="margin-bottom: 20px; color: var(--primary);">Ranked by total class attendance</p>
            <table class="ranking-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Name</th>
                        <th>Program</th>
                        <th>Attendance</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    rankingData.forEach((student, index) => {
        const rank = index + 1;
        const rankDisplay = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
        overallHtml += `
            <tr ${student.fullName === currentUser.fullName ? 'style="background: #e3f2fd;"' : ''}>
                <td><strong>${rankDisplay}</strong></td>
                <td>${escapeHtml(student.fullName)}</td>
                <td>${student.program}</td>
                <td><strong>${student.attendanceCount}</strong> classes</td>
            </tr>
        `;
    });
    
    overallHtml += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = overallHtml;
}

// ========================================
// ACTIVITY LOG
// ========================================

async function loadActivity() {
    const container = document.getElementById('tab-content');
    container.innerHTML = '<div class="loading-placeholder"><i class="fas fa-spinner fa-spin"></i> Loading activity...</div>';
    
    const activities = await getUserActivity(currentUser.schoolId);
    
    let activityHtml = `
        <div class="card">
            <h3><i class="fas fa-history"></i> Recent Activities</h3>
            <div class="badge-list">
                <span class="badge">📅 Total Attendance: ${currentUser.attendanceCount || 0}</span>
            </div>
        </div>
        <div class="card mt-4">
            <h3><i class="fas fa-list"></i> Activity Log</h3>
    `;
    
    if (activities.length === 0) {
        activityHtml += '<p>No activities recorded yet.</p>';
    } else {
        activityHtml += '<div class="activity-list">';
        activities.forEach(activity => {
            activityHtml += `
                <div class="activity-item" style="padding: 12px; border-bottom: 1px solid var(--gray);">
                    <div class="flex-between">
                        <span><i class="fas fa-${activity.action === 'Login' ? 'sign-in-alt' : activity.action === 'Attendance' ? 'check-circle' : 'user-plus'}" style="color: var(--primary);"></i> ${activity.action}</span>
                        <span>${new Date(activity.timestamp).toLocaleDateString()}</span>
                    </div>
                    <small>${activity.details || ''}</small>
                </div>
            `;
        });
        activityHtml += '</div>';
    }
    
    activityHtml += '</div>';
    container.innerHTML = activityHtml;
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
            </div>
        </div>
        <div class="card mt-4">
            <h3><i class="fas fa-chart-line"></i> Attendance Progress</h3>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min((currentUser.attendanceCount / 20) * 100, 100)}%"></div>
            </div>
            <p class="mt-4">Target: 20 attendances per semester</p>
            <p class="mt-4">🎯 ${20 - (currentUser.attendanceCount || 0)} more to reach target!</p>
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
        timer: 'Exercise Timer',
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
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
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
    console.log('Slideshow initialized');
}

// Make functions global for HTML onclick handlers
window.switchTab = switchTab;
window.showQRCode = showQRCode;
window.recordTodayAttendance = recordTodayAttendance;
window.showToast = showToast;