import React from 'react';
import { Card, Table, Chip } from '@heroui/react';
import { StaffWorkloadStat } from '../../types/database';
import { Users, AlertCircle, CheckCircle2, Briefcase } from 'lucide-react';
import { PersonAvatar } from '../../utils/avatarHelper';

interface StaffWorkloadTableProps {
  workload: StaffWorkloadStat[];
  isLoading?: boolean;
}

export const StaffWorkloadTable: React.FC<StaffWorkloadTableProps> = ({ workload, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs animate-pulse space-y-4">
        <div className="h-4 w-44 bg-slate-200 rounded-md" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight font-heading">
              Team Workload & Execution Performance
            </h2>
            <Chip
              variant="soft"
              color="accent"
              size="sm"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 font-mono"
            >
              <Users className="w-3 h-3 shrink-0" />
              <Chip.Label>Staff Distribution</Chip.Label>
            </Chip>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time assignment distribution and task completion rates across team members
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500 font-semibold">
          <span className="font-extrabold text-slate-900 font-mono">{workload.length}</span> Active Members
        </div>
      </div>

      {workload.length === 0 ? (
        <div className="p-10 text-center border-dashed border-slate-200">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700 font-heading">No Staff Members Found</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Active team profiles will list here once assigned to enquiries or follow-ups.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table className="w-full">
            <Table.ScrollContainer>
              <Table.Content aria-label="Team Workload Table" className="w-full text-left text-xs min-w-[650px]">
                <Table.Header className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 font-mono">
                  <Table.Column isRowHeader className="py-3 px-6">Staff Member</Table.Column>
                  <Table.Column className="py-3 px-4">Role</Table.Column>
                  <Table.Column className="py-3 px-4 text-center">Assigned Enquiries</Table.Column>
                  <Table.Column className="py-3 px-4 text-center">Assigned Follow-ups</Table.Column>
                  <Table.Column className="py-3 px-4 text-center">Completed</Table.Column>
                  <Table.Column className="py-3 px-4 text-center">Overdue</Table.Column>
                  <Table.Column className="py-3 px-6 text-right">Completion Rate</Table.Column>
                </Table.Header>
                <Table.Body className="divide-y divide-slate-100">
                  {workload.map((staff) => {
                    const hasOverdue = staff.overdueFollowups > 0;

                    return (
                      <Table.Row key={staff.staffId} className="hover:bg-slate-50/70 transition-colors">
                        {/* Name & Email */}
                        <Table.Cell className="py-3.5 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <PersonAvatar name={staff.fullName} size="sm" />
                            <div>
                              <div className="font-bold text-slate-900">{staff.fullName}</div>
                              <div className="text-[11px] text-slate-600 font-mono">{staff.email}</div>
                            </div>
                          </div>
                        </Table.Cell>

                        {/* Role Badge */}
                        <Table.Cell className="py-3.5 px-4 whitespace-nowrap">
                          <Chip
                            variant="soft"
                            color="default"
                            size="sm"
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono bg-slate-100 text-slate-700 border border-slate-200/80"
                          >
                            <Chip.Label>{staff.role}</Chip.Label>
                          </Chip>
                        </Table.Cell>

                        {/* Assigned Enquiries */}
                        <Table.Cell className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                          {staff.assignedEnquiries}
                        </Table.Cell>

                        {/* Assigned Followups */}
                        <Table.Cell className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                          {staff.assignedFollowups}
                        </Table.Cell>

                        {/* Completed */}
                        <Table.Cell className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600">
                          <div className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{staff.completedFollowups}</span>
                          </div>
                        </Table.Cell>

                        {/* Overdue */}
                        <Table.Cell className="py-3.5 px-4 text-center font-mono">
                          {hasOverdue ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{staff.overdueFollowups}</span>
                            </span>
                          ) : (
                            <span className="text-slate-600 font-mono font-normal">0</span>
                          )}
                        </Table.Cell>

                        {/* Completion Rate with mini bar */}
                        <Table.Cell className="py-3.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block border border-slate-200/40">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  staff.completionRate >= 70
                                    ? 'bg-emerald-500'
                                    : staff.completionRate >= 40
                                    ? 'bg-amber-500'
                                    : 'bg-slate-400'
                                }`}
                                style={{ width: `${Math.min(100, staff.completionRate)}%` }}
                              />
                            </div>
                            <span className="font-mono font-extrabold text-slate-900 text-xs">
                              {staff.completionRate}%
                            </span>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </div>
      )}
    </Card>
  );
};

export default StaffWorkloadTable;
