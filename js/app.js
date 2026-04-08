// app.js - HYDROFIT with Google Sheets Login/Registration

let currentUser = null;
let slideInterval = null;

// DOM Elements
const contentDiv = document.getElementById('tab-content');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');

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
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ============ LOGIN FUNCTION ============
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
        section: result.section
      };
      
      sessionStorage.setItem('hydrofit_user', JSON.stringify(currentUser));
      
      loginModal.style.display = 'none';
      showToast(`✅ Welcome ${result.fullName}!`);
      
      // Show dashboard after login
      document.getElementById('active-title').innerText = 'HYDROFIT Dashboard';
      contentDiv.innerHTML = `
        <div class="card">
          <h3><i class="fas fa-user-circle"></i> Welcome, ${result.fullName}!</h3>
          <p>Program: ${result.program}</p>
          <p>School ID: ${result.schoolId}</p>
          <p>Section: ${result.yearLevel}-${result.section}</p>
        </div>
      `;
      return true;
    } else {
      showToast(result?.message || 'Invalid School ID or Password', true);
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('Connection error. Please try again.', true);
    return false;
  } finally {
    btn.disabled = false;
    inputs.forEach(input => input.disabled = false);
    btn.textContent = 'Login';
  }
}

// ============ REGISTER FUNCTION ============
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
    showToast('Connection error. Please try again.', true);
    return false;
  } finally {
    btn.disabled = false;
    inputs.forEach(input => input.disabled = false);
    btn.textContent = 'Register';
  }
}

function logout() {
  currentUser = null;
  sessionStorage.removeItem('hydrofit_user');
  loginModal.style.display = 'flex';
  registerModal.style.display = 'none';
  showToast('Logged out successfully');
}

function checkAuth() {
  const savedUser = sessionStorage.getItem('hydrofit_user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    loginModal.style.display = 'none';
    contentDiv.innerHTML = `
      <div class="card">
        <h3><i class="fas fa-user-circle"></i> Welcome, ${currentUser.fullName}!</h3>
        <p>Program: ${currentUser.program}</p>
        <p>School ID: ${currentUser.schoolId}</p>
        <p>Section: ${currentUser.yearLevel}-${currentUser.section}</p>
        <button class="btn" id="logoutBtnDashboard" onclick="logout()">Logout</button>
      </div>
    `;
  } else {
    loginModal.style.display = 'flex';
  }
}

// ============ EVENT LISTENERS ============

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

// Enter key support
document.getElementById('loginPassword')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById('loginBtn').click();
});
document.getElementById('regConfirmPassword')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById('registerBtn').click();
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === loginModal) loginModal.style.display = 'none';
  if (e.target === registerModal) registerModal.style.display = 'none';
});

// ============ INITIALIZATION ============

async function init() {
  if (typeof CONFIG !== 'undefined' && CONFIG.API_URL) {
    initSheetDB(CONFIG.API_URL);
    const testResult = await testAPIConnection();
    if (testResult && testResult.success) {
      console.log('✅ API connected successfully');
    } else {
      console.warn('⚠️ API connection issue');
    }
  }
  checkAuth();
}

// Make functions global
window.logout = logout;

init();