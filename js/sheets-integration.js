// sheets-integration.js - JLF Style (works with POST)

let apiUrl = null;

function initSheetDB(apiUrlParam) {
  apiUrl = apiUrlParam;
  console.log('✅ API Ready:', apiUrl);
  return { isReady: true };
}

// Register user using POST (like JLF)
async function registerUser(userData) {
  try {
    const formData = new URLSearchParams();
    formData.append("action", "register");
    formData.append("fullName", userData.fullName);
    formData.append("schoolId", userData.schoolId);
    formData.append("program", userData.program);
    formData.append("subject", userData.subject || "Pathfit");
    formData.append("yearLevel", userData.yearLevel);
    formData.append("section", userData.section);
    formData.append("password", userData.password);
    formData.append("timestamp", new Date().toISOString());
    
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, message: "Connection error" };
  }
}

// Login user using POST (like JLF)
async function loginUser(schoolId, password) {
  try {
    const formData = new URLSearchParams();
    formData.append("action", "login");
    formData.append("schoolId", schoolId);
    formData.append("password", password);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Connection error" };
  }
}

// Get all users (for testing)
async function getUsers() {
  try {
    const formData = new URLSearchParams();
    formData.append("action", "getUsers");
    
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Get users error:", error);
    return [];
  }
}

// Test connection
async function testAPIConnection() {
  try {
    const formData = new URLSearchParams();
    formData.append("action", "getUsers");
    
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData
    });
    
    if (response.ok) {
      return { success: true, message: "API connected" };
    }
    return { success: false, message: "API not reachable" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}