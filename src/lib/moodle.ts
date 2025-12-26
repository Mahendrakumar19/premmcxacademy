import type {
  MoodleSiteInfo,
  MoodleCourse,
  MoodleCourseContent,
  MoodleApiError,
  MoodleGrade,
  MoodleUser,
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
  const wstoken = token || process.env.MOODLE_TOKEN;

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
