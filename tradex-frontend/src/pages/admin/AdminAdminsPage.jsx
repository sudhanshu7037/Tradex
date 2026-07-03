import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCog, Plus, Trash2, Loader2, Mail, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAccountService, adminRoleService } from '../../services/adminService';
import { ErrorState } from '../../components/shared/States';

const AdminAdminsPage = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

  const { data: adminsRes, isLoading: adminsLoading, isError: adminsError, refetch } = useQuery({
    queryKey: ['adminAccounts'],
    queryFn: () => adminAccountService.getAdmins(),
  });

  const { data: rolesRes } = useQuery({
    queryKey: ['adminRoles'],
    queryFn: adminRoleService.getRoles,
  });

  const createAdminMutation = useMutation({
    mutationFn: (data) => adminAccountService.createAdmin(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Admin account created successfully');
      setShowModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setSelectedRoles([]);
      queryClient.invalidateQueries(['adminAccounts']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create admin account');
    }
  });

  const deleteAdminMutation = useMutation({
    mutationFn: (id) => adminAccountService.deleteAdmin(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Admin account deleted successfully');
      queryClient.invalidateQueries(['adminAccounts']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete admin account');
    }
  });

  const handleToggleRole = (roleId) => {
    setSelectedRoles(prev =>
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Name, email, and password are required');
      return;
    }
    createAdminMutation.mutate({
      name,
      email,
      password,
      status: 'active',
      roles: selectedRoles
    });
  };

  const handleDelete = (admin) => {
    if (window.confirm(`Are you sure you want to delete administrator "${admin.name}"?`)) {
      deleteAdminMutation.mutate(admin.id);
    }
  };

  const admins = adminsRes?.data?.items || [];
  const roles = rolesRes?.data?.roles || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-trade-text tracking-tight flex items-center gap-2.5">
            <UserCog className="w-7 h-7 text-emerald-500" />
            Administrative Accounts
          </h1>
          <p className="text-sm text-trade-muted mt-1">
            Manage authorized staff members and configure their system role entitlements.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 text-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Provision New Admin
        </button>
      </div>

      <div className="glass-card overflow-hidden border border-trade-border shadow-sm">
        {adminsLoading ? (
          <div className="p-12 flex justify-center items-center gap-3 text-trade-muted">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span>Loading admin staff directory...</span>
          </div>
        ) : adminsError ? (
          <ErrorState message="Failed to load administrative accounts" retry={refetch} />
        ) : admins.length === 0 ? (
          <div className="p-12 text-center text-trade-muted">
            <UserCog className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-500" />
            <p className="font-medium text-trade-text">No administrative accounts listed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-trade-border bg-trade-bg/50 text-xs font-bold text-trade-muted uppercase tracking-wider">
                  <th className="py-3.5 px-6">Administrator</th>
                  <th className="py-3.5 px-6">Assigned Roles</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Created At</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-trade-border/40 text-sm">
                {admins.map((a) => (
                  <tr key={a.id} className="hover:bg-trade-bg/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-trade-text flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs">
                          {a.name?.charAt(0)}
                        </div>
                        {a.name}
                      </div>
                      <div className="text-xs text-trade-muted flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {a.email}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {a.roles?.map(r => (
                          <span key={r.id} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                            <Shield className="w-2.5 h-2.5 inline mr-1" />
                            {r.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {a.status || 'active'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-trade-muted">
                      {a.created_at ? new Date(a.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(a)}
                        title="Delete Admin Account"
                        className="p-2 rounded-lg text-trade-muted hover:text-trade-red hover:bg-trade-red/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-trade-card border border-trade-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-trade-border flex justify-between items-center">
              <h3 className="font-bold text-lg text-trade-text">Provision Admin Staff Account</h3>
              <button onClick={() => setShowModal(false)} className="text-trade-muted hover:text-trade-text font-bold">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-trade-muted uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field py-2 text-sm"
                  placeholder="Alex Vance"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-trade-muted uppercase mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field py-2 text-sm"
                  placeholder="alex.vance@tradex.local"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-trade-muted uppercase mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field py-2 text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-trade-muted uppercase mb-2">Assign Access Role(s)</label>
                <div className="space-y-2 max-h-36 overflow-y-auto p-3 rounded-xl bg-trade-bg border border-trade-border">
                  {roles.map((r) => {
                    const checked = selectedRoles.includes(r.id);
                    return (
                      <div
                        key={r.id}
                        onClick={() => handleToggleRole(r.id)}
                        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors text-xs ${
                          checked
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500 font-semibold'
                            : 'border-trade-border/60 hover:bg-trade-card text-trade-text'
                        }`}
                      >
                        <div>
                          <p className="font-bold">{r.name}</p>
                          <p className="text-[10px] opacity-75">{r.slug}</p>
                        </div>
                        <input type="checkbox" checked={checked} readOnly className="accent-emerald-500" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-trade-border">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-xs py-2">Cancel</button>
                <button type="submit" disabled={createAdminMutation.isPending} className="btn-primary text-xs py-2 flex items-center gap-2">
                  {createAdminMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdminsPage;
