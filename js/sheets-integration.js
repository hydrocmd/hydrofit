// ========================================
// GOOGLE SHEETS INTEGRATION - WITH TEACHER DASHBOARD
// ========================================

// Teacher credentials (built-in)
const TEACHER_CREDENTIALS = {
    schoolId: "Prof.David",
    password: "instructor",
    name: "Prof. David Manongsong",
    subject: "Pathfit",
    program: "Physical Education"
};

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

// Test connection to Google Sheets
async function testConnection() {
    try {
        const response = await fetch(`${GOOGLE_SHEETS_URL}?action=test`);
        const result = await response.json();
        console.log("Connection test:", result);
        return result.success;
    } catch (error) {
        console.error("Connection failed:", error);
        return false;
    }
}

// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

// Login user
async function loginUser(schoolId, password) {
    try {
        const formData = new URLSearchParams();
        formData.append("action", "login");
        formData.append("schoolId", schoolId);
        formData.append("password", password);
        
        const response = await fetch(GOOGLE_SHEETS_URL, { 
            method: "POST", 
            body: formData 
        });
        const result = await response.json();
        
        if (result.success) {
            // Save user data to localStorage
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
        } else {
            return { success: false, message: result.message };
        }
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: "Network error. Please try again." };
    }
}

// Register user
async function registerUser(userData) {
    try {
        const formData = new URLSearchParams();
        formData.append("action", "register");
        formData.append("fullName", userData.fullName);
        formData.append("schoolId", userData.schoolId);
        formData.append("subject", userData.subject);
        formData.append("program", userData.program);
        formData.append("yearLevel", userData.yearLevel);
        formData.append("section", userData.section);
        formData.append("password", userData.password);
        
        const response = await fetch(GOOGLE_SHEETS_URL, { 
            method: "POST", 
            body: formData 
        });
        const result = await response.json();
        
        if (result.success) {
            return { success: true, message: result.message };
        } else {
            return { success: false, message: result.message };
        }
    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, message: "Network error. Please try again." };
    }
}

// ========================================
// USER DATA FUNCTIONS
// ========================================

// Get current logged in user
function getCurrentUser() {
    const userJson = localStorage.getItem("hydrofit_user");
    if (userJson) {
        return JSON.parse(userJson);
    }
    return null;
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem("hydrofit_logged_in") === "true";
}

// Logout user
function logoutUser() {
    localStorage.removeItem("hydrofit_user");
    localStorage.removeItem("hydrofit_logged_in");
}

// Record attendance only (no points)
async function recordAttendance(schoolId) {
    try {
        const formData = new URLSearchParams();
        formData.append("action", "recordAttendance");
        formData.append("schoolId", schoolId);
        formData.append("date", new Date().toISOString().split('T')[0]);
        
        const response = await fetch(GOOGLE_SHEETS_URL, { 
            method: "POST", 
            body: formData 
        });
        const result = await response.json();
        
        if (result.success) {
            // Update local user data
            const currentUser = getCurrentUser();
            if (currentUser && currentUser.schoolId === schoolId) {
                currentUser.attendanceCount = result.attendanceCount;
                localStorage.setItem("hydrofit_user", JSON.stringify(currentUser));
            }
            return { success: true, message: result.message };
        }
        return { success: false, message: result.message };
    } catch (error) {
        console.error("Record attendance error:", error);
        return { success: false, message: "Failed to record attendance" };
    }
}

// Get ranking data (by attendance only)
async function getRankingData() {
    try {
        const response = await fetch(`${GOOGLE_SHEETS_URL}?action=getRanking`);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error("Get ranking error:", error);
        return [];
    }
}

// Get user's activity history
async function getUserActivity(schoolId) {
    try {
        const response = await fetch(`${GOOGLE_SHEETS_URL}?action=getUserActivity&schoolId=${schoolId}`);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error("Get activity error:", error);
        return [];
    }
}

// ========================================
// TEACHER DASHBOARD FUNCTIONS
// ========================================

// Get all students
async function getAllStudents() {
    try {
        const response = await fetch(`${GOOGLE_SHEETS_URL}?action=getAllStudents`);
        const result = await response.json();
        if (result.success) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error("Get students error:", error);
        return [];
    }
}

// Publish activity/assignment
async function publishActivity(activityData) {
    try {
        const formData = new URLSearchParams();
        formData.append("action", "publishActivity");
        formData.append("title", activityData.title);
        formData.append("description", activityData.description);
        formData.append("dueDate", activityData.dueDate);
        formData.append("timestamp", new Date().toISOString());
        
        const response = await fetch(GOOGLE_SHEETS_URL, { method: "POST", body: formData });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Publish activity error:", error);
        return { success: false, message: "Failed to publish activity" };
    }
}

// Get all activities
async function getActivities() {
    try {
        const response = await fetch(`${GOOGLE_SHEETS_URL}?action=getActivities`);
        const result = await response.json();
        if (result.success) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error("Get activities error:", error);
        return [];
    }
}

// Upload learning handout
async function uploadHandout(handoutData) {
    try {
        const formData = new URLSearchParams();
        formData.append("action", "uploadHandout");
        formData.append("title", handoutData.title);
        formData.append("description", handoutData.description);
        formData.append("fileUrl", handoutData.fileUrl);
        formData.append("timestamp", new Date().toISOString());
        
        const response = await fetch(GOOGLE_SHEETS_URL, { method: "POST", body: formData });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Upload handout error:", error);
        return { success: false, message: "Failed to upload handout" };
    }
}

// Get all handouts
async function getHandouts() {
    try {
        const response = await fetch(`${GOOGLE_SHEETS_URL}?action=getHandouts`);
        const result = await response.json();
        if (result.success) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error("Get handouts error:", error);
        return [];
    }
}

// Publish announcement
async function publishAnnouncement(announcementData) {
    try {
        const formData = new URLSearchParams();
        formData.append("action", "publishAnnouncement");
        formData.append("title", announcementData.title);
        formData.append("content", announcementData.content);
        formData.append("timestamp", new Date().toISOString());
        
        const response = await fetch(GOOGLE_SHEETS_URL, { method: "POST", body: formData });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Publish announcement error:", error);
        return { success: false, message: "Failed to publish announcement" };
    }
}

// Get all announcements
async function getAnnouncements() {
    try {
        const response = await fetch(`${GOOGLE_SHEETS_URL}?action=getAnnouncements`);
        const result = await response.json();
        if (result.success) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error("Get announcements error:", error);
        return [];
    }
}