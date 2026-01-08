// Centralized Moodle API functions
/* eslint-disable @typescript-eslint/no-explicit-any */

const MOODLE_URL = process.env.MOODLE_URL || process.env.NEXT_PUBLIC_MOODLE_URL || '';
const MOODLE_TOKEN = process.env.MOODLE_TOKEN || '';
const MOODLE_COURSE_TOKEN = process.env.MOODLE_COURSE_TOKEN || '';

interface MoodleParams {
  [key: string]: string | number | boolean;
}

export async function callMoodleAPI(
  wsfunction: string,
  params: MoodleParams = {},
  token?: string,
  tryFallbackToken: boolean = false
) {
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
      { method: 'POST' }
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
  
  return result;
}

// Get all available courses
export async function getAllCourses() {
  return callMoodleAPI('core_course_get_courses', {}, undefined, true);
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
    // Fetch all courses from Moodle
    let courses = await callMoodleAPI('core_course_get_courses', {}, token, true);
    
    console.log('📚 Fetched courses from Moodle:', Array.isArray(courses) ? courses.length : 'ERROR - ' + JSON.stringify(courses));
    
    // If the response is an error object, return empty
    if (courses?.exception || courses?.errorcode) {
      console.error('❌ Moodle API returned error:', courses);
      return [];
    }
    
    if (!Array.isArray(courses)) {
      console.error('❌ Moodle API did not return array:', courses);
      return [];
    }
    
    // Filter out site courses (format: 'site', id: 1) immediately
    courses = courses.filter((course: any) => course.format !== 'site' && course.id !== 1);
    
    console.log('📚 After filtering site courses:', courses.length);

    if (courses.length > 0) {
      console.log('📊 Sample course data (first course):', JSON.stringify(courses[0], null, 2).substring(0, 500));
    }
    
    // Get enrollment fee ONLY from Moodle's enrol_fee plugin AND custom fields for display price
    const coursesWithEnrolment = await Promise.all(courses.map(async (course: any) => {
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
      
      // Get payment/enrolment info for the course
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
        console.log(`ℹ️ No enrollment fee configured for course ${course.id}`);
      }

      // Extract course image
      const courseimage = null;
      if (course.overviewfiles && Array.isArray(course.overviewfiles) && course.overviewfiles.length > 0) {
        return { ...course, cost, currency, requiresPayment, displayPrice, courseimage: normalizePluginfileUrl(course.overviewfiles[0].fileurl) };
      } else if (course.courseimage) {
        return { ...course, cost, currency, requiresPayment, displayPrice, courseimage: normalizePluginfileUrl(course.courseimage) };
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
      console.log(`ℹ️ No enrollment fee configured for course ${course.id}`);
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
            // Normalize direct module URLs
            if (mod.url && typeof mod.url === 'string') {
              mod.url = normalizePluginfileUrl(mod.url);
            }

            // Normalize module contents (files)
            if (Array.isArray(mod.contents)) {
              mod.contents = mod.contents.map((c: any) => {
                if (c && c.fileurl && typeof c.fileurl === 'string') {
                  c.fileurl = normalizePluginfileUrl(c.fileurl);
                }
                return c;
              });
            }

            return mod;
          });
        }
        return section;
      });

      console.log(`✅ Course contents loaded: ${normalized.length} sections`);
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

    // Replace /webservice/pluginfile.php with /pluginfile.php
    const newUrl = url.replace('/webservice/pluginfile.php', '/pluginfile.php');

    // Remove any webservice token query parameters (like token=... or wstoken=...)
    const u = new URL(newUrl);
    if (u.searchParams.has('token')) u.searchParams.delete('token');
    if (u.searchParams.has('wstoken')) u.searchParams.delete('wstoken');
    // Also remove moodlewsrestformat if present
    if (u.searchParams.has('moodlewsrestformat')) u.searchParams.delete('moodlewsrestformat');
    // Remove forcedownload param to avoid download forcing
    if (u.searchParams.has('forcedownload')) u.searchParams.delete('forcedownload');
    if (u.searchParams.has('forcedownload')) u.searchParams.delete('forcedownload');
    if (u.searchParams.has('download')) u.searchParams.delete('download');

    // Reconstruct URL without the unwanted params
    u.search = u.searchParams.toString();
    return u.toString();
  } catch {
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