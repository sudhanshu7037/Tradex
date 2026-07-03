<?php

namespace App\Traits;

use App\Models\AdminAuditLog;
use Illuminate\Http\Request;

trait LogsAdminAudit
{
    /**
     * Log an admin audit action.
     */
    protected function logAudit(
        string $action,
        ?string $entityType = null,
        $entityId = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): AdminAuditLog {
        $request = request();
        $admin = $request ? $request->user() : null;

        return AdminAuditLog::create([
            'admin_id'    => $admin ? $admin->id : null,
            'action'      => $action,
            'entity_type' => $entityType,
            'entity_id'   => $entityId ? (string) $entityId : null,
            'old_values'  => $oldValues,
            'new_values'  => $newValues,
            'ip_address'  => $request ? $request->ip() : null,
            'user_agent'  => $request ? $request->userAgent() : null,
        ]);
    }
}
