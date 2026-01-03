// Moodle REST API Type Definitions

export interface MoodleSiteInfo {
  sitename: string;
  username: string;
  firstname: string;
  lastname: string;
  fullname: string;
  userid: number;
  siteurl: string;
  userpictureurl?: string;
  functions?: Array<{ name: string; version: string }>;
  downloadfiles?: number;
  uploadfiles?: number;
  release?: string;
  version?: string;
  userprivileges?: {
    canmanagecourses?: boolean;
    canviewallcourses?: boolean;
    canmanagetags?: boolean;
  };
}

// Moodle user roles
export type MoodleRole = 'admin' | 'teacher' | 'student' | 'editingteacher' | 'manager';

export interface MoodleUserRole {
  roleid: number;
  shortname: MoodleRole;
  name: string;
  archetype?: string;
}

export interface MoodleCapability {
  name: string;
  capabilityname: string;
  value: number; // 1 = allowed, 0 = not set, -1000 = prohibited
}

export interface MoodleCourse {
  id: number;
  shortname: string;
  fullname: string;
  displayname?: string;
  enrolledusercount?: number;
  idnumber?: string;
  visible?: number;
  summary?: string;
  summaryformat?: number;
  format?: string;
  showgrades?: boolean;
  lang?: string;
  enablecompletion?: boolean;
  category?: number;
  progress?: number;
  startdate?: number;
  enddate?: number;
  cost?: string;
  currency?: string;
  courseimage?: string;
}

export interface MoodleCourseContent {
  id: number;
  name: string;
  visible?: number;
  summary?: string;
  summaryformat?: number;
  section?: number;
  hiddenbynumsections?: number;
  uservisible?: boolean;
  modules?: MoodleModule[];
}

export interface MoodleModule {
  id: number;
  url?: string;
  name: string;
  instance?: number;
  description?: string;
  visible?: number;
  uservisible?: boolean;
  modicon?: string;
  modname?: string;
  modplural?: string;
  indent?: number;
  onclick?: string;
  afterlink?: string;
  customdata?: string;
  completion?: number;
  completiondata?: {
    state: number;
    timecompleted?: number;
  };
  contents?: Array<{
    type: string;
    filename: string;
    filepath?: string;
    filesize?: number;
    fileurl?: string;
    timecreated?: number;
    timemodified?: number;
    mimetype?: string;
  }>;
}

export interface MoodleUser {
  id: number;
  username?: string;
  firstname?: string;
  lastname?: string;
  fullname: string;
  email?: string;
  profileimageurl?: string;
  profileimageurlsmall?: string;
}

export interface MoodleGrade {
  courseid: number;
  itemname: string;
  graderaw?: number;
  gradeformatted?: string;
  grademax?: number;
  grademin?: number;
  feedback?: string;
  gradedategraded?: number;
}

export interface MoodleAssignment {
  id: number;
  course: number;
  name: string;
  intro?: string;
  introformat?: number;
  duedate?: number;
  allowsubmissionsfromdate?: number;
  grade?: number;
  timemodified?: number;
  completionsubmit?: number;
  cutoffdate?: number;
  gradingduedate?: number;
  submissiondrafts?: number;
  requiresubmissionstatement?: number;
}

export interface MoodleEnrollment {
  id: number;
  userid: number;
  courseid: number;
  roleid: number;
  timestart: number;
  timeend: number;
  status: number;
}

export interface MoodleApiError {
  error?: string;
  errorcode?: string;
  message?: string;
  debuginfo?: string;
  exception?: string;
}

export interface MoodleApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

// Payment gateway types from Moodle
export interface MoodlePaymentAccount {
  id: number;
  name: string;
  enabled: boolean;
  archived: boolean;
}

export interface MoodlePaymentGateway {
  name: string;
  enabled: boolean;
  config: {
    apikey?: string;
    brand_name?: string;
  };
}

export interface MoodleEnrolmentInstance {
  id: number;
  courseid: number;
  enrol: string;
  status: number; // 0 = enabled, 1 = disabled
  name?: string;
  password?: string;
  customint1?: number;
  customint2?: number;
  customint3?: number;
  customchar1?: string;
  customchar2?: string;
  roleid: number;
  cost?: string;
  currency?: string;
}

// eCommerce types - deprecated, will use Moodle data
export interface CartItem {
  courseId: number;
  courseName: string;
  price: number;
  thumbnailUrl?: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  count: number;
}
