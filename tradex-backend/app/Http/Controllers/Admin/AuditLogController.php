<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Http\Requests\Admin\AuditLogListRequest;
use App\Http\Resources\Admin\AuditLogResource;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Display a paginated list of audit logs with filtering.
     */
    public function index(AuditLogListRequest $request)
    {
        $query = AdminAuditLog::with('admin');

        if ($adminId = $request->input('admin_id')) {
            $query->where('admin_id', $adminId);
        }

        if ($action = $request->input('action')) {
            $query->where('action', 'like', "%{$action}%");
        }

        if ($entityType = $request->input('entity_type')) {
            $query->where('entity_type', $entityType);
        }

        if ($fromDate = $request->input('from_date')) {
            $query->whereDate('created_at', '>=', $fromDate);
        }

        if ($toDate = $request->input('to_date')) {
            $query->whereDate('created_at', '<=', $toDate);
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $perPage = (int) $request->input('per_page', 15);
        $logs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Audit logs retrieved successfully',
            'data' => [
                'items' => AuditLogResource::collection($logs->items()),
                'pagination' => [
                    'current_page' => $logs->currentPage(),
                    'last_page'    => $logs->lastPage(),
                    'per_page'     => $logs->perPage(),
                    'total'        => $logs->total(),
                ],
            ]
        ]);
    }

    /**
     * Display the specified audit log.
     */
    public function show($id)
    {
        $log = AdminAuditLog::with('admin')->find($id);

        if (!$log) {
            return response()->json([
                'success' => false,
                'message' => 'Audit log not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Audit log retrieved successfully',
            'data' => [
                'audit_log' => new AuditLogResource($log)
            ]
        ]);
    }
}
