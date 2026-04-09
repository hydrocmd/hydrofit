// ========================================
// CONFIGURATION FILE
// ========================================

// Google Sheets Web App URL (REPLACE WITH YOUR DEPLOYED URL)
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbzjQD2ztAlog7FgoLZDqDCO-8qcPyTpSQ5axxZRXvQVggkihtuwMSAPp7Sxi0MUY7l9xg/exec";

// App Configuration
const APP_NAME = "HYDROFIT";
const APP_VERSION = "1.0.0";

// Default settings
const DEFAULT_STUDENT_DATA = {
  totalPoints: 0,
  attendanceCount: 0,
  workoutsCompleted: 0,
  badges: []
};

// Activity types
const ACTIVITY_TYPES = {
  WORKOUT: "workout",
  ATTENDANCE: "attendance",
  ACHIEVEMENT: "achievement"
};

// Point rewards
const POINTS = {
  DAILY_LOGIN: 5,
  WORKOUT_COMPLETE: 10,
  ATTENDANCE: 15,
  ACHIEVEMENT: 50
};