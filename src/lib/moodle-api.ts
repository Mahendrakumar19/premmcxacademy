// Centralized Moodle API functions

const MOODLE_URL = process.env.MOODLE_URL || process.env.NEXT_PUBLIC_MOODLE_URL || '';
const MOODLE_TOKEN = process.env.MOODLE_TOKEN || '';

interface MoodleParams {
  [key: string]: string | number | boolean;
}

export async function callMoodleAPI(
  wsfunction: string,
  params: MoodleParams = {},
  token?: string
) {
  const urlParams = new URLSearchParams({
    wstoken: token || MOODLE_TOKEN,
    wsfunction,
    moodlewsrestformat: 'json',
    ...Object.entries(params).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: String(value)
    }), {})
  });

  const response = await fetch(
    `${MOODLE_URL}/webservice/rest/server.php?${urlParams}`,
    { method: 'POST' }
  );

  return response.json();
}

// Get all available courses
export async function getAllCourses() {
  return callMoodleAPI('core_course_get_courses');
}

// Get course details by ID
export async function getCourseById(courseId: number) {
  const courses = await callMoodleAPI('core_course_get_courses_by_field', {
    field: 'id',
    value: courseId
  });
  return courses.courses?.[0] || null;
}

// Get course contents (sections, modules)
export async function getCourseContents(courseId: number, token?: string) {
  return callMoodleAPI('core_course_get_contents', { courseid: courseId }, token);
}

// Get enrolled users in a course
export async function getEnrolledUsers(courseId: number, token?: string) {
  return callMoodleAPI('core_enrol_get_enrolled_users', { courseid: courseId }, token);
}

// Get user's enrolled courses
export async function getUserCourses(userId: number, token: string) {
  return callMoodleAPI('core_enrol_get_users_courses', { userid: userId }, token);
}

// Enroll user in a course
export async function enrollUserInCourse(userId: number, courseId: number, roleId: number = 5) {
  return callMoodleAPI('enrol_manual_enrol_users', {
    'enrolments[0][userid]': userId,
    'enrolments[0][courseid]': courseId,
    'enrolments[0][roleid]': roleId // 5 = student role
  });
}

// Get assignments for a course
export async function getCourseAssignments(courseIds: number[], token: string) {
  return callMoodleAPI('mod_assign_get_assignments', {
    'courseids[0]': courseIds[0]
  }, token);
}

// Submit assignment
export async function submitAssignment(
  assignmentId: number,
  userId: number,
  submissionText: string,
  token: string
) {
  return callMoodleAPI('mod_assign_save_submission', {
    assignmentid: assignmentId,
    'plugindata[onlinetext_editor][text]': submissionText,
    'plugindata[onlinetext_editor][format]': 1
  }, token);
}

// Get quizzes for a course
export async function getCourseQuizzes(courseId: number, token: string) {
  return callMoodleAPI('mod_quiz_get_quizzes_by_courses', {
    'courseids[0]': courseId
  }, token);
}

// Start quiz attempt
export async function startQuizAttempt(quizId: number, token: string) {
  return callMoodleAPI('mod_quiz_start_attempt', {
    quizid: quizId
  }, token);
}

// Get user grades
export async function getUserGrades(courseId: number, userId: number, token: string) {
  return callMoodleAPI('gradereport_user_get_grade_items', {
    courseid: courseId,
    userid: userId
  }, token);
}

// Get course categories
export async function getCourseCategories() {
  return callMoodleAPI('core_course_get_categories');
}

// Search courses
export async function searchCourses(searchQuery: string) {
  return callMoodleAPI('core_course_search_courses', {
    criterianame: 'search',
    criteriavalue: searchQuery
  });
}

// Get user profile
export async function getUserProfile(userId: number, token: string) {
  const users = await callMoodleAPI('core_user_get_users_by_field', {
    field: 'id',
    'values[0]': userId
  }, token);
  return users[0] || null;
}

// Update user profile
export async function updateUserProfile(
  userId: number,
  updates: {
    firstname?: string;
    lastname?: string;
    email?: string;
    city?: string;
    country?: string;
    description?: string;
  },
  token: string
) {
  const params: MoodleParams = {
    'users[0][id]': userId
  };
  
  Object.entries(updates).forEach(([key, value], index) => {
    if (value !== undefined) {
      params[`users[0][${key}]`] = value;
    }
  });

  return callMoodleAPI('core_user_update_users', params, token);
}

// Get course completion status
export async function getCourseCompletion(courseId: number, userId: number, token: string) {
  return callMoodleAPI('core_completion_get_course_completion_status', {
    courseid: courseId,
    userid: userId
  }, token);
}

// Get forum discussions
export async function getForumDiscussions(forumId: number, token: string) {
  return callMoodleAPI('mod_forum_get_forum_discussions', {
    forumid: forumId
  }, token);
}
