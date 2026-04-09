// ========================================
// HYDROFIT - GOOGLE SHEETS INTEGRATION
// ========================================

// ========================================
// TEACHER AUTHENTICATION
// ========================================

function loginTeacher(schoolId, password) {
    if (schoolId === TEACHER_CREDENTIALS.schoolId && password === TEACHER_CREDENTIALS.password) {
        localStorage.setItem("hydrofit_teacher_logged_in", "true");
        localStorage.setItem("hydrofit_teacher", JSON.stringify(TEACHER_CREDENTIALS));
        return { success: true, teacher: TEACHER_CREDENTIALS };
    }
    return { success: false, message: "Invalid teacher credentials" };
}

function isTeacherLoggedIn() {
    return localStorage.getItem("hydrofit_teacher_logged_in") === "true";
}

function getCurrentTeacher() {
    const teacherJson = localStorage.getItem("hydrofit_teacher");
    if (teacherJson) {
        return JSON.parse(teacherJson);
    }
    return null;
}

function logoutTeacher() {
    localStorage.removeItem("hydrofit_teacher_logged_in");
    localStorage.removeItem("hydrofit_teacher");
}

// ========================================
// DEMO MODE - STORAGE FUNCTIONS
// ========================================

function initDemoData() {
    if (!localStorage.getItem("hydrofit_students")) {
        localStorage.setItem("hydrofit_students", JSON.stringify(DEMO_STUDENTS));
    }
    if (!localStorage.getItem("hydrofit_activities")) {
        localStorage.setItem("hydrofit_activities", JSON.stringify([]));
    }
    if (!localStorage.getItem("hydrofit_handouts")) {
        localStorage.setItem("hydrofit_handouts", JSON.stringify([]));
    }
    if (!localStorage.getItem("hydrofit_announcements")) {
        localStorage.setItem("hydrofit_announcements", JSON.stringify([]));
    }
}

initDemoData();

// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

async function loginUser(schoolId, password) {
    try {
        // Try Google Sheets first
        if (GOOGLE_SHEETS_URL && GOOGLE_SHEETS_URL.includes("script.google.com")) {
            const formData = new URLSearchParams();
            formData.append("action", "login");
            formData.append("schoolId", schoolId);
            formData.append("password", password);
            
            const response = await fetch(GOOGLE_SHEETS_URL, { 
                method: "POST", 
                body: formData,
                mode: 'cors'
            }).catch(() => null);
            
            if (response && response.ok) {
                const result = await response.json();
                if (result.success) {
                    const userData = {
                        schoolId: result.schoolId,
                        fullName: result.fullName,
                        program: result.program,
                        yearLevel: result.yearLevel,
                        section: result.section,
                        subject: result.subject,
                        attendanceCount: result.attendanceCount || 0,
                        lastLogin: new Date().toISOString()
                    };
                    localStorage.setItem("hydrofit_user", JSON.stringify(userData));
                    localStorage.setItem("hydrofit_logged_in", "true");
                    return { success: true, user: userData };
                }
            }
        }
        
        // Fallback to demo mode
        const students = JSON.parse(localStorage.getItem("hydrofit_students"));
        const student = students.find(s => s.schoolId === schoolId && s.password === password);
        
        if (student) {
            const userData = {
                schoolId: student.schoolId,
                fullName: student.fullName,
                program: student.program,
                yearLevel: student.yearLevel,
                section: student.section,
                subject: student.subject || "Pathfit",
                attendanceCount: student.attendanceCount || 0,
                lastLogin: new Date().toISOString()
            };
            localStorage.setItem("hydrofit_user", JSON.stringify(userData));
            localStorage.setItem("hydrofit_logged_in", "true");
            return { success: true, user: userData };
        }
        
        return { success: false, message: "Invalid School ID or Password" };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: "Network error. Please try again." };
    }
}

async function registerUser(userData) {
    try {
        const students = JSON.parse(localStorage.getItem("hydrofit_students"));
        
        if (students.find(s => s.schoolId === userData.schoolId)) {
            return { success: false, message: "School ID already registered" };
        }
        
        const newStudent = {
            schoolId: userData.schoolId,
            fullName: userData.fullName,
            program: userData.program,
            yearLevel: userData.yearLevel,
            section: userData.section,
            subject: userData.subject,
            attendanceCount: 0,
            password: userData.password
        };
        
        students.push(newStudent);
        localStorage.setItem("hydrofit_students", JSON.stringify(students));
        
        return { success: true, message: "Account created successfully!" };
    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, message: "Registration failed. Please try again." };
    }
}

function getCurrentUser() {
    const userJson = localStorage.getItem("hydrofit_user");
    if (userJson) {
        return JSON.parse(userJson);
    }
    return null;
}

function isLoggedIn() {
    return localStorage.getItem("hydrofit_logged_in") === "true";
}

function logoutUser() {
    localStorage.removeItem("hydrofit_user");
    localStorage.removeItem("hydrofit_logged_in");
}

// ========================================
// ATTENDANCE FUNCTIONS
// ========================================

async function recordAttendance(schoolId) {
    try {
        const students = JSON.parse(localStorage.getItem("hydrofit_students"));
        const studentIndex = students.findIndex(s => s.schoolId === schoolId);
        
        if (studentIndex === -1) {
            return { success: false, message: "Student not found" };
        }
        
        const today = new Date().toISOString().split('T')[0];
        const attendanceKey = `attendance_${schoolId}`;
        const attendanceHistory = JSON.parse(localStorage.getItem(attendanceKey) || '[]');
        
        if (attendanceHistory.includes(today)) {
            return { success: false, message: "Attendance already recorded today" };
        }
        
        attendanceHistory.push(today);
        localStorage.setItem(attendanceKey, JSON.stringify(attendanceHistory));
        
        students[studentIndex].attendanceCount = (students[studentIndex].attendanceCount || 0) + 1;
        localStorage.setItem("hydrofit_students", JSON.stringify(students));
        
        // Update current user if it's the same
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.schoolId === schoolId) {
            currentUser.attendanceCount = students[studentIndex].attendanceCount;
            localStorage.setItem("hydrofit_user", JSON.stringify(currentUser));
        }
        
        return { 
            success: true, 
            message: "Attendance recorded successfully",
            attendanceCount: students[studentIndex].attendanceCount
        };
    } catch (error) {
        console.error("Record attendance error:", error);
        return { success: false, message: "Failed to record attendance" };
    }
}

async function getAllStudents() {
    try {
        const students = JSON.parse(localStorage.getItem("hydrofit_students"));
        return students;
    } catch (error) {
        console.error("Get students error:", error);
        return [];
    }
}

async function getRankingData() {
    try {
        const students = JSON.parse(localStorage.getItem("hydrofit_students"));
        const ranking = students
            .map(s => ({ name: s.fullName, attendance: s.attendanceCount || 0, program: s.program }))
            .sort((a, b) => b.attendance - a.attendance);
        return ranking;
    } catch (error) {
        console.error("Get ranking error:", error);
        return [];
    }
}

// ========================================
// TEACHER DASHBOARD FUNCTIONS
// ========================================

async function publishActivity(activityData) {
    try {
        const activities = JSON.parse(localStorage.getItem("hydrofit_activities") || '[]');
        const newActivity = {
            id: Date.now(),
            ...activityData,
            timestamp: new Date().toISOString()
        };
        activities.unshift(newActivity);
        localStorage.setItem("hydrofit_activities", JSON.stringify(activities));
        return { success: true, message: "Activity published successfully!" };
    } catch (error) {
        console.error("Publish activity error:", error);
        return { success: false, message: "Failed to publish activity" };
    }
}

async function getActivities() {
    try {
        const activities = JSON.parse(localStorage.getItem("hydrofit_activities") || '[]');
        return activities;
    } catch (error) {
        console.error("Get activities error:", error);
        return [];
    }
}

async function uploadHandout(handoutData) {
    try {
        const handouts = JSON.parse(localStorage.getItem("hydrofit_handouts") || '[]');
        const newHandout = {
            id: Date.now(),
            ...handoutData,
            timestamp: new Date().toISOString()
        };
        handouts.unshift(newHandout);
        localStorage.setItem("hydrofit_handouts", JSON.stringify(handouts));
        return { success: true, message: "Handout uploaded successfully!" };
    } catch (error) {
        console.error("Upload handout error:", error);
        return { success: false, message: "Failed to upload handout" };
    }
}

async function getHandouts() {
    try {
        const handouts = JSON.parse(localStorage.getItem("hydrofit_handouts") || '[]');
        return handouts;
    } catch (error) {
        console.error("Get handouts error:", error);
        return [];
    }
}

async function publishAnnouncement(announcementData) {
    try {
        const announcements = JSON.parse(localStorage.getItem("hydrofit_announcements") || '[]');
        const newAnnouncement = {
            id: Date.now(),
            ...announcementData,
            timestamp: new Date().toISOString()
        };
        announcements.unshift(newAnnouncement);
        localStorage.setItem("hydrofit_announcements", JSON.stringify(announcements));
        return { success: true, message: "Announcement published successfully!" };
    } catch (error) {
        console.error("Publish announcement error:", error);
        return { success: false, message: "Failed to publish announcement" };
    }
}

async function getAnnouncements() {
    try {
        const announcements = JSON.parse(localStorage.getItem("hydrofit_announcements") || '[]');
        return announcements;
    } catch (error) {
        console.error("Get announcements error:", error);
        return [];
    }
}