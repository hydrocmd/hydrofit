// ========================================
// HYDROFIT CONFIGURATION
// ========================================

// Google Sheets Web App URL (Replace with your deployed URL for production)
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbz-CVGCXEpQl5SN6scDwiSn21XjW9oN6muLbGutpMiAQj2EU3WQEGK1OCMzY3MM0ud2wA/exec";

// App Configuration
const APP_NAME = "HYDROFIT";
const APP_VERSION = "1.0.0";

// Teacher credentials (built-in for demo)
const TEACHER_CREDENTIALS = {
    schoolId: "Prof.David",
    password: "instructor",
    name: "Prof. David Manongsong",
    subject: "Pathfit",
    program: "Physical Education"
};

// Demo student data (for testing without backend)
const DEMO_STUDENTS = [
    { schoolId: "2024001", fullName: "Cruz, Juan A.", program: "BSIT", yearLevel: "2", section: "A", attendanceCount: 15, password: "student123" },
    { schoolId: "2024002", fullName: "Santos, Maria B.", program: "BSHM", yearLevel: "1", section: "B", attendanceCount: 12, password: "student123" },
    { schoolId: "2024003", fullName: "Reyes, Jose C.", program: "BSCRIM", yearLevel: "3", section: "C", attendanceCount: 18, password: "student123" },
    { schoolId: "2024004", fullName: "Garcia, Ana D.", program: "BSED", yearLevel: "2", section: "A", attendanceCount: 10, password: "student123" }
];

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