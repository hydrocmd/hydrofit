// ========================================
// HYDROFIT - COMPLETE APPLICATION
// ========================================

let currentUser = null;
let currentTab = "dashboard";
let isTeacherMode = false;
let slideInterval = null;
let isLoading = false;
let html5QrCode = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log("HYDROFIT Initializing...");
    
    if (isTeacherLoggedIn()) {
        isTeacherMode = true;
        showTeacherApp();
    } else if (isLoggedIn()) {
        currentUser = getCurrentUser();
        showApp();
    } else {
        showLoginModal();
    }
    
    setupEventListeners();
});

function setupEventListeners() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) registerBtn.addEventListener('click', handleRegister);
    
    const showRegisterLink = document.getElementById('showRegister');
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            showRegisterModal();
        });
    }
    
    const showLoginLink = document.getElementById('showLogin');
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginModal();
        });
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('open');
        });
    }
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (isLoading) return;
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
            if (window.innerWidth <= 768) {
                document.querySelector('.sidebar').classList.remove('open');
            }
        });
    });
    
    const closeProfileBtn = document.getElementById('closeProfileModal');
    if (closeProfileBtn) {
        closeProfileBtn.addEventListener('click', () => {
            document.getElementById('profileModal').style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

function showLoadingOverlay() {
    isLoading = true;
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
        `;
        overlay.innerHTML = `<div style="background: white; padding: 30px; border-radius: 20px; text-align: center;">
            <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: var(--primary);"></i>
            <p style="margin-top: 15px;">Processing...</p>
        </div>`;
        document.body.appendChild(overlay);
    } else {
        overlay.style.display = 'flex';
    }
}

function hideLoadingOverlay() {
    isLoading = false;
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

function showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('registerModal').style.display = 'none';
    document.getElementById('loginSchoolId').value = '';
    document.getElementById('loginPassword').value = '';
}

function showRegisterModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('registerModal').style.display = 'flex';
}

function showApp() {
    document.querySelector('.app-container').style.display = 'flex';
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('registerModal').style.display = 'none';
    document.querySelectorAll('.teacher-only').forEach(btn => btn.style.display = 'none');
    switchTab('dashboard');
    updateUserDisplay();
}

function showTeacherApp() {
    document.querySelector('.app-container').style.display = 'flex';
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('registerModal').style.display = 'none';
    document.querySelectorAll('.teacher-only').forEach(btn => btn.style.display = 'flex');
    isTeacherMode = true;
    switchTab('teacher-dashboard');
}

async function handleLogin() {
    if (isLoading) return;
    
    const schoolId = document.getElementById('loginSchoolId').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (schoolId === "Prof.David" && password === "instructor") {
        showLoadingOverlay();
        const result = loginTeacher(schoolId, password);
        hideLoadingOverlay();
        if (result.success) {
            showToast(`Welcome Professor ${result.teacher.name}!`, 'success');
            showTeacherApp();
        } else {
            showToast(result.message, 'error');
        }
        return;
    }
    
    if (!schoolId || !password) {
        showToast('Please enter School ID and Password', 'error');
        return;
    }
    
    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn.innerHTML;
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    showLoadingOverlay();
    
    const result = await loginUser(schoolId, password);
    hideLoadingOverlay();
    
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
    if (isLoading) return;
    
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
    if (!userData.program || !userData.yearLevel) {
        showToast('Please select program and year level', 'error');
        return;
    }
    
    const registerBtn = document.getElementById('registerBtn');
    const originalText = registerBtn.innerHTML;
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    showLoadingOverlay();
    
    const result = await registerUser(userData);
    hideLoadingOverlay();
    
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
    if (isLoading) return;
    
    if (isTeacherMode) {
        logoutTeacher();
        isTeacherMode = false;
    } else {
        logoutUser();
        currentUser = null;
    }
    
    if (html5QrCode) {
        try { html5QrCode.stop(); } catch(e) {}
        html5QrCode = null;
    }
    
    document.querySelector('.sidebar').classList.remove('open');
    showLoginModal();
    showToast('Logged out successfully', 'success');
}

function switchTab(tabName) {
    if (isLoading) return;
    currentTab = tabName;
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabName) btn.classList.add('active');
    });
    
    const titles = {
        dashboard: 'HYDROFIT Dashboard', profile: 'My Profile', ranking: 'Ranking Board',
        activity: 'Activities', attendance: 'Class Tracker', 'teacher-dashboard': 'Teacher Dashboard',
        movement: 'Movement Library', workout: 'Workout Plans', timer: 'Exercise Timer',
        warmup: 'Warmup Generator', injury: 'Injury Prevention Guide', goals: 'Goal Planner',
        calorie: 'Calorie Tracker', bmi: 'BMI Tracker', recovery: 'Recovery & Rest'
    };
    
    document.getElementById('active-title').innerText = titles[tabName] || 'HYDROFIT';
    loadTabContent(tabName);
}

async function loadTabContent(tabName) {
    const container = document.getElementById('tab-content');
    container.innerHTML = '<div class="loading-placeholder"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    
    if (isTeacherMode && tabName === 'teacher-dashboard') {
        await loadTeacherDashboard();
    } else if (tabName === 'dashboard') {
        await loadDashboard();
    } else if (tabName === 'profile') {
        await loadProfile();
    } else if (tabName === 'ranking') {
        await loadRanking();
    } else if (tabName === 'activity') {
        await loadActivities();
    } else if (tabName === 'attendance') {
        await loadAttendanceTracker();
    } else {
        await loadGenericTab(tabName);
    }
}

async function loadDashboard() {
    const container = document.getElementById('tab-content');
    const stats = currentUser ? currentUser : { fullName: 'Student', program: 'Program', yearLevel: '1', section: 'A', attendanceCount: 0 };
    
    const slideshowHtml = `
        <div class="slideshow-wrapper">
            <div class="slideshow-container" id="slideshowContainer">
                <div class="slideshow-overlay">
                    <div class="school-badge">
                        <img src="https://via.placeholder.com/50x50/00b4d8/white?text=MinSU" alt="MinSU" class="minsu-logo">
                        <div class="school-text">
                            <strong>Mindoro State University</strong>
                            <span>Calapan City Campus</span>
                        </div>
                    </div>
                </div>
                <div class="slide active" style="background: linear-gradient(135deg, var(--primary), var(--primary-dark));">
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; text-align: center; flex-direction: column;">
                        <i class="fas fa-water" style="font-size: 4rem;"></i>
                        <h2 style="margin-top: 20px;">Welcome to HYDROFIT</h2>
                        <p>Gamified Fitness for Academic Success</p>
                    </div>
                </div>
                <div class="slide" style="background: linear-gradient(135deg, var(--success), #00cec9);">
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; text-align: center; flex-direction: column;">
                        <i class="fas fa-trophy" style="font-size: 4rem;"></i>
                        <h2 style="margin-top: 20px;">Track Your Progress</h2>
                        <p>Earn points and climb the rankings</p>
                    </div>
                </div>
                <div class="slide" style="background: linear-gradient(135deg, #fdcb6e, #f39c12);">
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; text-align: center; flex-direction: column;">
                        <i class="fas fa-dumbbell" style="font-size: 4rem;"></i>
                        <h2 style="margin-top: 20px;">Stay Active</h2>
                        <p>Complete workouts and challenges</p>
                    </div>
                </div>
            </div>
            <div class="slide-dots" id="slideDots"></div>
        </div>
    `;
    
    const statsHtml = `
        <div class="card-grid">
            <div class="card">
                <h3><i class="fas fa-user-graduate"></i> Student Info</h3>
                <div style="font-size: 1.2rem; font-weight: 600;">${escapeHtml(stats.fullName)}</div>
                <p>${stats.program} - Year ${stats.yearLevel}</p>
                <p>Section: ${stats.section}</p>
            </div>
            <div class="card">
                <h3><i class="fas fa-calendar-check"></i> Attendance</h3>
                <div style="font-size: 2rem; font-weight: 800;">${stats.attendanceCount || 0}</div>
                <p>Total classes attended</p>
                <button class="btn btn-sm mt-4" onclick="switchTab('attendance')">View Details →</button>
            </div>
            <div class="card">
                <h3><i class="fas fa-tasks"></i> Activities</h3>
                <p>Check your pending tasks</p>
                <button class="btn btn-sm mt-4" onclick="switchTab('activity')">View Activities →</button>
            </div>
        </div>
    `;
    
    container.innerHTML = slideshowHtml + statsHtml;
    initSlideshow();
}

function initSlideshow() {
    let slideIndex = 0;
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.querySelector('.slide-dots');
    if (!slides.length) return;
    
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.onclick = () => showSlide(i);
            dotsContainer.appendChild(dot);
        });
    }
    
    function showSlide(n) {
        slides.forEach(slide => slide.classList.remove('active'));
        if (dotsContainer) document.querySelectorAll('.dot').forEach(dot => dot.classList.remove('active'));
        slideIndex = n;
        if (slides[slideIndex]) slides[slideIndex].classList.add('active');
        if (dotsContainer && document.querySelectorAll('.dot')[slideIndex]) {
            document.querySelectorAll('.dot')[slideIndex].classList.add('active');
        }
    }
    
    function nextSlide() { slideIndex = (slideIndex + 1) % slides.length; showSlide(slideIndex); }
    if (slides[0]) slides[0].classList.add('active');
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
}

async function loadProfile() {
    const container = document.getElementById('tab-content');
    const user = currentUser;
    
    const profileHtml = `
        <div class="profile-card">
            <div class="profile-avatar"><i class="fas fa-user-circle"></i></div>
            <h2>${escapeHtml(user.fullName)}</h2>
            <p>${user.program} - Year ${user.yearLevel}</p>
            <p>Section: ${user.section} | Subject: ${user.subject || 'Pathfit'}</p>
        </div>
        <div class="profile-info-grid">
            <div class="info-item"><label>School ID</label><p>${user.schoolId}</p></div>
            <div class="info-item"><label>Program</label><p>${user.program}</p></div>
            <div class="info-item"><label>Year Level</label><p>${user.yearLevel}</p></div>
            <div class="info-item"><label>Section</label><p>${user.section}</p></div>
            <div class="info-item"><label>Subject</label><p>${user.subject || 'Pathfit'}</p></div>
            <div class="info-item"><label>Total Attendance</label><p>${user.attendanceCount || 0}</p></div>
        </div>
        <div class="card" style="text-align: center;">
            <h3><i class="fas fa-qrcode"></i> Your Unique QR Code</h3>
            <p>Show this QR code to your professor to record attendance</p>
            <div id="studentQRCode" style="display: flex; justify-content: center; margin: 20px 0;"></div>
            <button class="btn" id="downloadQRBtn"><i class="fas fa-download"></i> Download QR Code</button>
        </div>
    `;
    
    container.innerHTML = profileHtml;
    
    const qrContainer = document.getElementById('studentQRCode');
    const qrData = `${user.schoolId}|${user.fullName}|${user.program}`;
    
    if (typeof QRCode !== 'undefined') {
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
            text: qrData,
            width: 250,
            height: 250,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
    
    const downloadBtn = document.getElementById('downloadQRBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const canvas = qrContainer.querySelector('canvas');
            if (canvas) {
                const link = document.createElement('a');
                link.download = `${user.schoolId}_QR.png`;
                link.href = canvas.toDataURL();
                link.click();
                showToast('QR Code downloaded!', 'success');
            }
        });
    }
}

async function loadRanking() {
    const container = document.getElementById('tab-content');
    const ranking = await getRankingData();
    
    let html = `<div class="card"><h3><i class="fas fa-trophy"></i> Attendance Ranking Board</h3>
        <div style="overflow-x: auto;"><table class="ranking-table"><thead><tr><th>Rank</th><th>Student Name</th><th>Program</th><th>Attendance</th></tr></thead><tbody>`;
    
    ranking.forEach((student, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
        html += `<tr><td><strong>${medal}</strong></td><td>${escapeHtml(student.name)}</td><td>${student.program}</td><td><strong>${student.attendance}</strong> classes</td></tr>`;
    });
    
    html += `</tbody></table></div></div>`;
    container.innerHTML = html;
}

async function loadActivities() {
    const container = document.getElementById('tab-content');
    const activities = await getActivities();
    
    if (activities.length === 0) {
        container.innerHTML = `<div class="card"><h3><i class="fas fa-tasks"></i> Activities</h3><p style="padding: 40px; text-align: center;">No activities posted yet. Check back later!</p></div>`;
        return;
    }
    
    let html = `<div class="card"><h3><i class="fas fa-tasks"></i> Posted Activities & Assignments</h3><p style="margin-bottom: 20px; color: var(--primary);">Complete these tasks on time</p>`;
    activities.forEach(activity => {
        html += `<div style="padding: 15px; border-bottom: 1px solid var(--gray);">
            <div class="flex-between"><strong style="font-size: 1.1rem;">${escapeHtml(activity.title)}</strong><small style="color: var(--danger);">Due: ${activity.dueDate || 'No due date'}</small></div>
            <p style="margin-top: 10px;">${escapeHtml(activity.description)}</p>
            <small style="color: var(--primary);">Posted: ${new Date(activity.timestamp).toLocaleDateString()}</small>
        </div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

async function loadAttendanceTracker() {
    const container = document.getElementById('tab-content');
    const user = currentUser;
    
    container.innerHTML = `
        <div class="card"><h3><i class="fas fa-user-check"></i> My Attendance Record</h3>
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 4rem; font-weight: 800;">${user.attendanceCount || 0}</div>
                <p>Total Classes Attended</p>
                <p class="mt-4" style="font-size: 0.9rem; color: var(--primary);"><i class="fas fa-info-circle"></i> Attendance is recorded by scanning your QR code</p>
            </div>
        </div>
        <div class="card mt-4"><h3><i class="fas fa-chart-line"></i> Attendance Progress</h3>
            <div class="progress-bar"><div class="progress-fill" style="width: ${Math.min((user.attendanceCount / 20) * 100, 100)}%"></div></div>
            <p class="mt-4">Target: 20 attendances per semester</p>
            <p class="mt-4">🎯 ${20 - (user.attendanceCount || 0)} more to reach target!</p>
        </div>
    `;
}

async function loadTeacherDashboard() {
    const container = document.getElementById('tab-content');
    const teacher = getCurrentTeacher();
    
    const [students, activities, handouts, announcements] = await Promise.all([
        getAllStudents(), getActivities(), getHandouts(), getAnnouncements()
    ]);
    
    const dashboardHtml = `
        <div class="profile-card" style="margin-bottom: 30px;">
            <div class="profile-avatar"><i class="fas fa-chalkboard-teacher"></i></div>
            <h2>${teacher.name}</h2>
            <p>Professor of ${teacher.subject}</p>
        </div>
        <div class="teacher-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
            <button class="btn teacher-tab-btn active" data-teacher-tab="attendance">📋 QR Scanner & Attendance</button>
            <button class="btn btn-secondary teacher-tab-btn" data-teacher-tab="activities">📝 Activities</button>
            <button class="btn btn-secondary teacher-tab-btn" data-teacher-tab="handouts">📚 Handouts</button>
            <button class="btn btn-secondary teacher-tab-btn" data-teacher-tab="announcements">📢 Announcements</button>
        </div>
        <div id="teacherAttendanceTab" class="teacher-tab-content active">
            <div class="card"><h3><i class="fas fa-qrcode"></i> QR Code Scanner for Attendance</h3>
                <div style="text-align: center; padding: 20px;">
                    <div id="qr-reader" style="width: 100%; max-width: 300px; margin: 0 auto;"></div>
                    <div id="qr-result" style="margin-top: 20px;"></div>
                    <button class="btn mt-4" id="startScannerBtn">Start Scanner</button>
                    <button class="btn btn-secondary mt-4" id="stopScannerBtn" style="display: none;">Stop Scanner</button>
                    <p class="mt-4" style="font-size: 0.8rem; color: var(--primary);"><i class="fas fa-info-circle"></i> Students must show their QR code to record attendance</p>
                </div>
            </div>
            <div class="card mt-4"><h3><i class="fas fa-users"></i> Student Attendance Records</h3>${renderStudentAttendanceTable(students)}</div>
        </div>
        <div id="teacherActivitiesTab" class="teacher-tab-content" style="display: none;">
            <div class="card"><h3><i class="fas fa-plus-circle"></i> Publish Activity/Assignment</h3>
                <div class="form-group"><label>Activity Title</label><input type="text" id="activityTitle" class="modal-input" placeholder="Enter activity title"></div>
                <div class="form-group"><label>Description</label><textarea id="activityDesc" class="modal-input" rows="3" placeholder="Enter activity description"></textarea></div>
                <div class="form-group"><label>Due Date</label><input type="date" id="activityDueDate" class="modal-input"></div>
                <button class="btn" id="publishActivityBtn">Publish Activity</button>
            </div>
            <div class="card mt-4"><h3><i class="fas fa-list"></i> Published Activities</h3><div id="activitiesList">${renderActivitiesList(activities)}</div></div>
        </div>
        <div id="teacherHandoutsTab" class="teacher-tab-content" style="display: none;">
            <div class="card"><h3><i class="fas fa-upload"></i> Upload Learning Handout</h3>
                <div class="form-group"><label>Handout Title</label><input type="text" id="handoutTitle" class="modal-input" placeholder="Enter handout title"></div>
                <div class="form-group"><label>Description</label><textarea id="handoutDesc" class="modal-input" rows="3" placeholder="Enter handout description"></textarea></div>
                <div class="form-group"><label>File URL</label><input type="url" id="handoutUrl" class="modal-input" placeholder="https://..."></div>
                <button class="btn" id="uploadHandoutBtn">Upload Handout</button>
            </div>
            <div class="card mt-4"><h3><i class="fas fa-download"></i> Available Handouts</h3><div id="handoutsList">${renderHandoutsList(handouts)}</div></div>
        </div>
        <div id="teacherAnnouncementsTab" class="teacher-tab-content" style="display: none;">
            <div class="card"><h3><i class="fas fa-bullhorn"></i> Make Announcement</h3>
                <div class="form-group"><label>Announcement Title</label><input type="text" id="announcementTitle" class="modal-input" placeholder="Enter announcement title"></div>
                <div class="form-group"><label>Content</label><textarea id="announcementContent" class="modal-input" rows="4" placeholder="Enter announcement content"></textarea></div>
                <button class="btn" id="publishAnnouncementBtn">Publish Announcement</button>
            </div>
            <div class="card mt-4"><h3><i class="fas fa-history"></i> Previous Announcements</h3><div id="announcementsList">${renderAnnouncementsList(announcements)}</div></div>
        </div>
    `;
    
    container.innerHTML = dashboardHtml;
    
    setTimeout(() => setupQRScanner(), 100);
    
    document.getElementById('publishActivityBtn').onclick = async () => {
        const title = document.getElementById('activityTitle').value.trim();
        const description = document.getElementById('activityDesc').value.trim();
        const dueDate = document.getElementById('activityDueDate').value;
        if (!title) { showToast('Please enter activity title', 'error'); return; }
        const result = await publishActivity({ title, description, dueDate });
        if (result.success) {
            showToast('Activity published successfully!', 'success');
            document.getElementById('activityTitle').value = '';
            document.getElementById('activityDesc').value = '';
            document.getElementById('activityDueDate').value = '';
            const newActivities = await getActivities();
            document.getElementById('activitiesList').innerHTML = renderActivitiesList(newActivities);
        }
    };
    
    document.getElementById('uploadHandoutBtn').onclick = async () => {
        const title = document.getElementById('handoutTitle').value.trim();
        const description = document.getElementById('handoutDesc').value.trim();
        const fileUrl = document.getElementById('handoutUrl').value.trim();
        if (!title || !fileUrl) { showToast('Please enter title and file URL', 'error'); return; }
        const result = await uploadHandout({ title, description, fileUrl });
        if (result.success) {
            showToast('Handout uploaded successfully!', 'success');
            document.getElementById('handoutTitle').value = '';
            document.getElementById('handoutDesc').value = '';
            document.getElementById('handoutUrl').value = '';
            const newHandouts = await getHandouts();
            document.getElementById('handoutsList').innerHTML = renderHandoutsList(newHandouts);
        }
    };
    
    document.getElementById('publishAnnouncementBtn').onclick = async () => {
        const title = document.getElementById('announcementTitle').value.trim();
        const content = document.getElementById('announcementContent').value.trim();
        if (!title || !content) { showToast('Please enter title and content', 'error'); return; }
        const result = await publishAnnouncement({ title, content });
        if (result.success) {
            showToast('Announcement published successfully!', 'success');
            document.getElementById('announcementTitle').value = '';
            document.getElementById('announcementContent').value = '';
            const newAnnouncements = await getAnnouncements();
            document.getElementById('announcementsList').innerHTML = renderAnnouncementsList(newAnnouncements);
        }
    };
    
    document.querySelectorAll('.teacher-tab-btn').forEach(btn => {
        btn.onclick = function() {
            const tab = this.getAttribute('data-teacher-tab');
            document.querySelectorAll('.teacher-tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.teacher-tab-content').forEach(c => c.style.display = 'none');
            document.getElementById(`teacher${tab.charAt(0).toUpperCase() + tab.slice(1)}Tab`).style.display = 'block';
        };
    });
}

function setupQRScanner() {
    const startBtn = document.getElementById('startScannerBtn');
    const stopBtn = document.getElementById('stopScannerBtn');
    const resultDiv = document.getElementById('qr-result');
    
    if (!startBtn) return;
    
    const newStartBtn = startBtn.cloneNode(true);
    startBtn.parentNode.replaceChild(newStartBtn, startBtn);
    const newStopBtn = stopBtn.cloneNode(true);
    stopBtn.parentNode.replaceChild(newStopBtn, stopBtn);
    
    const finalStartBtn = document.getElementById('startScannerBtn');
    const finalStopBtn = document.getElementById('stopScannerBtn');
    
    finalStartBtn.onclick = async function() {
        if (resultDiv) resultDiv.innerHTML = '';
        
        if (typeof Html5Qrcode === 'undefined') {
            if (resultDiv) resultDiv.innerHTML = `<div style="color: red; padding: 10px; background: #f8d7da; border-radius: 8px;">❌ QR Scanner library not loaded. Please refresh the page.</div>`;
            showToast('QR Scanner library not loaded', 'error');
            return;
        }
        
        try {
            if (html5QrCode) {
                try { await html5QrCode.stop(); } catch(e) {}
                html5QrCode = null;
            }
            
            html5QrCode = new Html5Qrcode("qr-reader");
            const devices = await Html5Qrcode.getCameras();
            
            if (devices && devices.length > 0) {
                let cameraId = devices[0].id;
                for (let i = 0; i < devices.length; i++) {
                    if (devices[i].label.toLowerCase().includes('back') || devices[i].label.toLowerCase().includes('environment')) {
                        cameraId = devices[i].id;
                        break;
                    }
                }
                
                await html5QrCode.start(cameraId, { fps: 10, qrbox: { width: 250, height: 250 } },
                    async (decodedText) => {
                        console.log("QR Scanned:", decodedText);
                        
                        const parts = decodedText.split('|');
                        if (parts.length >= 2) {
                            const schoolId = parts[0];
                            const studentName = parts[1];
                            
                            showLoadingOverlay();
                            const result = await recordAttendance(schoolId);
                            hideLoadingOverlay();
                            
                            if (result.success) {
                                if (resultDiv) {
                                    resultDiv.innerHTML = `<div style="color: green; padding: 15px; background: #d4edda; border-radius: 8px; text-align: center;">
                                        <i class="fas fa-check-circle" style="font-size: 2rem;"></i><br>
                                        ✅ Attendance recorded for <strong>${escapeHtml(studentName)}</strong>!<br>
                                        Total attendance: <strong>${result.attendanceCount}</strong> classes
                                    </div>`;
                                }
                                showToast(`Attendance recorded for ${studentName}!`, 'success');
                                
                                const students = await getAllStudents();
                                const attendanceTable = document.querySelector('#teacherAttendanceTab .card.mt-4');
                                if (attendanceTable) {
                                    attendanceTable.innerHTML = `<h3><i class="fas fa-users"></i> Student Attendance Records</h3>${renderStudentAttendanceTable(students)}`;
                                }
                            } else {
                                if (resultDiv) {
                                    resultDiv.innerHTML = `<div style="color: red; padding: 15px; background: #f8d7da; border-radius: 8px; text-align: center;">
                                        <i class="fas fa-exclamation-circle" style="font-size: 2rem;"></i><br>
                                        ❌ ${result.message}
                                    </div>`;
                                }
                                showToast(result.message, 'error');
                            }
                        } else {
                            if (resultDiv) {
                                resultDiv.innerHTML = `<div style="color: red; padding: 15px; background: #f8d7da; border-radius: 8px; text-align: center;">
                                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem;"></i><br>
                                    ❌ Invalid QR code format
                                </div>`;
                            }
                        }
                        
                        setTimeout(async () => {
                            if (html5QrCode && html5QrCode.isScanning) {
                                try { await html5QrCode.stop(); html5QrCode = null; } catch(e) {}
                                finalStartBtn.style.display = 'inline-block';
                                finalStopBtn.style.display = 'none';
                            }
                        }, 5000);
                    },
                    (errorMessage) => { console.log("Scan error:", errorMessage); }
                );
                
                finalStartBtn.style.display = 'none';
                finalStopBtn.style.display = 'inline-block';
                showToast('Scanner started. Position QR code in front of camera.', 'success');
            } else {
                if (resultDiv) resultDiv.innerHTML = `<div style="color: red; padding: 10px; background: #f8d7da; border-radius: 8px;">❌ No cameras found on this device.</div>`;
                showToast('No camera found', 'error');
            }
        } catch (err) {
            console.error("Scanner error:", err);
            if (resultDiv) resultDiv.innerHTML = `<div style="color: red; padding: 10px; background: #f8d7da; border-radius: 8px;">❌ Camera error: ${err.message || err}</div>`;
            showToast(`Camera error: ${err.message || 'Check camera permissions'}`, 'error');
            finalStartBtn.style.display = 'inline-block';
            finalStopBtn.style.display = 'none';
        }
    };
    
    finalStopBtn.onclick = async function() {
        if (html5QrCode) {
            try { await html5QrCode.stop(); html5QrCode = null; } catch(e) {}
        }
        finalStartBtn.style.display = 'inline-block';
        finalStopBtn.style.display = 'none';
        if (resultDiv) resultDiv.innerHTML = '';
        showToast('Scanner stopped', 'info');
    };
}

function renderStudentAttendanceTable(students) {
    const studentsWithSurname = students.map(student => {
        let surname = student.fullName;
        if (student.fullName.includes(',')) surname = student.fullName.split(',')[0].trim();
        else surname = student.fullName.trim().split(' ').pop();
        return { ...student, surname: surname.toLowerCase(), originalSurname: surname };
    });
    studentsWithSurname.sort((a, b) => a.surname.localeCompare(b.surname));
    
    const programs = {};
    studentsWithSurname.forEach(student => {
        if (!programs[student.program]) programs[student.program] = {};
        if (!programs[student.program][student.yearLevel]) programs[student.program][student.yearLevel] = {};
        if (!programs[student.program][student.yearLevel][student.section]) programs[student.program][student.yearLevel][student.section] = [];
        programs[student.program][student.yearLevel][student.section].push(student);
    });
    
    let html = '';
    for (const [program, years] of Object.entries(programs)) {
        html += `<h4 style="margin-top: 20px; color: var(--primary);">${program}</h4>`;
        for (const [year, sections] of Object.entries(years)) {
            html += `<h5 style="margin-top: 15px; margin-left: 10px;">Year ${year}</h5>`;
            for (const [section, studentsList] of Object.entries(sections)) {
                html += `<h6 style="margin-top: 10px; margin-left: 20px;">Section: ${section}</h6>`;
                html += `<div style="overflow-x: auto; margin-left: 30px; margin-bottom: 20px;"><table class="ranking-table"><thead><tr><th>Student Name</th><th>School ID</th><th>Attendance</th></tr></thead><tbody>`;
                studentsList.forEach(s => {
                    html += `<tr><td>${escapeHtml(s.originalSurname)}</td><td>${s.schoolId}</td><td><strong>${s.attendanceCount || 0}</strong> classes</td></tr>`;
                });
                html += `</tbody></table></div>`;
            }
        }
    }
    return html || '<p>No students found.</p>';
}

function renderActivitiesList(activities) {
    if (activities.length === 0) return '<p>No activities published yet.</p>';
    return activities.map(act => `<div style="padding: 15px; border-bottom: 1px solid var(--gray);">
        <strong>${escapeHtml(act.title)}</strong>
        <small style="color: var(--primary); display: block;">Due: ${act.dueDate || 'No due date'}</small>
        <p style="margin-top: 8px;">${escapeHtml(act.description)}</p>
        <small>Posted: ${new Date(act.timestamp).toLocaleDateString()}</small>
    </div>`).join('');
}

function renderHandoutsList(handouts) {
    if (handouts.length === 0) return '<p>No handouts uploaded yet.</p>';
    return handouts.map(h => `<div style="padding: 15px; border-bottom: 1px solid var(--gray);">
        <strong>${escapeHtml(h.title)}</strong>
        <p>${escapeHtml(h.description)}</p>
        <a href="${h.fileUrl}" target="_blank" class="btn btn-sm">Download →</a>
        <small>Uploaded: ${new Date(h.timestamp).toLocaleDateString()}</small>
    </div>`).join('');
}

function renderAnnouncementsList(announcements) {
    if (announcements.length === 0) return '<p>No announcements yet.</p>';
    return announcements.map(a => `<div style="padding: 15px; border-bottom: 1px solid var(--gray);">
        <strong>${escapeHtml(a.title)}</strong>
        <small style="color: var(--primary); display: block;">Posted: ${new Date(a.timestamp).toLocaleDateString()}</small>
        <p style="margin-top: 8px;">${escapeHtml(a.content)}</p>
    </div>`).join('');
}

async function loadGenericTab(tabName) {
    const titles = {
        movement: 'Movement Library', workout: 'Workout Plans', timer: 'Exercise Timer',
        warmup: 'Warmup Generator', injury: 'Injury Prevention Guide', goals: 'Goal Planner',
        calorie: 'Calorie Tracker', bmi: 'BMI Tracker', recovery: 'Recovery & Rest'
    };
    
    let content = '';
    
    if (tabName === 'workout') {
        content = `
            <div class="card"><h3><i class="fas fa-dumbbell"></i> Workout Plans</h3>
                <div class="card-grid">
                    <div class="info-item"><h4>🏃 Full Body Workout</h4><p>30 mins • Beginner</p><button class="btn btn-sm mt-4">Start →</button></div>
                    <div class="info-item"><h4>💪 Upper Body Strength</h4><p>25 mins • Intermediate</p><button class="btn btn-sm mt-4">Start →</button></div>
                    <div class="info-item"><h4>🦵 Lower Body Focus</h4><p>30 mins • All levels</p><button class="btn btn-sm mt-4">Start →</button></div>
                </div>
            </div>
        `;
    } else if (tabName === 'timer') {
        content = `
            <div class="card"><h3><i class="fas fa-hourglass-half"></i> Exercise Timer</h3>
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 4rem; font-weight: 800; margin-bottom: 20px;" id="timerDisplay">00:00</div>
                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <button class="btn" onclick="setTimer(30)">30 sec</button>
                        <button class="btn" onclick="setTimer(60)">1 min</button>
                        <button class="btn" onclick="setTimer(300)">5 min</button>
                        <button class="btn" onclick="setTimer(600)">10 min</button>
                    </div>
                    <div style="margin-top: 20px;">
                        <button class="btn" id="startTimerBtn">Start</button>
                        <button class="btn btn-secondary" id="pauseTimerBtn">Pause</button>
                        <button class="btn btn-secondary" id="resetTimerBtn">Reset</button>
                    </div>
                </div>
            </div>
        `;
    } else if (tabName === 'bmi') {
        content = `
            <div class="card"><h3><i class="fas fa-weight-scale"></i> BMI Calculator</h3>
                <div style="padding: 20px;">
                    <div class="form-group"><label>Height (cm)</label><input type="number" id="bmiHeight" class="modal-input" placeholder="Enter height in cm"></div>
                    <div class="form-group"><label>Weight (kg)</label><input type="number" id="bmiWeight" class="modal-input" placeholder="Enter weight in kg"></div>
                    <button class="btn" id="calculateBmiBtn">Calculate BMI</button>
                    <div id="bmiResult" style="margin-top: 20px; padding: 15px; background: var(--light); border-radius: 12px;"></div>
                </div>
            </div>
        `;
        setTimeout(() => {
            const calcBtn = document.getElementById('calculateBmiBtn');
            if (calcBtn) {
                calcBtn.onclick = () => {
                    const height = parseFloat(document.getElementById('bmiHeight').value) / 100;
                    const weight = parseFloat(document.getElementById('bmiWeight').value);
                    if (height && weight) {
                        const bmi = weight / (height * height);
                        let category = '';
                        if (bmi < 18.5) category = 'Underweight';
                        else if (bmi < 25) category = 'Normal weight';
                        else if (bmi < 30) category = 'Overweight';
                        else category = 'Obese';
                        document.getElementById('bmiResult').innerHTML = `<strong>Your BMI: ${bmi.toFixed(1)}</strong><br>Category: ${category}`;
                    } else {
                        showToast('Please enter valid height and weight', 'error');
                    }
                };
            }
        }, 100);
    } else {
        content = `
            <div class="card"><h3><i class="fas fa-construction"></i> Coming Soon</h3>
                <p style="padding: 40px; text-align: center;">The <strong>${titles[tabName]}</strong> feature is currently under development.</p>
                <p style="text-align: center;">Stay tuned for updates!</p>
                <div style="text-align: center; margin-top: 20px;"><i class="fas fa-water" style="font-size: 3rem; color: var(--primary);"></i></div>
            </div>
        `;
    }
    
    document.getElementById('tab-content').innerHTML = content;
    
    if (tabName === 'timer') {
        let timerInterval = null;
        let timeLeft = 0;
        const timerDisplay = document.getElementById('timerDisplay');
        
        window.setTimer = (seconds) => {
            timeLeft = seconds;
            timerDisplay.textContent = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
        };
        
        document.getElementById('startTimerBtn').onclick = () => {
            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    timerDisplay.textContent = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
                    if (timeLeft === 0) {
                        clearInterval(timerInterval);
                        const bell = document.getElementById('loudBell');
                        if (bell) bell.play();
                        showToast('Time is up!', 'success');
                    }
                }
            }, 1000);
        };
        
        document.getElementById('pauseTimerBtn').onclick = () => {
            if (timerInterval) clearInterval(timerInterval);
            timerInterval = null;
        };
        
        document.getElementById('resetTimerBtn').onclick = () => {
            if (timerInterval) clearInterval(timerInterval);
            timerInterval = null;
            timeLeft = 0;
            timerDisplay.textContent = '00:00';
        };
    }
}

function updateUserDisplay() {
    localStorage.setItem("hydrofit_user", JSON.stringify(currentUser));
}

function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i><span>${message}</span>`;
    toast.style.cssText = `
        position: fixed; bottom: 20px; right: 20px;
        background: ${type === 'success' ? '#00b894' : type === 'error' ? '#d63031' : '#00b4d8'};
        color: white; padding: 12px 20px; border-radius: 12px;
        display: flex; align-items: center; gap: 10px; z-index: 9999;
        animation: slideInRight 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 0.9rem;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
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

window.switchTab = switchTab;
window.showToast = showToast;
window.setTimer = function(seconds) {
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        let timeLeft = seconds;
        timerDisplay.textContent = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
        window.currentTimerSeconds = seconds;
    }
};