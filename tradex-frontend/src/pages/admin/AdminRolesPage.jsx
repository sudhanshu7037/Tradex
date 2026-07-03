import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Plus, Trash2, Loader2, Lock, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminRoleService, adminPermissionService } from '../../services/adminService';
import { ErrorState } from '../../components/shared/States';

const AdminRolesPage = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const { data: rolesRes, isLoading: rolesLoading, isError: rolesError, refetch } = useQuery({
    queryKey: ['adminRoles'],
    queryFn: adminRoleService.getRoles,
  });

  const { data: permsRes } = useQuery({
    queryKey: ['adminPermissions'],
    queryFn: adminPermissionService.getPermissions,
  });

  const createRoleMutation = useMutation({
    mutationFn: (data) => adminRoleService.createRole(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Role created successfully');
      setShowModal(false);
      setName('');
      setSlug('');
      setDescription('');
      setSelectedPermissions([]);
      queryClient.invalidateQueries(['adminRoles']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create role');
    }
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id) => adminRoleService.deleteRole(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Role deleted successfully');
      queryClient.invalidateQueries(['adminRoles']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete role');
    }
  });

  const handleTogglePerm = (permId) => {
    setSelectedPermissions(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error('Role Name and Slug are required');
      return;
    }
    createRoleMutation.mutate({
      name,
      slug: slug.toLowerCase().replace(/\s+/g, '_'),
      description,
      permissions: selectedPermissions
    });
  };

  const handleDelete = (role) => {
    if (role.is_system || role.slug === 'super_admin') {
      toast.error('System and Super Admin roles cannot be deleted');
      return;
    }
    if (window.confirm(`Are you sure you want to delete role "${role.name}"?`)) {
      deleteRoleMutation.mutate(role.id);
    }
  };

  const roles = rolesRes?.data?.roles || [];
  const permissions = permsRes?.data?.permissions || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-trade-text tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-emerald-500" />
            Roles Management (RBAC)
          </h1>
          <p className="text-sm text-trade-muted mt-1">
            Configure administrator access tiers and assign fine-grained micro-permissions.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 text-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rolesLoading ? (
          <div className="col-span-full py-12 text-center text-trade-muted">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" />
            <span>Loading system roles...</span>
          </div>
        ) : rolesError ? (
          <div className="col-span-full">
            <ErrorState message="Failed to load roles" retry={refetch} />
          </div>
        ) : (
          roles.map((r) => (
            <div key={r.id} className="glass-card p-6 border border-trade-border flex flex-col justify-between relative overflow-hidden group">
              {r.is_system && (
                <div className="absolute top-0 right-0 bg-emerald-500/15 text-emerald-500 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider border-b border-l border-emerald-500/20">
                  Protected System Role
                </div>
              )}
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-trade-text text-base">{r.name}</h3>
                    <p className="text-xs text-trade-muted font-mono">{r.slug}</p>
                  </div>
                </div>
                <p className="text-xs text-trade-muted mt-3 line-clamp-2">
                  {r.description || 'No specific description assigned to this role.'}
                </p>

                <div className="mt-5 pt-4 border-t border-trade-border/60">
                  <span className="text-[11px] font-semibold text-trade-muted uppercase tracking-wider block mb-2">
                    Assigned Permissions ({r.permissions?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {r.permissions?.length > 0 ? (
                      r.permissions.map((p) => (
                        <span key={p.id} className="text-[11px] px-2 py-0.5 rounded-md bg-trade-bg text-trade-text border border-trade-border">
                          {p.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-trade-muted italic">No specific permissions attached</span>
                    )}
                  </div>
                </div>
              </div>

              {!r.is_system && r.slug !== 'super_admin' && (
                <div className="mt-6 pt-4 border-t border-trade-border flex justify-end">
                  <button
                    onClick={() => handleDelete(r)}
                    className="text-xs text-trade-red hover:bg-trade-red/10 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Role
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Role Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-trade-card border border-trade-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-trade-border flex justify-between items-center">
              <h3 className="font-bold text-lg text-trade-text">Create Administrative Role</h3>
              <button onClick={() => setShowModal(false)} className="text-trade-muted hover:text-trade-text font-bold">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-trade-muted uppercase mb-1">Role Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => { setName(e.target.value); if(!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '_')); }}
                  className="input-field py-2 text-sm"
                  placeholder="e.g. Support Specialist"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-trade-muted uppercase mb-1">Role Slug (Unique identifier)</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="input-field py-2 text-sm font-mono"
                  placeholder="support_specialist"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-trade-muted uppercase mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field py-2 text-sm"
                  rows="2"
                  placeholder="Responsible for viewing accounts and handling user support tickets."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-trade-muted uppercase mb-2">Assign Permissions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-trade-bg border border-trade-border">
                  {permissions.map((p) => {
                    const checked = selectedPermissions.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleTogglePerm(p.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors text-xs ${
                          checked
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500 font-semibold'
                            : 'border-trade-border/60 hover:bg-trade-card text-trade-text'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-trade-muted'}`}>
                          {checked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="truncate">{p.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-trade-border">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-xs py-2">Cancel</button>
                <button type="submit" disabled={createRoleMutation.isPending} className="btn-primary text-xs py-2 flex items-center gap-2">
                  {createRoleMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRolesPage;
