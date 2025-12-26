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
  // eCommerce fields
  price?: number;
  originalPrice?: number;
  discountPercent?: number;
  courseType?: 'LIVE CLASS' | 'RECORDED' | 'VIDEOS' | 'FILES' | 'MENTORSHIP' | 'FREE CONTENT';
  categoryName?: 'Basic' | 'Advanced' | 'Scalping' | 'Options Trading' | 'Intraday' | 'Risk Management' | 'Technical Analysis';
  isFeatured?: boolean;
  isPopular?: boolean;
  hasLimitedOffer?: boolean;
  thumbnailUrl?: string;
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

// eCommerce types
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
