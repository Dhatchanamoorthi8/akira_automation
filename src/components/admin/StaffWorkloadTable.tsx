import React from 'react';
import { StaffWorkloadStat } from '../../types/database';
import { Users, AlertCircle, CheckCircle2, Briefcase } from 'lucide-react';

interface StaffWorkloadTableProps {
  workload: StaffWorkloadStat[];
  isLoading?: boolean;
}

export const StaffWorkloadTable: React.FC<StaffWorkloadTableProps> = ({ workload, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-subtle animate-pulse space-y-4">
        <div className="h-4 w-44 bg-slate-200 rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Team Workload & Execution Performance
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
              <Users className="w-3 h-3" />
              <span>Staff Distribution</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time assignment distribution and task completion rates across team members
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500">
          <span className="font-bold text-slate-900">{workload.length}</span> Active Members
        </div>
      </div>

      {workload.length === 0 ? (
        <div className="p-8 text-center border-dashed border-slate-200">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">No Staff Members Found</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Active team profiles will list here once assigned to enquiries or follow-ups.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3 text-center">Assigned Enquiries</th>
                <th className="py-3 px-3 text-center">Assigned Follow-ups</th>
                <th className="py-3 px-3 text-center">Completed</th>
                <th className="py-3 px-3 text-center">Overdue</th>
                <th className="py-3 px-4 text-right">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {workload.map((staff) => {
                const hasOverdue = staff.overdueFollowups > 0;

                return (
                  <tr key={staff.staffId} className="hover:bg-slate-50/60 transition-colors">
                    {/* Name & Email */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-industrial-dark">{staff.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{staff.email}</div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        {staff.role}
                      </span>
                    </td>

                    {/* Assigned Enquiries */}
                    <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                      {staff.assignedEnquiries}
                    </td>

                    {/* Assigned Followups */}
                    <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                      {staff.assignedFollowups}
                    </td>

                    {/* Completed */}
                    <td className="py-3 px-3 text-center font-mono font-semibold text-emerald-600">
                      <div className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>{staff.completedFollowups}</span>
                      </div>
                    </td>

                    {/* Overdue */}
                    <td className="py-3 px-3 text-center font-mono">
                      {hasOverdue ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3 h-3" />
                          <span>{staff.overdueFollowups}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">0</span>
                      )}
                    </td>

                    {/* Completion Rate with mini bar */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${
                              staff.completionRate >= 70
                                ? 'bg-emerald-500'
                                : staff.completionRate >= 40
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                            style={{ width: `${Math.min(100, staff.completionRate)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {staff.completionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffWorkloadTable;
