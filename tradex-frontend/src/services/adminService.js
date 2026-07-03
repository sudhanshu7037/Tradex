import adminApi from '../api/adminAxiosInstance';

export const adminAuthService = {
  login: async (credentials) => {
    const res = await adminApi.post('/login', credentials);
    return res.data;
  },
  getProfile: async () => {
    const res = await adminApi.get('/profile');
    return res.data;
  },
  logout: async () => {
    const res = await adminApi.post('/logout');
    return res.data;
  }
};

export const adminDashboardService = {
  getMetrics: async () => {
    const res = await adminApi.get('/dashboard');
    return res.data;
  },
  getRecentActivities: async () => {
    const res = await adminApi.get('/recent-activities');
    return res.data;
  }
};

export const adminUserService = {
  getUsers: async (params = {}) => {
    const res = await adminApi.get('/users', { params });
    return res.data;
  },
  getUser: async (id) => {
    const res = await adminApi.get(`/users/${id}`);
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await adminApi.patch(`/users/${id}/status`, { status });
    return res.data;
  },
  blockUser: async (id) => {
    const res = await adminApi.patch(`/users/${id}/block`);
    return res.data;
  },
  unblockUser: async (id) => {
    const res = await adminApi.patch(`/users/${id}/unblock`);
    return res.data;
  },
  adjustBalance: async (id, payload) => {
    const res = await adminApi.post(`/users/${id}/adjust-balance`, payload);
    return res.data;
  },
  deleteUser: async (id) => {
    const res = await adminApi.delete(`/users/${id}`);
    return res.data;
  }
};

export const adminAssetService = {
  getAssets: async (params = {}) => {
    const res = await adminApi.get('/assets', { params });
    return res.data;
  },
  addAsset: async (payload) => {
    const res = await adminApi.post('/assets', payload);
    return res.data;
  },
  updateAsset: async (id, payload) => {
    const res = await adminApi.patch(`/assets/${id}`, payload);
    return res.data;
  },
  freezeMarket: async (freeze) => {
    const res = await adminApi.patch('/market/freeze', { freeze });
    return res.data;
  }
};

export const adminPortfolioService = {
  getPortfolios: async (params = {}) => {
    const res = await adminApi.get('/portfolios', { params });
    return res.data;
  },
  getUserPortfolio: async (userId) => {
    const res = await adminApi.get(`/portfolios/${userId}`);
    return res.data;
  }
};

export const adminOrderService = {
  getOrders: async (params = {}) => {
    const res = await adminApi.get('/orders', { params });
    return res.data;
  },
  cancelOrder: async (id) => {
    const res = await adminApi.patch(`/orders/${id}/cancel`);
    return res.data;
  }
};

export const adminTransactionService = {
  getTransactions: async (params = {}) => {
    const res = await adminApi.get('/transactions', { params });
    return res.data;
  },
  getTransaction: async (id) => {
    const res = await adminApi.get(`/transactions/${id}`);
    return res.data;
  }
};

export const adminWatchlistService = {
  getWatchlists: async (params = {}) => {
    const res = await adminApi.get('/watchlists', { params });
    return res.data;
  },
  getUserWatchlist: async (userId) => {
    const res = await adminApi.get(`/watchlists/${userId}`);
    return res.data;
  }
};

export const adminRoleService = {
  getRoles: async () => {
    const res = await adminApi.get('/roles');
    return res.data;
  },
  getRole: async (id) => {
    const res = await adminApi.get(`/roles/${id}`);
    return res.data;
  },
  createRole: async (data) => {
    const res = await adminApi.post('/roles', data);
    return res.data;
  },
  updateRole: async (id, data) => {
    const res = await adminApi.put(`/roles/${id}`, data);
    return res.data;
  },
  deleteRole: async (id) => {
    const res = await adminApi.delete(`/roles/${id}`);
    return res.data;
  }
};

export const adminPermissionService = {
  getPermissions: async () => {
    const res = await adminApi.get('/permissions');
    return res.data;
  },
  createPermission: async (data) => {
    const res = await adminApi.post('/permissions', data);
    return res.data;
  },
  updatePermission: async (id, data) => {
    const res = await adminApi.put(`/permissions/${id}`, data);
    return res.data;
  },
  deletePermission: async (id) => {
    const res = await adminApi.delete(`/permissions/${id}`);
    return res.data;
  }
};

export const adminAccountService = {
  getAdmins: async (params = {}) => {
    const res = await adminApi.get('/admins', { params });
    return res.data;
  },
  createAdmin: async (data) => {
    const res = await adminApi.post('/admins', data);
    return res.data;
  },
  updateAdmin: async (id, data) => {
    const res = await adminApi.put(`/admins/${id}`, data);
    return res.data;
  },
  deleteAdmin: async (id) => {
    const res = await adminApi.delete(`/admins/${id}`);
    return res.data;
  }
};

export const adminAuditService = {
  getAuditLogs: async (params = {}) => {
    const res = await adminApi.get('/audit-logs', { params });
    return res.data;
  },
  getAuditLog: async (id) => {
    const res = await adminApi.get(`/audit-logs/${id}`);
    return res.data;
  }
};

export const adminSettingsService = {
  getSettings: async () => {
    const res = await adminApi.get('/settings');
    return res.data;
  },
  updateSettings: async (settingsArray) => {
    const res = await adminApi.put('/settings', { settings: settingsArray });
    return res.data;
  }
};
