// ========================================
// GOOGLE SHEETS INTEGRATION - NO POINTS SYSTEM
// ========================================

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