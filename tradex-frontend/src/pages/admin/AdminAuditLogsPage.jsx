import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Search, Loader2, ChevronLeft, ChevronRight, Eye, ShieldAlert } from 'lucide-react';
import { adminAuditService } from '../../services/adminService';
import { ErrorState } from '../../components/shared/States';

const AdminAuditLogsPage = () => {
  const [actionSearch, setActionSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminAuditLogs', page, actionSearch],
    queryFn: () => adminAuditService.getAuditLogs({
      page,
      action: actionSearch || undefined,
      per_page: 15
    }),
  });

  const logs = data?.data?.items || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-trade-text tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-emerald-500" />
            Security & Compliance Audit Trails
          </h1>
          <p className="text-sm text-trade-muted mt-1">
            Immutable system logs tracking every administrative state change and data access event.
          </p>
        </div>
      </div>

      <div className="glass-card p-4 border border-trade-border flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-trade-muted" />
          <input
            type="text"
            placeholder="Search action name (e.g. update_role)..."
            value={actionSearch}
            onChange={(e) => { setActionSearch(e.target.value); setPage(1); }}
            className="input-field pl-10 py-2 text-sm"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden border border-trade-border shadow-sm">
        {isLoading ? (
          <div className="p-12 flex justify-center items-center gap-3 text-trade-muted">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span>Loading security ledger...</span>
          </div>
        ) : isError ? (
          <ErrorState message="Failed to load audit trail" retry={refetch} />
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-trade-muted">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-500" />
            <p className="font-medium text-trade-text">No compliance audit logs recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-trade-border bg-trade-bg/50 text-xs font-bold text-trade-muted uppercase tracking-wider">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Action Executed</th>
                  <th className="py-3.5 px-6">Administrator</th>
                  <th className="py-3.5 px-6">Target Entity</th>
                  <th className="py-3.5 px-6">IP Address</th>
                  <th className="py-3.5 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-trade-border/40 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-trade-bg/40 transition-colors">
                    <td className="py-4 px-6 text-xs font-mono text-trade-muted whitespace-nowrap">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-trade-text">
                      {log.admin?.name || `Admin #${log.admin_id}`}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-trade-muted">
                      {log.entity_type ? `${log.entity_type} (#${log.entity_id})` : 'System Global'}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-trade-muted">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="btn-secondary px-3 py-1 text-xs flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect Diffs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.last_page > 1 && (
          <div className="px-6 py-4 border-t border-trade-border flex items-center justify-between text-xs text-trade-muted">
            <div>
              Showing page <span className="font-bold text-trade-text">{pagination.current_page}</span> of <span className="font-bold text-trade-text">{pagination.last_page}</span>
            </div>
            <div className="flex gap-2">
              <button disabled={pagination.current_page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="btn-secondary px-3 py-1.5 flex items-center gap-1 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button disabled={pagination.current_page >= pagination.last_page} onClick={() => setPage(p => p + 1)} className="btn-secondary px-3 py-1.5 flex items-center gap-1 disabled:opacity-40">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-trade-card border border-trade-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-trade-border flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-trade-text">Audit Event Payload Viewer</h3>
                <p className="text-xs text-trade-muted font-mono mt-0.5">Event ID #{selectedLog.id} • {selectedLog.action}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-trade-muted hover:text-trade-text font-bold">✕</button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div>
                <h4 className="text-xs font-bold text-trade-muted uppercase mb-2">Previous State (old_values)</h4>
                <pre className="p-4 rounded-xl bg-trade-bg border border-trade-border font-mono text-xs text-trade-text overflow-x-auto">
                  {selectedLog.old_values ? JSON.stringify(selectedLog.old_values, null, 2) : 'null (No previous state stored)'}
                </pre>
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-500 uppercase mb-2">Updated Payload (new_values)</h4>
                <pre className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 font-mono text-xs text-emerald-500 overflow-x-auto">
                  {selectedLog.new_values ? JSON.stringify(selectedLog.new_values, null, 2) : 'null'}
                </pre>
              </div>
            </div>
            <div className="p-4 border-t border-trade-border flex justify-end">
              <button onClick={() => setSelectedLog(null)} className="btn-secondary text-xs px-4 py-2">Close Payload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogsPage;
