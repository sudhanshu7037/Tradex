import { create } from 'zustand';

export const useAdminAuthStore = create((set, get) => ({
  admin: null,
  token: localStorage.getItem('tradex_admin_token') || null,
  isAuthenticated: !!localStorage.getItem('tradex_admin_token'),

  setAuth: (admin, token) => {
    localStorage.setItem('tradex_admin_token', token);
    set({ admin, token, isAuthenticated: true });
  },

  setAdmin: (admin) => set({ admin }),

  logout: () => {
    localStorage.removeItem('tradex_admin_token');
    set({ admin: null, token: null, isAuthenticated: false });
  },

  hasPermission: (slug) => {
    const { admin } = get();
    if (!admin) return false;

    // Check if user is super admin
    if (admin.roles && Array.isArray(admin.roles)) {
      const isSuperAdmin = admin.roles.some(r => 
        r === 'super_admin' || r?.slug === 'super_admin' || r?.name === 'Super Admin'
      );
      if (isSuperAdmin) return true;
    }

    // Check top-level permissions array (if returned as string array or object array)
    if (admin.permissions && Array.isArray(admin.permissions)) {
      if (admin.permissions.some(p => p === slug || p?.slug === slug)) {
        return true;
      }
    }

    // Check individual permissions assigned inside role objects
    if (admin.roles && Array.isArray(admin.roles)) {
      for (const role of admin.roles) {
        if (role?.permissions && Array.isArray(role.permissions)) {
          if (role.permissions.some(p => p === slug || p?.slug === slug)) {
            return true;
          }
        }
      }
    }

    return false;
  },

  hasRole: (slug) => {
    const { admin } = get();
    if (!admin || !admin.roles) return false;
    return admin.roles.some(r => r === slug || r?.slug === slug);
  }
}));
