import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Lock, Plus, Trash2, Loader2, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminPermissionService } from '../../services/adminService';
import { ErrorState } from '../../components/shared/States';

const AdminPermissionsPage = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminPermissions'],
    queryFn: adminPermissionService.getPermissions,
  });

  const createPermMutation = useMutation({
    mutationFn: (data) => adminPermissionService.createPermission(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Permission created successfully');
      setShowModal(false);
      setName('');
      setSlug('');
      setDescription('');
      queryClient.invalidateQueries(['adminPermissions']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create permission');
    }
  });

  const deletePermMutation = useMutation({
    mutationFn: (id) => adminPermissionService.deletePermission(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Permission deleted successfully');
      queryClient.invalidateQueries(['adminPermissions']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete permission');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error('Name and slug are required');
      return;
    }
    createPermMutation.mutate({
      name,
      slug: slug.toLowerCase().replace(/\s+/g, '_'),
      description
    });
  };

  const handleDelete = (perm) => {
    if (window.confirm(`Are you sure you want to delete permission "${perm.name}"?`)) {
      deletePermMutation.mutate(perm.id);
    }
  };

  const permissions = data?.data?.permissions || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-trade-text tracking-tight flex items-center gap-2.5">
            <Lock className="w-7 h-7 text-emerald-500" />
            System Permissions Registry
          </h1>
          <p className="text-sm text-trade-muted mt-1">
            Browse and register granular access scopes enforced by API permission middleware.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 text-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Permission
        </button>
      </div>

      <div className="glass-card overflow-hidden border border-trade-border shadow-sm">
        {isLoading ? (
          <div className="p-12 flex justify-center items-center gap-3 text-trade-muted">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span>Loading permissions...</span>
          </div>
        ) : isError ? (
          <ErrorState message="Failed to load permissions list" retry={refetch} />
        ) : permissions.length === 0 ? (
          <div className="p-12 text-center text-trade-muted">
            <Key className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-500" />
            <p className="font-medium text-trade-text">No permissions registered yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-trade-border bg-trade-bg/50 text-xs font-bold text-trade-muted uppercase tracking-wider">
                  <th className="py-3.5 px-6">Permission Name</th>
                  <th className="py-3.5 px-6">Middleware Slug</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-trade-border/40 text-sm">
                {permissions.map((p) => (
                  <tr key={p.id} className="hover:bg-trade-bg/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-trade-text flex items-center gap-2">
                      <Key className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {p.name}
                    </td>
                    <td className="py-4 px-6">
                      <code className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 font-mono text-xs border border-emerald-500/20">
                        permission:{p.slug}
                      </code>
                    </td>
                    <td className="py-4 px-6 text-trade-muted text-xs">
                      {p.description || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(p)}
                        title="Delete Permission"
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
              <h3 className="font-bold text-lg text-trade-text">Register Permission Scope</h3>
              <button onClick={() => setShowModal(false)} className="text-trade-muted hover:text-trade-text font-bold">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-trade-muted uppercase mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => { setName(e.target.value); if(!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '_')); }}
                  className="input-field py-2 text-sm"
                  placeholder="e.g. Manage Withdrawals"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-trade-muted uppercase mb-1">Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="input-field py-2 text-sm font-mono"
                  placeholder="manage_withdrawals"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-trade-muted uppercase mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field py-2 text-sm"
                  rows="2"
                  placeholder="Grants ability to process and approve user financial requests."
                />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-trade-border">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-xs py-2">Cancel</button>
                <button type="submit" disabled={createPermMutation.isPending} className="btn-primary text-xs py-2 flex items-center gap-2">
                  {createPermMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Register Permission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPermissionsPage;
