// Centralized Moodle API functions
/* eslint-disable @typescript-eslint/no-explicit-any */

const MOODLE_URL = process.env.MOODLE_URL || process.env.NEXT_PUBLIC_MOODLE_URL || '';
const MOODLE_TOKEN = process.env.MOODLE_TOKEN || '';
const MOODLE_COURSE_TOKEN = process.env.MOODLE_COURSE_TOKEN || '';

/**
 * Extract YouTube video ID from various YouTube URL formats
 * Supports: https://youtube.com/watch?v=VIDEO_ID, https://youtu.be/VIDEO_ID, youtube.com/embed/VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  // Match youtube.com/watch?v=ID
  let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  if (match && match[1]) {
    return match[1];
  }

  // Match other formats
  match = url.match(/^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Check if URL is a YouTube video
 */
export function isYouTubeUrl(url: string): boolean {
  return !!url && (url.includes('youtube.com') || url.includes('youtu.be'));
}

// Simple in-memory cache for API calls (TTL: 5 minutes)
const apiCache = new Map<string, { data: any; expires: number }>();

function getCacheKey(wsfunction: string, params: any): string {
  return `${wsfunction}:${JSON.stringify(params)}`;
}

function setCache(key: string, data: any, ttlSeconds: number = 300) {
  apiCache.set(key, {
    data,
    expires: Date.now() + ttlSeconds * 1000
  });
}

function getCache(key: string): any | null {
  const cached = apiCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  apiCache.delete(key);
  return null;
}

interface MoodleParams {
  [key: string]: string | number | boolean;
}

export async function callMoodleAPI(
  wsfunction: string,
  params: MoodleParams = {},
  token?: string,
  tryFallbackToken: boolean = false
) {
  // Check cache first for read operations
  if (wsfunction.startsWith('core_') && !wsfunction.includes('create') && !wsfunction.includes('update') && !wsfunction.includes('delete')) {
    const cacheKey = getCacheKey(wsfunction, params);
    const cached = getCache(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit for ${wsfunction}`);
      return cached;
    }
  }

  // Try primary token first
  const primaryToken = token || MOODLE_COURSE_TOKEN || MOODLE_TOKEN;
  const fallbackToken = tryFallbackToken ? (MOODLE_COURSE_TOKEN && MOODLE_TOKEN && primaryToken === MOODLE_TOKEN ? MOODLE_COURSE_TOKEN : MOODLE_TOKEN) : null;
  
  const makeRequest = async (useToken: string) => {
    const urlParams = new URLSearchParams({
      wstoken: useToken,
      wsfunction,
      moodlewsrestformat: 'json',
      ...Object.entries(params).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: String(value)
      }), {})
    });

    const response = await fetch(
      `${MOODLE_URL}/webservice/rest/server.php?${urlParams}`,
      { 
        method: 'POST',
        // Add timeout for slow requests - use 60 seconds to handle slow Moodle servers
        signal: AbortSignal.timeout(60000)
      }
    );

    return response.json();
  };

  // Try primary token
  const result = await makeRequest(primaryToken);
  
  // If primary token failed and we have a fallback, try it
  if (fallbackToken && ((result as any)?.exception || (result as any)?.errorcode)) {
    console.log(`⚠️ Primary token failed for ${wsfunction}, trying fallback token...`);
    return makeRequest(fallbackToken);
  }

  // Cache successful results
  if (wsfunction.startsWith('core_') && !wsfunction.includes('create') && !wsfunction.includes('update') && !wsfunction.includes('delete')) {
    const cacheKey = getCacheKey(wsfunction, params);
    setCache(cacheKey, result, 300);
  }
  
  return result;
}


// Get all available courses
export async function getAllCourses() {
  return callMoodleAPI('core_course_get_courses', {}, undefined, true);
}

// Get course overview files (images) with full URLs
export async function getCourseOverviewFiles(courseId: number, token?: string) {
  try {
    const files = await callMoodleAPI('core_course_get_overview_files', {
      'courseids[]': courseId
    }, token, true);
    
    if (Array.isArray(files) && files.length > 0) {
      // Moodle returns array of course objects with their files
      const course = files.find((c: any) => c.id === courseId);
      if (course && course.files && Array.isArray(course.files) && course.files.length > 0) {
        // Get the first file (usually the course image)
        const imageFile = course.files[0];
        if (imageFile.fileurl) {
          console.log(`📸 Course ${courseId} overview file URL: ${imageFile.fileurl}`);
          return imageFile.fileurl;
        }
      }
    }
    return null;
  } catch (err) {
    console.log(`⚠️ Could not fetch course overview files for course ${courseId}:`, err);
    return null;
  }
}

// Get enrollment instances for a course (includes fee details from enrol_fee plugin)
export async function getCourseEnrolmentInstances(courseId: number, token?: string) {
  try {
    // This gets the enrolment instances with cost and currency for enrol_fee
    const instances = await callMoodleAPI('core_enrol_get_course_enrolment_methods', {
      'courseid': courseId
    }, token, true);
    // Server-only: append raw instances to a log file for debugging
    if (typeof window === 'undefined') {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const logPath = path.resolve(process.cwd(), 'moodle-enrolments.log');
        const entry = `[${new Date().toISOString()}] course:${courseId} raw_enrolment_methods=${JSON.stringify(instances)}\n`;
        await fs.promises.appendFile(logPath, entry, { encoding: 'utf8' });
      } catch (writeErr) {
        // Do not fail on logging issues
        // eslint-disable-next-line no-console
        console.warn('Could not write moodle-enrolments.log:', writeErr);
      }
    }

    return Array.isArray(instances) ? instances : [];
  } catch (err) {
    console.log(`⚠️ Could not fetch enrollment instances for course ${courseId}:`, err);
    return [];
  }
}

// Try to get enrolment fee from database via enrol table
export async function getEnrolmentFee(courseId: number, token?: string) {
  try {
    // Get enrollment methods for the course - this includes fee information
    const instances = await getCourseEnrolmentInstances(courseId, token);
    
    // Look for any payment-based enrollment method
    for (const instance of instances) {
      // Check if this enrollment requires payment
      if (instance.status === '0' && instance.enrol === 'fee') {
        // Found fee enrollment - return the fee details
        const cost = instance.cost || '0';
        const currency = instance.currency || 'INR';
        
        if (parseFloat(cost) > 0) {
          console.log(`💰 Fee enrollment found for course ${courseId}: ${currency} ${cost}`);
          return { cost: String(cost), currency };
        }
      }
    }
    
    console.log(`ℹ️ No paid enrollment configured for course ${courseId}`);
    return null;
  } catch (error) {
    console.error(`❌ Error fetching enrollment fee for course ${courseId}:`, error);
    return null;
  }
}

// Get all courses with enrolment methods (including pricing) - Real-time from Moodle enrollment methods
export async function getAllCoursesWithEnrolment(token?: string) {
  try {
    console.log('📚 [getAllCoursesWithEnrolment] Starting to fetch courses from Moodle...');
    
    // Fetch all courses from Moodle with additional options to include course images
    // Note: core_course_get_courses doesn't return overviewfiles by default
    // We need to fetch them separately using core_course_get_overview_files or construct URLs
    let courses = await callMoodleAPI('core_course_get_courses', {}, token, true);
    
    console.log('📚 [getAllCoursesWithEnrolment] Raw response type:', typeof courses, 'isArray:', Array.isArray(courses));
    
    // Log first course structure to debug what fields are available
    if (Array.isArray(courses) && courses.length > 0) {
      console.log('📋 First course structure:', {
        id: courses[0].id,
        fullname: courses[0].fullname,
        hasOverviewfiles: !!courses[0].overviewfiles,
        hasCourseimage: !!courses[0].courseimage,
        hasImageUrl: !!courses[0].imageurl,
        overviewfilesCount: courses[0].overviewfiles?.length || 0,
        allKeys: Object.keys(courses[0]).slice(0, 20) // First 20 keys
      });
      
      // If no overviewfiles in standard API, try to fetch them separately for each course
      // Moodle stores course images in course/overviewfiles area
      if (!courses[0].overviewfiles && courses.length > 0) {
        console.log('⚠️ Standard API returned no overviewfiles, will construct URLs from Moodle');
      }
    }
    
    if (courses?.exception || courses?.errorcode) {
      console.error('❌ [getAllCoursesWithEnrolment] Moodle API returned error:', courses);
      return [];
    }
    
    if (!Array.isArray(courses)) {
      console.error('❌ [getAllCoursesWithEnrolment] Moodle API did not return array:', JSON.stringify(courses).substring(0, 200));
      return [];
    }
    
    console.log(`📊 [getAllCoursesWithEnrolment] Fetched ${courses.length} courses from Moodle (before filtering)`);
    
    // Filter out site courses (format: 'site', id: 1) immediately
    const beforeFilterCount = courses.length;
    courses = courses.filter((course: any) => course.format !== 'site' && course.id !== 1);
    
    console.log(`📚 [getAllCoursesWithEnrolment] After filtering: ${courses.length} courses (removed ${beforeFilterCount - courses.length} site courses)`);
    if (courses.length > 0) {
      console.log('📊 [getAllCoursesWithEnrolment] Sample course IDs:', courses.slice(0, 5).map((c: any) => `${c.id}: ${c.fullname}`));
    }
    
    console.log(`🔄 [getAllCoursesWithEnrolment] Starting to fetch enrollment info for ${courses.length} courses...`);
    
    // Get enrollment fee ONLY from Moodle's enrol_fee plugin AND custom fields for display price
    const coursesWithEnrolment = await Promise.all(courses.map(async (course: any, index: number) => {
      let cost = null;
      let currency = 'INR';
      let requiresPayment = false;
      let displayPrice = null;
      
      // Extract display price from custom fields - support common shortnames: 'cost', 'coursecost'
      if (course.customfields && Array.isArray(course.customfields)) {
        const priceField = course.customfields.find(
          (field: any) => ['cost', 'coursecost'].includes(String(field.shortname).toLowerCase()) || String(field.name).toLowerCase().includes('course cost')
        );
        if (priceField && priceField.value !== undefined && priceField.value !== null) {
          let priceVal = typeof priceField.value === 'object' ? priceField.value.text || String(priceField.value) : String(priceField.value);
          // Strip HTML tags from custom field values
          priceVal = priceVal.replace(/<[^>]*>/g, '').trim();
          if (priceVal) displayPrice = priceVal;
          console.log(`💰 Found custom field price for course ${course.id} (${course.fullname}): ${displayPrice}`);
        }

        // currency custom field
        const currencyField = course.customfields.find(
          (field: any) => ['currency'].includes(String(field.shortname).toLowerCase()) || String(field.name).toLowerCase().includes('currency')
        );
        if (currencyField && currencyField.value) {
          let currencyVal = typeof currencyField.value === 'object' ? currencyField.value.text || String(currencyField.value) : String(currencyField.value);
          // Strip HTML tags from custom field values
          currencyVal = currencyVal.replace(/<[^>]*>/g, '').trim();
          if (currencyVal) currency = currencyVal;
          console.log(`💱 Found custom field currency for course ${course.id} (${course.fullname}): ${currency}`);
        }
      }
      
      if (index < 3) {
        console.log(`🔍 [${index + 1}/${courses.length}] Checking enrollment for course ${course.id} (${course.fullname})...`);
      }
      console.log(`🔍 Checking enrollment fee for course ${course.id} (${course.fullname})...`);
      const paymentInfo = await getCoursePaymentInfo(course.id, token);
      if (paymentInfo) {
        cost = paymentInfo.cost;
        currency = paymentInfo.currency || currency;
        requiresPayment = !!paymentInfo.requiresPayment;
        // attach account info for UI diagnostics
        (course as any).paymentaccount = paymentInfo.paymentaccount || null;
        console.log(`✅ Enrollment fee from Moodle: ${currency} ${cost} (account: ${paymentInfo.paymentaccount || 'none'})`);
      } else {
        // Fallback: Use custom field price if no enrollment fee plugin is configured
        if (displayPrice) {
          cost = displayPrice;
          requiresPayment = parseFloat(String(displayPrice || '0').replace(/[^\d.]/g, '')) > 0;
          console.log(`📝 Using custom field price as cost: ${currency} ${cost}`);
        } else {
          console.log(`ℹ️ No enrollment fee configured for course ${course.id}`);
        }
      }

      // Extract course image - try multiple sources with priority
      let courseimage = null;
      
      // Try source 0: Use core_course_get_overview_files API (BEST - gets actual file URLs)
      if (!courseimage) {
        try {
          courseimage = await getCourseOverviewFiles(course.id, token);
          if (courseimage) {
            courseimage = normalizePluginfileUrl(courseimage);
            console.log(`📸 [${course.id}] Image from core_course_get_overview_files: ${courseimage}`);
          }
        } catch (err) {
          console.log(`⚠️ Could not fetch overview files for course ${course.id}: ${err}`);
        }
      }
      
      // Try source 1: overviewfiles array (from API response)
      if (!courseimage && course.overviewfiles && Array.isArray(course.overviewfiles) && course.overviewfiles.length > 0) {
        const imageUrl = course.overviewfiles[0].fileurl;
        courseimage = imageUrl ? normalizePluginfileUrl(imageUrl) : null;
        if (courseimage) console.log(`📸 [${course.id}] Image from overviewfiles: ${courseimage}`);
      }
      
      // Try source 2: courseimage field
      if (!courseimage && course.courseimage) {
        courseimage = normalizePluginfileUrl(course.courseimage);
        if (courseimage) console.log(`📸 [${course.id}] Image from courseimage: ${courseimage}`);
      }
      
      // Try source 3: imageurl field (alternative naming)
      if (!courseimage && course.imageurl) {
        courseimage = normalizePluginfileUrl(course.imageurl);
        if (courseimage) console.log(`📸 [${course.id}] Image from imageurl: ${courseimage}`);
      }
      
      // Fallback: Return null if no image found - frontend will use gradient
      if (!courseimage) {
        console.log(`📸 [${course.id}] ⚠️ No image found for: ${course.fullname}`);
      }

      return {
        ...course,
        cost,
        currency,
        requiresPayment,
        displayPrice,
        courseimage
      };
    }));

    console.log(`✅ [getAllCoursesWithEnrolment] Completed! Returning ${coursesWithEnrolment.length} courses with enrollment info`);

    return coursesWithEnrolment;
  } catch (err) {
    console.error('Error fetching courses with enrollment:', err);
    return [];
  }
}

// Get single course with enrollment/pricing info
export async function getCourseWithEnrolment(courseId: number, token?: string) {
  try {
    // Get base course data
    const course = await getCourseById(courseId, token);
    
    if (!course) {
      return null;
    }

    let cost = null;
    let currency = 'INR';
    let requiresPayment = false;
    let displayPrice = null;

    // Extract display price from custom fields if available
    if (course.customfields && Array.isArray(course.customfields)) {
      const priceField = course.customfields.find(
        (field: any) => ['cost', 'coursecost'].includes(String(field.shortname).toLowerCase()) || String(field.name).toLowerCase().includes('course cost')
      );
      if (priceField && priceField.value !== undefined && priceField.value !== null) {
        let priceVal = typeof priceField.value === 'object' ? priceField.value.text || String(priceField.value) : String(priceField.value);
        // Strip HTML tags from custom field values
        priceVal = priceVal.replace(/<[^>]*>/g, '').trim();
        if (priceVal) displayPrice = priceVal;
        console.log(`💰 Found custom field price for course ${course.id} (${course.fullname}): ${displayPrice}`);
      }

      // currency custom field
      const currencyField = course.customfields.find(
        (field: any) => ['currency'].includes(String(field.shortname).toLowerCase()) || String(field.name).toLowerCase().includes('currency')
      );
      if (currencyField && currencyField.value) {
        let currencyVal = typeof currencyField.value === 'object' ? currencyField.value.text || String(currencyField.value) : String(currencyField.value);
        // Strip HTML tags from custom field values
        currencyVal = currencyVal.replace(/<[^>]*>/g, '').trim();
        if (currencyVal) currency = currencyVal;
        console.log(`💱 Found custom field currency for course ${course.id} (${course.fullname}): ${currency}`);
      }
    }

    // Get payment/enrolment info for the course
    console.log(`🔍 Checking enrollment fee for course ${course.id} (${course.fullname})...`);
    const paymentInfo = await getCoursePaymentInfo(course.id, token);
    if (paymentInfo) {
      cost = paymentInfo.cost;
      currency = paymentInfo.currency || currency;
      requiresPayment = !!paymentInfo.requiresPayment;
      console.log(`✅ Enrollment fee from Moodle: ${currency} ${cost}`);
    } else {
      // Fallback: Use custom field price if no enrollment fee plugin is configured
      if (displayPrice) {
        cost = displayPrice;
        requiresPayment = parseFloat(String(displayPrice || '0').replace(/[^\d.]/g, '')) > 0;
        console.log(`📝 Using custom field price as cost: ${currency} ${cost}`);
      } else {
        console.log(`ℹ️ No enrollment fee configured for course ${course.id}`);
      }
    }

    return {
      ...course,
      cost,
      currency,
      requiresPayment,
      displayPrice,
    };
  } catch (error) {
    console.error('Error fetching course with enrollment:', error);
    return null;
  }
}

// Get course details by ID
export async function getCourseById(courseId: number, token?: string) {
  try {
    const response = await callMoodleAPI('core_course_get_courses_by_field', {
      field: 'id',
      value: courseId
    }, token, true);
    
    if (response && response.courses && Array.isArray(response.courses) && response.courses.length > 0) {
      return response.courses[0];
    }
    
    // Fallback: try to get from all courses
    const allCourses = await callMoodleAPI('core_course_get_courses', {}, token, true);
    
    if (Array.isArray(allCourses)) {
      const course = allCourses.find((c: any) => c.id === courseId);
      if (course) {
        return course;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error in getCourseById:', error);
    return null;
  }
}

/**
 * Fetch course image URL
 * Uses the core_course_get_courses_by_field endpoint with additional fields
 * to retrieve the course's primary image (equivalent to Moodle's course_summary_exporter::get_course_image)
 */
export async function getCourseImage(courseId: number, token?: string): Promise<string | null> {
  try {
    // Try fetching with image and overviewfiles fields
    const response = await callMoodleAPI('core_course_get_courses_by_field', {
      field: 'id',
      value: courseId,
      options: JSON.stringify({
        'summaryformat': 1,
        'coverfiles': 1
      })
    }, token, true);

    if (response?.courses?.[0]) {
      const course = response.courses[0];
      
      // Check for overviewfiles (course overview image)
      if (course.overviewfiles && Array.isArray(course.overviewfiles) && course.overviewfiles.length > 0) {
        const imageFile = course.overviewfiles[0];
        if (imageFile.fileurl) {
          return imageFile.fileurl;
        }
      }
      
      // Check for coverimageurl (Moodle 3.6+)
      if (course.coverimageurl) {
        return course.coverimageurl;
      }
      
      // Check for courseimage field (some Moodle versions)
      if (course.courseimage) {
        return course.courseimage;
      }
    }

    // Fallback: fetch full course data and extract image from there
    const fullCourse = await getCourseById(courseId, token);
    if (fullCourse?.overviewfiles?.[0]?.fileurl) {
      return fullCourse.overviewfiles[0].fileurl;
    }
    
    if (fullCourse?.coverimageurl) {
      return fullCourse.coverimageurl;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching course image for course ${courseId}:`, error);
    return null;
  }
}

// Get course contents (sections, modules)
export async function getCourseContents(courseId: number, token?: string) {
  try {
    console.log(`📚 Fetching course contents for course ${courseId}...`);
    
    const contents = await callMoodleAPI('core_course_get_contents', { courseid: courseId }, token, true);

    console.log(`📦 Raw response from Moodle:`, {
      isArray: Array.isArray(contents),
      type: typeof contents,
      hasException: (contents as any)?.exception,
      length: Array.isArray(contents) ? contents.length : 'N/A',
      preview: Array.isArray(contents) ? contents.slice(0, 1) : contents
    });

    // Check for Moodle error response
    if ((contents as any)?.exception || (contents as any)?.errorcode) {
      console.error(`❌ Moodle error:`, (contents as any).message || (contents as any).error);
      return [];
    }

    // Normalize pluginfile URLs to avoid using the /webservice/ path which requires special handling
    if (Array.isArray(contents)) {
      const normalized = contents.map((section: any) => {
        if (section && Array.isArray(section.modules)) {
          section.modules = section.modules.map((mod: any) => {
            // Ensure module has required fields
            const normalizedMod = {
              ...mod,
              name: mod.name || `${mod.modname} (${mod.id})`,
              modname: mod.modname || 'unknown',
              description: mod.description || '',
              url: mod.url ? normalizePluginfileUrl(mod.url) : undefined,
              contents: Array.isArray(mod.contents) ? mod.contents : [],
            };

            // Normalize module contents (files)
            if (Array.isArray(normalizedMod.contents)) {
              normalizedMod.contents = normalizedMod.contents.map((c: any) => {
                if (c && c.fileurl && typeof c.fileurl === 'string') {
                  c.fileurl = normalizePluginfileUrl(c.fileurl);
                }
                return c;
              });
              
              // Log video files found
              const videoFiles = normalizedMod.contents.filter((c: any) => 
                c.filename?.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)
              );
              if (videoFiles.length > 0) {
                console.log(`  🎥 Found ${videoFiles.length} video(s) in "${normalizedMod.name}"`);
                videoFiles.forEach((v: any) => {
                  console.log(`    📹 ${v.filename} (${v.filesize || 0} bytes)`);
                });
              }
            }

            return normalizedMod;
          });
        }
        return section;
      });

      console.log(`✅ Course contents loaded: ${normalized.length} sections`);
      
      // Log summary
      let totalModules = 0;
      let totalVideos = 0;
      normalized.forEach((section: any) => {
        if (section.modules) {
          totalModules += section.modules.length;
          section.modules.forEach((mod: any) => {
            if (mod.contents) {
              const videos = mod.contents.filter((c: any) => 
                c.filename?.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)
              );
              totalVideos += videos.length;
            }
          });
        }
      });
      console.log(`📊 Content summary: ${totalModules} modules, ${totalVideos} videos`);
      
      return normalized;
    }

    console.warn(`⚠️ Course contents is not an array:`, contents);
    return [];
  } catch (err) {
    console.error('❌ Error fetching course contents:', err);
    return [];
  }
}

// Replace webservice pluginfile path with the standard pluginfile path and strip tokens
function normalizePluginfileUrl(url: string) {
  try {
    if (!url || typeof url !== 'string') return url;

    // Handle both pluginfile.php and draftfile.php
    let newUrl = url;
    if (newUrl.includes('/webservice/pluginfile.php')) {
      newUrl = newUrl.replace('/webservice/pluginfile.php', '/pluginfile.php');
    } else if (newUrl.includes('/webservice/draftfile.php')) {
      newUrl = newUrl.replace('/webservice/draftfile.php', '/draftfile.php');
    }

    // Parse URL to manipulate parameters
    const u = new URL(newUrl);
    
    // Remove any webservice token query parameters
    const paramsToRemove = [
      'token', 
      'wstoken', 
      'moodlewsrestformat', 
      'forcedownload', 
      'download',
      'preview' // Sometimes preview=thumb causes issues with SVG
    ];
    
    paramsToRemove.forEach(param => {
      if (u.searchParams.has(param)) {
        u.searchParams.delete(param);
      }
    });

    // Reconstruct URL without the unwanted params
    return u.toString();
  } catch (e) {
    console.error('Error normalizing Moodle URL:', e);
    return url;
  }
}

// Get enrolled users in a course
export async function getEnrolledUsers(courseId: number, token?: string) {
  return callMoodleAPI('core_enrol_get_enrolled_users', { courseid: courseId }, token);
}

// Get user's enrolled courses
export async function getUserCourses(userId: number, token: string) {
  try {
    const courses = await callMoodleAPI('core_enrol_get_users_courses', { userid: userId }, token);
    
    if (!Array.isArray(courses)) {
      return [];
    }
    
    // Add course images from overviewfiles
    return courses.map((course: any) => {
      let courseimage = null;
      if (course.overviewfiles && Array.isArray(course.overviewfiles) && course.overviewfiles.length > 0) {
        courseimage = normalizePluginfileUrl(course.overviewfiles[0].fileurl);
      } else if (course.courseimage) {
        courseimage = normalizePluginfileUrl(course.courseimage);
      }
      
      return {
        ...course,
        courseimage
      };
    });
  } catch (error) {
    console.error('Error fetching user courses:', error);
    return [];
  }
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
  
  Object.entries(updates).forEach(([key, value]) => {
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
// ============ PAYMENT API FUNCTIONS ============

/**
 * Get payment accounts configured in Moodle
 * Required capability: moodle/payment:viewpayments
 */
export async function getPaymentAccounts(token?: string) {
  return callMoodleAPI('core_payment_get_available_gateways', {}, token);
}

/**
 * Get Razorpay configuration for a specific payment area
 * This returns the API keys and configuration needed for Razorpay integration
 */
export async function getRazorpayConfig(courseId: number, token?: string) {
  return callMoodleAPI('paygw_razorpay_get_config_for_js', {
    component: 'enrol_fee',
    paymentarea: 'fee',
    itemid: courseId
  }, token);
}

/**
 * Create a pending payment transaction in Moodle
 * This should be called before initiating Razorpay payment
 */
export async function createPaymentTransaction(
  courseId: number,
  amount: number,
  currency: string,
  userId: number,
  token?: string
) {
  return callMoodleAPI('core_payment_create_payment_intent', {
    component: 'enrol_fee',
    paymentarea: 'fee',
    itemid: courseId,
    amount: amount,
    currency: currency,
    userid: userId
  }, token);
}

/**
 * Complete a Razorpay payment transaction
 * This enrolls the user after successful payment
 */
export async function completeRazorpayTransaction(
  courseId: number,
  orderId: string,
  paymentId: string,
  signature: string,
  token?: string
) {
  return callMoodleAPI('paygw_razorpay_create_transaction_complete', {
    component: 'enrol_fee',
    paymentarea: 'fee',
    itemid: courseId,
    orderid: orderId,
    paymentid: paymentId,
    signature: signature
  }, token);
}

/**
 * Manually enroll user in course (admin/payment token required)
 * Used as fallback when payment gateway is not configured
 */
export async function manualEnrollUser(
  courseId: number,
  userId: number,
  roleId: number = 5, // 5 = Student role
  token?: string
) {
  return callMoodleAPI('enrol_manual_enrol_users', {
    enrolments: JSON.stringify([{
      roleid: roleId,
      userid: userId,
      courseid: courseId
    }])
  }, token);
}

// ======= PAYMENT / PRICE HELPERS =======
/**
 * Return normalized payment/enrolment info for a course
 * Looks for an enrol instance with enrol === 'fee' and returns parsed details
 */
export async function getCoursePaymentInfo(courseId: number, token?: string) {
  try {
    const instances = await getCourseEnrolmentInstances(courseId, token);
    if (!Array.isArray(instances)) return null;

    for (const inst of instances) {
      const enrol = String(inst.enrol || '');
      const status = String(inst.status || '');

      if (enrol === 'fee') {
        const enabled = status === '0';
        const cost = (inst.cost ?? '0').toString();
        const currency = inst.currency || 'INR';

        // Try to detect payment account from known keys / customdata
        let paymentaccount: string | null = null;
        try {
          if (inst.customdata) {
            const cd = typeof inst.customdata === 'string' ? JSON.parse(inst.customdata) : inst.customdata;
            paymentaccount = cd?.paymentaccount || cd?.payment || cd?.payment_account || null;
          }
        } catch {
          // ignore parse errors
        }
        paymentaccount = paymentaccount || (inst.paymentaccount as any) || (inst.payment_account as any) || null;

        return {
          enabled,
          cost: String(cost),
          currency,
          requiresPayment: parseFloat(String(cost || '0')) > 0,
          paymentaccount,
          instanceid: inst.id ?? inst.instance ?? null,
          raw: inst
        };
      }
    }

    return null;
  } catch (err) {
    console.error('Error in getCoursePaymentInfo:', err);
    return null;
  }
}

/**
 * Fetch all courses and attach payment info to each course
 */
export async function getAllCoursesWithPaymentInfo(token?: string) {
  try {
    const courses = await callMoodleAPI('core_course_get_courses', {}, token);
    if (!Array.isArray(courses)) return [];

    const results = await Promise.all(courses.map(async (c: any) => {
      const payment = await getCoursePaymentInfo(c.id, token);
      return {
        ...c,
        payment
      };
    }));

    return results;
  } catch (err) {
    console.error('Error in getAllCoursesWithPaymentInfo:', err);
    return [];
  }
}

/**
 * Get Razorpay config for a course payment area using available payment token
 */
export async function getRazorpayConfigForCourse(courseId: number, token?: string) {
  const useToken = token || process.env.MOODLE_PAYMENT_TOKEN || process.env.MOODLE_TOKEN;
  try {
    const cfg = await callMoodleAPI('paygw_razorpay_get_config_for_js', {
      component: 'enrol_fee',
      paymentarea: 'fee',
      itemid: courseId
    }, useToken);
    return cfg;
  } catch (err) {
    console.error('Error fetching Razorpay config for course', courseId, err);
    return null;
  }
}

/**
 * Convenience check whether a course has payment configured and enabled
 */
export async function isCoursePayConfigured(courseId: number, token?: string) {
  try {
    const info = await getCoursePaymentInfo(courseId, token);
    if (!info || !info.enabled || !info.requiresPayment) return false;
    const cfg = await getRazorpayConfigForCourse(courseId, token);
    if (!cfg) return false;
    if ((cfg as any).exception) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Self enroll user in course (user's own token)
 * Requires self-enrollment to be enabled on the course
 */
export async function selfEnrollUser(courseId: number, token: string) {
  return callMoodleAPI('enrol_self_enrol_user', {
    courseid: courseId
  }, token);
}