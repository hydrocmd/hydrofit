// sheets-integration.js - Google Apps Script Integration for HYDROFIT
let apiUrl = null;

function initSheetDB(apiUrlParam) {
  apiUrl = apiUrlParam;
  console.log('✅ HYDROFIT API Ready:', apiUrl);
  return { isReady: true };
}

// JSONP request (bypasses CORS)
function jsonpRequest(url, callback) {
  const callbackName = 'jsonp_cb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
  
  window[callbackName] = function(data) {
    delete window[callbackName];
    if (script.parentNode) document.body.removeChild(script);
    callback(data);
  };
  
  const separator = url.includes('?') ? '&' : '?';
  const script = document.createElement('script');
  script.src = `${url}${separator}callback=${callbackName}`;
  script.onerror = function() {
    delete window[callbackName];
    document.body.removeChild(script);
    callback({ success: false, error: 'Network error' });
  };
  
  document.body.appendChild(script);
  
  setTimeout(() => {
    if (window[callbackName]) {
      delete window[callbackName];
      if (script.parentNode) document.body.removeChild(script);
      callback({ success: false, error: 'Request timeout' });
    }
  }, 15000);
}

// ============ API FUNCTIONS ============

async function registerUser(userData) {
  return new Promise((resolve) => {
    const url = `${apiUrl}?action=register&fullName=${encodeURIComponent(userData.fullName)}&schoolId=${encodeURIComponent(userData.schoolId)}&program=${encodeURIComponent(userData.program)}&subject=${encodeURIComponent(userData.subject || 'Pathfit')}&yearLevel=${encodeURIComponent(userData.yearLevel)}&section=${encodeURIComponent(userData.section)}&password=${encodeURIComponent(userData.password)}`;
    
    jsonpRequest(url, (result) => {
      resolve(result);
    });
  });
}

async function loginUser(schoolId, password) {
  return new Promise((resolve) => {
    const url = `${apiUrl}?action=login&schoolId=${encodeURIComponent(schoolId)}&password=${encodeURIComponent(password)}`;
    
    jsonpRequest(url, (result) => {
      resolve(result);
    });
  });
}

async function getRankings(program, sectionCode) {
  return new Promise((resolve) => {
    let url = `${apiUrl}?action=getRankings`;
    if (program) url += `&program=${encodeURIComponent(program)}`;
    if (sectionCode) url += `&sectionCode=${encodeURIComponent(sectionCode)}`;
    
    jsonpRequest(url, (result) => {
      resolve(result);
    });
  });
}

async function markAttendance(schoolId, fullName, date) {
  return new Promise((resolve) => {
    const url = `${apiUrl}?action=markAttendance&schoolId=${encodeURIComponent(schoolId)}&fullName=${encodeURIComponent(fullName)}&date=${encodeURIComponent(date || new Date().toISOString().split('T')[0])}`;
    
    jsonpRequest(url, (result) => {
      resolve(result);
    });
  });
}

async function getUserAttendance(schoolId) {
  return new Promise((resolve) => {
    const url = `${apiUrl}?action=getAttendance&schoolId=${encodeURIComponent(schoolId)}`;
    
    jsonpRequest(url, (result) => {
      resolve(result);
    });
  });
}

async function addAssessment(schoolId, fullName, assessmentType, score) {
  return new Promise((resolve) => {
    const url = `${apiUrl}?action=addAssessment&schoolId=${encodeURIComponent(schoolId)}&fullName=${encodeURIComponent(fullName)}&assessmentType=${encodeURIComponent(assessmentType)}&score=${encodeURIComponent(score)}`;
    
    jsonpRequest(url, (result) => {
      resolve(result);
    });
  });
}

async function getUserAssessments(schoolId) {
  return new Promise((resolve) => {
    const url = `${apiUrl}?action=getAssessments&schoolId=${encodeURIComponent(schoolId)}`;
    
    jsonpRequest(url, (result) => {
      resolve(result);
    });
  });
}

async function testAPIConnection() {
  return new Promise((resolve) => {
    const url = `${apiUrl}?action=test`;
    jsonpRequest(url, (result) => {
      resolve(result);
    });
  });
}