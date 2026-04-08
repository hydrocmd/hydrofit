// ========================================
// GOOGLE SHEETS INTEGRATION
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
                totalPoints: result.totalPoints || 0,
                attendanceCount: result.attendanceCount || 0,
                workoutsCompleted: result.workoutsCompleted || 0,
                badges: result.badges || [],
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
    // Also clear any other session data
    localStorage.removeItem("hydrofit_workout_session");
    localStorage.removeItem("hydrofit_timer_state");
}

// Update user points
async function updateUserPoints(schoolId, pointsToAdd, reason) {
    try {
        const formData = new URLSearchParams();
        formData.append("action", "updatePoints");
        formData.append("schoolId", schoolId);
        formData.append("points", pointsToAdd);
        formData.append("reason", reason);
        
        const response = await fetch(GOOGLE_SHEETS_URL, { 
            method: "POST", 
            body: formData 
        });
        const result = await response.json();
        
        if (result.success) {
            // Update local user data
            const currentUser = getCurrentUser();
            if (currentUser && currentUser.schoolId === schoolId) {
                currentUser.totalPoints = result.newPoints;
                localStorage.setItem("hydrofit_user", JSON.stringify(currentUser));
            }
            return { success: true, newPoints: result.newPoints };
        }
        return { success: false, message: result.message };
    } catch (error) {
        console.error("Update points error:", error);
        return { success: false, message: "Failed to update points" };
    }
}

// Record workout completion
async function recordWorkout(schoolId, workoutName, duration) {
    try {
        const formData = new URLSearchParams();
        formData.append("action", "recordWorkout");
        formData.append("schoolId", schoolId);
        formData.append("workoutName", workoutName);
        formData.append("duration", duration);
        
        const response = await fetch(GOOGLE_SHEETS_URL, { 
            method: "POST", 
            body: formData 
        });
        const result = await response.json();
        
        if (result.success) {
            // Update local user data
            const currentUser = getCurrentUser();
            if (currentUser && currentUser.schoolId === schoolId) {
                currentUser.workoutsCompleted = result.workoutsCompleted;
                currentUser.totalPoints = result.newPoints;
                localStorage.setItem("hydrofit_user", JSON.stringify(currentUser));
            }
            return { success: true, message: result.message };
        }
        return { success: false, message: result.message };
    } catch (error) {
        console.error("Record workout error:", error);
        return { success: false, message: "Failed to record workout" };
    }
}

// Get ranking data
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

// Get user's workout history
async function getUserWorkouts(schoolId) {
    try {
        const response = await fetch(`${GOOGLE_SHEETS_URL}?action=getUserWorkouts&schoolId=${schoolId}`);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error("Get workouts error:", error);
        return [];
    }
}

// Record attendance
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
                currentUser.totalPoints = result.newPoints;
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