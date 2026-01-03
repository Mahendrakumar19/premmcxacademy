/**
 * Role-Based Access Control (RBAC) Utilities
 * 
 * This module provides utilities for managing role-based permissions
 * based on Moodle user roles.
 */

import { Session } from 'next-auth';

export type UserRole = 'admin' | 'teacher' | 'student';

/**
 * Role hierarchy for permission checking
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  teacher: 2,
  student: 1,
};

/**
 * Check if user has a specific role
 */
export function hasRole(session: Session | null, role: UserRole): boolean {
  if (!session?.user?.role) return false;
  return session.user.role === role;
}

/**
 * Check if user has at least a certain role level
 */
export function hasMinimumRole(session: Session | null, role: UserRole): boolean {
  if (!session?.user?.role) return false;
  return ROLE_HIERARCHY[session.user.role] >= ROLE_HIERARCHY[role];
}

/**
 * Check if user is admin
 */
export function isAdmin(session: Session | null): boolean {
  return hasRole(session, 'admin');
}

/**
 * Check if user is teacher or higher
 */
export function isTeacher(session: Session | null): boolean {
  return hasMinimumRole(session, 'teacher');
}

/**
 * Check if user is student
 */
export function isStudent(session: Session | null): boolean {
  return hasRole(session, 'student');
}

/**
 * Get user role name for display
 */
export function getRoleDisplayName(role?: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'teacher':
      return 'Teacher';
    case 'student':
      return 'Student';
    default:
      return 'Guest';
  }
}

/**
 * Admin capabilities
 */
export const ADMIN_CAPABILITIES = [
  'moodle/site:config',
  'moodle/user:create',
  'moodle/user:delete',
  'moodle/course:create',
  'moodle/course:delete',
  'moodle/category:manage',
  'moodle/role:assign',
  'moodle/backup:backupcourse',
  'moodle/restore:restorecourse',
];

/**
 * Teacher capabilities
 */
export const TEACHER_CAPABILITIES = [
  'moodle/course:update',
  'moodle/course:manageactivities',
  'moodle/course:activityvisibility',
  'moodle/grade:edit',
  'moodle/grade:manage',
  'enrol/manual:enrol',
  'enrol/manual:unenrol',
  'moodle/course:viewhiddenactivities',
  'moodle/course:sectionvisibility',
];

/**
 * Student capabilities
 */
export const STUDENT_CAPABILITIES = [
  'moodle/course:view',
  'mod/assign:submit',
  'mod/quiz:attempt',
  'mod/forum:startdiscussion',
  'mod/forum:replypost',
];

/**
 * Get capabilities for a role
 */
export function getCapabilitiesForRole(role: UserRole): string[] {
  switch (role) {
    case 'admin':
      return [...ADMIN_CAPABILITIES, ...TEACHER_CAPABILITIES, ...STUDENT_CAPABILITIES];
    case 'teacher':
      return [...TEACHER_CAPABILITIES, ...STUDENT_CAPABILITIES];
    case 'student':
      return STUDENT_CAPABILITIES;
    default:
      return [];
  }
}

/**
 * Check if user can create courses
 */
export function canCreateCourses(session: Session | null): boolean {
  return isTeacher(session);
}

/**
 * Check if user can manage enrollments
 */
export function canManageEnrollments(session: Session | null): boolean {
  return isTeacher(session);
}

/**
 * Check if user can view all courses
 */
export function canViewAllCourses(session: Session | null): boolean {
  return isTeacher(session);
}

/**
 * Check if user can manage site settings
 */
export function canManageSite(session: Session | null): boolean {
  return isAdmin(session);
}

/**
 * Check if user can access admin dashboard
 */
export function canAccessAdminDashboard(session: Session | null): boolean {
  return isAdmin(session);
}

/**
 * Check if user can access teacher dashboard
 */
export function canAccessTeacherDashboard(session: Session | null): boolean {
  return isTeacher(session);
}

/**
 * Get navigation items based on user role
 */
export function getNavigationItems(session: Session | null) {
  const baseItems = [
    { label: 'Home', href: '/', roles: ['admin', 'teacher', 'student'] },
    { label: 'Courses', href: '/courses', roles: ['admin', 'teacher', 'student'] },
    { label: 'My Courses', href: '/my-courses', roles: ['admin', 'teacher', 'student'] },
  ];

  const teacherItems = [
    { label: 'Create Course', href: '/teacher/create-course', roles: ['admin', 'teacher'] },
    { label: 'My Classes', href: '/teacher/classes', roles: ['admin', 'teacher'] },
    { label: 'Enrollments', href: '/teacher/enrollments', roles: ['admin', 'teacher'] },
  ];

  const adminItems = [
    { label: 'Admin Panel', href: '/admin', roles: ['admin'] },
    { label: 'User Management', href: '/admin/users', roles: ['admin'] },
    { label: 'Site Settings', href: '/admin/settings', roles: ['admin'] },
  ];

  const studentItems = [
    { label: 'Dashboard', href: '/dashboard', roles: ['admin', 'teacher', 'student'] },
    { label: 'Grades', href: '/dashboard/grades', roles: ['admin', 'teacher', 'student'] },
  ];

  const allItems = [...baseItems, ...studentItems, ...teacherItems, ...adminItems];

  return allItems.filter((item) => {
    if (!session?.user?.role) return false;
    return item.roles.includes(session.user.role);
  });
}
