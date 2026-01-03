/**
 * Role-Based Navigation Hook
 * Provides navigation items based on user role
 */
'use client';

import { useSession } from 'next-auth/react';
import { getNavigationItems, isAdmin, isTeacher, isStudent } from '@/lib/rbac';

export interface NavigationItem {
  label: string;
  href: string;
  roles: string[];
  icon?: string;
}

export function useRoleBasedNavigation() {
  const { data: session } = useSession();
  
  return {
    navigationItems: getNavigationItems(session),
    isAdmin: isAdmin(session),
    isTeacher: isTeacher(session),
    isStudent: isStudent(session),
    role: session?.user?.role,
  };
}
