import type {
  MoodleSiteInfo,
  MoodleCourse,
  MoodleCourseContent,
  MoodleApiError,
  MoodleGrade,
  MoodleUser,
  MoodleUserRole,
  MoodleCapability,
  MoodleEnrolmentInstance,
} from '@/types/moodle';

/**
 * Call Moodle Web Service REST API
 */
export async function callMoodle<T = unknown>(
  wsfunction: string,
  params: Record<string, unknown> = {},
  token?: string
): Promise<T> {
  const base = process.env.MOODLE_URL;
  const wstoken = token || process.env.MOODLE_TOKEN || process.env.MOODLE_PAYMENT_TOKEN;

  if (!base || !wstoken) {
    throw new Error('MOODLE_URL and MOODLE_TOKEN must be set in environment');
  }

  const url = new URL('/webservice/rest/server.php', base);
  url.searchParams.set('wstoken', wstoken);
  url.searchParams.set('moodlewsrestformat', 'json');
  url.searchParams.set('wsfunction', wsfunction);

  // Flatten nested params for Moodle's query string format
  const flattenParams = (obj: Record<string, unknown>, prefix = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      const paramKey = prefix ? `${prefix}[${key}]` : key;
      
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            flattenParams(item as Record<string, unknown>, `${paramKey}[${index}]`);
          } else {
            url.searchParams.set(`${paramKey}[${index}]`, String(item));
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        flattenParams(value as Record<string, unknown>, paramKey);
      } else {
        url.searchParams.set(paramKey, String(value));
      }
    });
  };

  flattenParams(params);

  const res = await fetch(url.toString(), {
    next: { revalidate: 30 },
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Moodle API error: ${res.status} ${text}`);
  }

  const data = await res.json();

  // Check if Moodle returned an error object
  if (data && typeof data === 'object' && ('exception' in data || 'errorcode' in data)) {
    const err = data as MoodleApiError;
    throw new Error(err.message || err.error || 'Moodle API error');
  }

  return data as T;
}

/**
 * Get site information and current user details
 */
export async function getSiteInfo(token?: string): Promise<MoodleSiteInfo> {
  return callMoodle<MoodleSiteInfo>('core_webservice_get_site_info', {}, token);
}

/**
 * Get all courses (or courses for a specific user)
 */
export async function getUserCourses(userid?: number, token?: string): Promise<MoodleCourse[]> {
  if (userid) {
    return callMoodle<MoodleCourse[]>('core_enrol_get_users_courses', { userid }, token);
  }
  // Get all courses visible to the current user
  return callMoodle<MoodleCourse[]>('core_course_get_courses', {}, token);
}

/**
 * Get course contents (sections and modules)
 */
export async function getCourseContents(
  courseid: number,
  token?: string
): Promise<MoodleCourseContent[]> {
  return callMoodle<MoodleCourseContent[]>(
    'core_course_get_contents',
    { courseid },
    token
  );
}

/**
 * Get enrolled users in a course
 */
export async function getEnrolledUsers(
  courseid: number,
  token?: string
): Promise<MoodleUser[]> {
  return callMoodle<MoodleUser[]>(
    'core_enrol_get_enrolled_users',
    { courseid },
    token
  );
}

/**
 * Get user grades for a course
 */
export async function getUserGrades(
  courseid: number,
  userid: number,
  token?: string
): Promise<MoodleGrade[]> {
  const result = await callMoodle<{ usergrades: Array<{ gradeitems: MoodleGrade[] }> }>(
    'gradereport_user_get_grade_items',
    { courseid, userid },
    token
  );
  return result?.usergrades?.[0]?.gradeitems || [];
}

/**
 * Search courses by field
 */
export async function searchCourses(
  criterianame: string,
  criteriavalue: string,
  token?: string
): Promise<{ courses: MoodleCourse[] }> {
  return callMoodle<{ courses: MoodleCourse[] }>(
    'core_course_search_courses',
    {
      criterianame,
      criteriavalue,
    },
    token
  );
}
/**
 * Get user roles in a specific context (site, course, etc.)
 */
export async function getUserRoles(
  userid: number,
  token?: string
): Promise<MoodleUserRole[]> {
  try {
    const result = await callMoodle<{ roles: MoodleUserRole[] }>(
      'core_role_get_user_roles',
      { userid },
      token
    );
    return result?.roles || [];
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
}

/**
 * Get user capabilities
 */
export async function getUserCapabilities(
  capabilities: string[],
  token?: string
): Promise<MoodleCapability[]> {
  try {
    const result = await callMoodle<{ capabilities: MoodleCapability[] }>(
      'core_user_get_user_capabilities',
      { capabilities },
      token
    );
    return result?.capabilities || [];
  } catch (error) {
    console.error('Error fetching user capabilities:', error);
    return [];
  }
}

/**
 * Get enrolment instances for a course (includes payment info)
 */
export async function getCourseEnrolmentInstances(
  courseid: number,
  token?: string
): Promise<MoodleEnrolmentInstance[]> {
  try {
    return await callMoodle<MoodleEnrolmentInstance[]>(
      'core_enrol_get_course_enrolment_methods',
      { courseid },
      token
    );
  } catch (error) {
    console.error('Error fetching enrolment instances:', error);
    return [];
  }
}

/**
 * Get all courses with enrolment information including pricing
 */
export async function getCoursesWithEnrolmentInfo(
  token?: string
): Promise<MoodleCourse[]> {
  try {
    const courses = await callMoodle<MoodleCourse[]>(
      'core_course_get_courses',
      {},
      token
    );

    // Filter out hidden courses (visible === 0)
    const visibleCourses = courses.filter((course) => course.visible !== 0);

    // Fetch enrolment info for each visible course to get pricing
    const coursesWithPricing = await Promise.all(
      visibleCourses.map(async (course) => {
        try {
          const enrolments = await getCourseEnrolmentInstances(course.id, token);
          const feeEnrolment = enrolments.find((e) => e.enrol === 'fee' && e.cost);

          if (feeEnrolment) {
            return {
              ...course,
              cost: feeEnrolment.cost,
              currency: feeEnrolment.currency || 'INR',
            };
          }
        } catch (err) {
          console.error(`Error fetching enrolment for course ${course.id}:`, err);
        }
        return course;
      })
    );

    return coursesWithPricing;
  } catch (error) {
    console.error('Error fetching courses with enrolment info:', error);
    throw error;
  }
}

/**
 * Check if user is enrolled in a course
 */
export async function checkUserEnrollment(
  userid: number,
  courseid: number,
  token?: string
): Promise<boolean> {
  try {
    const courses = await getUserCourses(userid, token);
    return courses.some((course) => course.id === courseid);
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return false;
  }
}

/**
 * Get user's highest role (for access control)
 */
export async function getUserHighestRole(
  userid: number,
  token?: string
): Promise<'admin' | 'teacher' | 'student'> {
  try {
    console.log('🔍 Fetching roles for user:', userid);
    
    // First, get site info to check if user is site admin
    const siteInfo = await getSiteInfo(token);
    console.log('📋 Site info user functions:', siteInfo.functions);
    
    // Get user roles
    const roles = await getUserRoles(userid, token);
    console.log('📋 User roles:', JSON.stringify(roles, null, 2));
    
    // Check if user has course creation capabilities (indicates admin/course creator)
    const hasCreateCourseCapability = siteInfo.functions?.some(
      (func: { name: string }) => 
        func.name === 'core_course_create_courses' ||
        func.name === 'core_course_update_courses' ||
        func.name === 'core_course_delete_courses'
    );
    
    console.log('🔑 Has course creation capability:', hasCreateCourseCapability);
    
    // If user has course creation capabilities, they're an admin
    if (hasCreateCourseCapability) {
      console.log('✅ User is ADMIN (has course creation capabilities)');
      return 'admin';
    }
    
    // Check for admin/manager roles
    if (roles.some((r) => ['admin', 'manager', 'coursecreator'].includes(r.shortname.toLowerCase()))) {
      console.log('✅ User is ADMIN (role-based)');
      return 'admin';
    }
    
    // Check for teacher/editing teacher roles
    if (roles.some((r) => ['teacher', 'editingteacher'].includes(r.shortname.toLowerCase()))) {
      console.log('✅ User is TEACHER');
      return 'teacher';
    }
    
    // Default to student
    console.log('✅ User is STUDENT');
    return 'student';
  } catch (error) {
    console.error('❌ Error getting highest role:', error);
    return 'student';
  }
}