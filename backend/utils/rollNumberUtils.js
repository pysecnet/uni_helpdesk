// utils/rollNumberUtils.js

/**
 * Parse student roll number to extract year and department
 * Format: 2K26-IT-123
 * Year: 2026 (extracted from 2K26)
 * Department: IT
 * Number: 123
 */

export const parseRollNumber = (rollNumber) => {
  if (!rollNumber) {
    return { valid: false, error: "Roll number is required" };
  }

  // Convert to uppercase and trim
  const cleanRoll = rollNumber.toUpperCase().trim();

  // Regex pattern: 2K26-IT-123 or 2k22-CS-001
  const pattern = /^2K(\d{2})-([A-Z]+)-(\d{1,3})$/;
  const match = cleanRoll.match(pattern);

  if (!match) {
    return {
      valid: false,
      error: "Invalid roll number format. Expected format: 2K26-IT-123",
    };
  }

  const [, yearShort, departmentCode, studentNumber] = match;

  // Convert 2K26 to 2026
  const fullYear = `20${yearShort}`;
  const enrollmentYear = parseInt(fullYear);

  return {
    valid: true,
    enrollmentYear,
    departmentCode,
    studentNumber,
    fullRollNumber: cleanRoll,
  };
};

/**
 * Check if student is currently enrolled (within 4 years of enrollment)
 */
export const isCurrentlyEnrolled = (rollNumber) => {
  const parsed = parseRollNumber(rollNumber);

  if (!parsed.valid) {
    return { enrolled: false, error: parsed.error };
  }

  const currentYear = new Date().getFullYear();
  const enrollmentYear = parsed.enrollmentYear;
  const yearsEnrolled = currentYear - enrollmentYear;

  // Students are enrolled for 4 years (freshman to senior)
  // Allow 1 extra year for students who may have extended
  if (yearsEnrolled < 0) {
    return {
      enrolled: false,
      error: `Invalid enrollment year. Cannot enroll from future year ${enrollmentYear}`,
    };
  }

  if (yearsEnrolled > 5) {
    return {
      enrolled: false,
      error: `Student enrollment expired. Enrolled in ${enrollmentYear} (${yearsEnrolled} years ago)`,
    };
  }

  // Determine student year
  let studentYear;
  if (yearsEnrolled === 0) studentYear = "Freshman";
  else if (yearsEnrolled === 1) studentYear = "Sophomore";
  else if (yearsEnrolled === 2) studentYear = "Junior";
  else if (yearsEnrolled === 3) studentYear = "Senior";
  else studentYear = "Extended";

  return {
    enrolled: true,
    enrollmentYear,
    currentYear,
    yearsEnrolled,
    studentYear,
    departmentCode: parsed.departmentCode,
  };
};

/**
 * Map department codes to full department names
 */
export const getDepartmentName = (code) => {
  const departmentMap = {
    IT: "Information Technology",
    CS: "Computer Science",
    SE: "Software Engineering",
    EE: "Electrical Engineering",
    ME: "Mechanical Engineering",
    CE: "Civil Engineering",
    BBA: "Business Administration",
    MBA: "Master of Business Administration",
    MATH: "Mathematics",
    PHY: "Physics",
    CHEM: "Chemistry",
    BIO: "Biology",
    ENG: "English",
    HIST: "History",
    PSY: "Psychology",
    ECO: "Economics",
    // Add more departments as needed
  };

  return departmentMap[code.toUpperCase()] || code;
};

/**
 * Validate roll number format and enrollment status
 */
export const validateRollNumber = (rollNumber) => {
  // Parse roll number
  const parsed = parseRollNumber(rollNumber);
  if (!parsed.valid) {
    return {
      isValid: false,
      error: parsed.error,
    };
  }

  // Check enrollment status
  const enrollment = isCurrentlyEnrolled(rollNumber);
  if (!enrollment.enrolled) {
    return {
      isValid: false,
      error: enrollment.error,
    };
  }

  return {
    isValid: true,
    data: {
      ...parsed,
      ...enrollment,
      departmentName: getDepartmentName(parsed.departmentCode),
    },
  };
};

/**
 * Extract department code from roll number (quick utility)
 */
export const extractDepartmentCode = (rollNumber) => {
  const parsed = parseRollNumber(rollNumber);
  return parsed.valid ? parsed.departmentCode : null;
};

// Export all utilities
export default {
  parseRollNumber,
  isCurrentlyEnrolled,
  getDepartmentName,
  validateRollNumber,
  extractDepartmentCode,
};
