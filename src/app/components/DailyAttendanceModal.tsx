import React, { useState } from 'react';
import { X, Save, AlertTriangle, CheckSquare, Square, CheckCircle2 } from 'lucide-react';
import { usePayroll } from '../context/PayrollContext';
import { Employee, DailyAttendance, Branch, Project } from '../context/PayrollContext';
import { toast } from 'sonner';

interface DailyAttendanceModalProps {
  date: string;
  dayType: 'Normal Day' | 'Rest Day' | 'Public Holiday';
  employees: Employee[];
  branches: Branch[];
  projects: Project[];
  dailyRecords: DailyAttendance[];
  onSave: (records: DailyAttendance[]) => void;
  onClose: () => void;
}

export default function DailyAttendanceModal({
  date,
  dayType,
  employees,
  branches,
  projects,
  dailyRecords,
  onSave,
  onClose
}: DailyAttendanceModalProps) {
  const { settings } = usePayroll();
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Local state for edits
  const [edits, setEdits] = useState<Record<string, Partial<DailyAttendance>>>({});
  
  // Bulk Fill State
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    if (emp.archivedDate) return false;
    if (emp.createdDate && emp.createdDate > date) return false;
    
    const matchesBranch = selectedBranch === 'ALL' || emp.branchCode === selectedBranch;
    const matchesProject = selectedProject === 'ALL' || emp.projectId === selectedProject;
    const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || emp.employeeNo.includes(searchTerm);
    
    return matchesBranch && matchesProject && matchesSearch;
  });

  const getRecord = (empId: string): DailyAttendance => {
    // Check local edits first
    if (edits[empId]) {
      return {
        id: `${empId}_${date}`,
        employeeId: empId,
        date,
        dayType,
        otHours: 0,
        leaveType: dayType === 'Normal Day' ? 'None' : 'Rest',
        leavePaid: false,
        ...dailyRecords.find(r => r.id === `${empId}_${date}`),
        ...edits[empId]
      };
    }
    // Check global state
    const existing = dailyRecords.find(r => r.id === `${empId}_${date}`);
    return existing || {
      id: `${empId}_${date}`,
      employeeId: empId,
      date,
      dayType,
      otHours: 0,
      leaveType: dayType === 'Normal Day' ? 'None' : 'Rest',
      leavePaid: false
    };
  };

  const handleFieldChange = (empId: string, field: keyof DailyAttendance, value: any) => {
    setEdits(prev => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        [field]: value
      }
    }));
  };

  const calculateLeaveEligibility = (emp: Employee, leaveType: string) => {
    if (leaveType === 'None' || leaveType === 'Unpaid Leave') return { allowed: true, paid: false, reason: '' };
    
    // Check previous records in the year
    const year = date.substring(0, 4);
    const yearRecords = dailyRecords.filter(r => r.employeeId === emp.id && r.date.startsWith(year) && r.date !== date);
    
    if (leaveType === 'Annual') {
      let allowedAnnualLeave = settings.annualLeaveDays;

      if (settings.annualLeaveProRata) {
        const createdDate = new Date(emp.createdDate || date);
        const currentDate = new Date(date);
        const monthsWorked = Math.max(0, (currentDate.getFullYear() - createdDate.getFullYear()) * 12 + (currentDate.getMonth() - createdDate.getMonth()));
        
        allowedAnnualLeave = Math.floor((settings.annualLeaveDays / 12) * Math.max(1, monthsWorked));
      }
      
      const annualTaken = yearRecords.filter(r => r.leaveType === 'Annual' && r.leavePaid).reduce((sum, r) => sum + (r.duration || 1), 0);
      if (annualTaken >= allowedAnnualLeave) {
        return { allowed: false, paid: false, reason: `Exceeded ${allowedAnnualLeave} days limit (Pro-rated)` };
      }
      return { allowed: true, paid: true, reason: '' };
    }
    
    if (leaveType === 'MC') {
      const mcTaken = yearRecords.filter(r => r.leaveType === 'MC' && r.leavePaid).reduce((sum, r) => sum + (r.duration || 1), 0);
      if (mcTaken >= settings.mcDays) {
        return { allowed: false, paid: false, reason: `Exceeded ${settings.mcDays} days limit` };
      }
      return { allowed: true, paid: true, reason: '' };
    }

    if (leaveType === 'Hospitalization') {
      const hospTaken = yearRecords.filter(r => r.leaveType === 'Hospitalization' && r.leavePaid).reduce((sum, r) => sum + (r.duration || 1), 0);
      if (hospTaken >= settings.hospitalisationDays) {
        return { allowed: false, paid: false, reason: `Exceeded ${settings.hospitalisationDays} days limit` };
      }
      return { allowed: true, paid: true, reason: '' };
    }

    if (leaveType === 'Maternity') {
      const matTaken = yearRecords.filter(r => r.leaveType === 'Maternity' && r.leavePaid).reduce((sum, r) => sum + (r.duration || 1), 0);
      if (matTaken >= settings.maternityDays) {
        return { allowed: false, paid: false, reason: `Exceeded ${settings.maternityDays} days limit` };
      }
      return { allowed: true, paid: true, reason: '' };
    }
    
    return { allowed: true, paid: false, reason: '' };
  };

  const getLeaveBalances = (emp: Employee) => {
    const year = date.substring(0, 4);
    const yearRecords = dailyRecords.filter(r => r.employeeId === emp.id && r.date.startsWith(year));
    
    const annualTaken = yearRecords.filter(r => r.leaveType === 'Annual' && r.leavePaid).reduce((sum, r) => sum + (r.duration || 1), 0);
    const mcTaken = yearRecords.filter(r => r.leaveType === 'MC' && r.leavePaid).reduce((sum, r) => sum + (r.duration || 1), 0);
    const unpaidTaken = yearRecords.filter(r => r.leaveType !== 'None' && r.leaveType !== 'Rest' && !r.leavePaid).reduce((sum, r) => sum + (r.duration || 1), 0);
    
    let allowedAnnualLeave = settings.annualLeaveDays;

    if (settings.annualLeaveProRata) {
      const createdDate = new Date(emp.createdDate || date);
      const currentDate = new Date(date);
      const monthsWorked = Math.max(0, (currentDate.getFullYear() - createdDate.getFullYear()) * 12 + (currentDate.getMonth() - createdDate.getMonth()));
      allowedAnnualLeave = Math.floor((settings.annualLeaveDays / 12) * Math.max(1, monthsWorked));
    }

    return {
      annual: Math.max(0, allowedAnnualLeave - annualTaken),
      annualLimit: allowedAnnualLeave,
      mc: Math.max(0, settings.mcDays - mcTaken),
      unpaid: unpaidTaken
    };
  };

  const toggleEmployeeSelection = (id: string) => {
    const newSelection = new Set(selectedEmployees);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedEmployees(newSelection);
  };

  const toggleAllSelection = () => {
    if (selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredEmployees.map(e => e.id)));
    }
  };

  const handleConfirmSelected = () => {
    const updates: Record<string, Partial<DailyAttendance>> = {};
    selectedEmployees.forEach(id => {
      const record = getRecord(id);
      updates[id] = { ...record };
    });
    
    setEdits(prev => ({
      ...prev,
      ...updates
    }));
    
    setSelectedEmployees(new Set());
  };

  const handleSave = () => {
    // Process all edits and auto-calculate leave paid status & OT
    const finalRecords: DailyAttendance[] = [];
    
    Object.keys(edits).forEach(empId => {
      const emp = employees.find(e => e.id === empId);
      if (!emp) return;
      
      const record = getRecord(empId);
      
      if (record.leaveType !== 'None') {
        const eligibility = calculateLeaveEligibility(emp, record.leaveType);
        record.leavePaid = eligibility.allowed && eligibility.paid;
        
        let anticipatedOt = 0;
        if (emp.projectId) {
          const project = projects.find(p => p.id === emp.projectId);
          if (project) {
            anticipatedOt = project.payStructure === '8+4' ? 4 : project.payStructure === '8+3' ? 3 : 0;
          }
        }
        record.otHours = record.hasOT ? anticipatedOt : 0; // Assign OT if checked

        if (!eligibility.allowed && record.leaveType !== 'Unpaid Leave') {
          toast.warning(`${emp.fullName} exceeded ${record.leaveType} limit. Marked as Unpaid.`);
        }
      } else {
        record.leavePaid = false;
        record.duration = 1; // Full day if present
        
        // Automatic OT assignment based on project
        if (emp.projectId) {
          const project = projects.find(p => p.id === emp.projectId);
          if (project) {
            const anticipatedOt = project.payStructure === '8+4' ? 4 : project.payStructure === '8+3' ? 3 : 0;
            // Respect manual toggle if it was touched, otherwise default to expected OT
            record.otHours = (record.hasOT !== false) ? anticipatedOt : 0;
          }
        } else {
          record.otHours = 0; // Default for no project
        }
      }
      
      finalRecords.push(record);
    });
    
    if (finalRecords.length > 0) {
      onSave(finalRecords);
      toast.success(`Saved attendance for ${finalRecords.length} employees on ${date}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Daily Attendance: {new Date(date).toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                dayType === 'Public Holiday' ? 'bg-red-100 text-red-700' :
                dayType === 'Rest Day' ? 'bg-amber-100 text-amber-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {dayType}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
          <input
            type="text"
            placeholder="Search employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-48 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Branches</option>
            {branches.filter(b => b.status === 'Active').map(b => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))}
          </select>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-48 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Projects</option>
            {projects.filter(p => p.status === 'Active').map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedEmployees.size > 0 && (
          <div className="mx-6 mt-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <span className="text-sm font-medium text-blue-900">{selectedEmployees.size} employees selected</span>
            <button
              onClick={handleConfirmSelected}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Selected
            </button>
          </div>
        )}

        {/* Table Area */}
        <div className="flex-1 overflow-auto p-0 mt-4">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-left w-12">
                  <button onClick={toggleAllSelection} className="text-slate-400 hover:text-blue-600">
                    {selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 font-semibold text-slate-700">Employee</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Project</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Leave / Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Est. Daily Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredEmployees.map(emp => {
                const record = getRecord(emp.id);
                const isEdited = !!edits[emp.id];
                const project = emp.projectId ? projects.find(p => p.id === emp.projectId) : null;
                const balances = getLeaveBalances(emp);
                
                let leaveWarning = '';
                if (record.leaveType !== 'None') {
                  const check = calculateLeaveEligibility(emp, record.leaveType);
                  if (!check.allowed) leaveWarning = check.reason;
                }

                // Salary Calculation
                const dailyBasic = emp.basicSalary / 26;
                let mult = 1.5;
                if (dayType === 'Rest Day') mult = 2.0;
                if (dayType === 'Public Holiday') mult = 3.0;
                
                try {
                  const tableData = project?.payStructure === '8+3' ? settings.eightPlusThreeData : settings.eightPlusFourData;
                  if (tableData) {
                    const table = JSON.parse(tableData);
                    const rowType = dayType === 'Normal Day' ? 'Normal Day OT' : dayType === 'Rest Day' ? 'Rest Day OT' : 'Public Holiday OT';
                    const row = table.find((r: any) => r.dayType === rowType);
                    if (row && row.multiplier) {
                      mult = parseFloat(row.multiplier);
                    }
                  }
                } catch(e) {}

                if (dayType === 'Normal Day' && project?.customOtMultiplier) {
                  mult = project.customOtMultiplier;
                }
                
                let otRate = (dailyBasic / 8) * mult;
                
                // Anticipated OT Hours
                let anticipatedOt = 0;
                if (project) {
                  anticipatedOt = project.payStructure === '8+4' ? 4 : project.payStructure === '8+3' ? 3 : 0;
                }
                
                let activeOt = 0;
                if (record.leaveType === 'None') {
                  activeOt = (record.hasOT !== false) ? anticipatedOt : 0;
                } else {
                  activeOt = record.hasOT ? anticipatedOt : 0;
                }

                const duration = record.duration || 1;

                // Est Pay
                let estPay = 0;
                if (record.leaveType === 'None') {
                  estPay = dailyBasic + (activeOt * otRate);
                } else if (record.leaveType === 'Rest') {
                  estPay = 0; // Show 0 for non-working rest day
                } else if (record.leavePaid || (record.leaveType !== 'Unpaid Leave' && calculateLeaveEligibility(emp, record.leaveType).allowed)) {
                  estPay = dailyBasic + (activeOt * otRate); // Paid leave (full or half) still gets daily basic + OT
                } else {
                  // Unpaid leave
                  estPay = (dailyBasic * (1 - duration)) + (activeOt * otRate);
                }

                return (
                  <tr key={emp.id} className={`hover:bg-slate-50 transition-colors ${isEdited ? 'bg-blue-50/30' : ''} ${selectedEmployees.has(emp.id) ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-6 py-3">
                      <button onClick={() => toggleEmployeeSelection(emp.id)} className="text-slate-400 hover:text-blue-600">
                        {selectedEmployees.has(emp.id) ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-900">{emp.fullName}</div>
                      <div className="text-xs text-slate-500">{emp.employeeNo} • {emp.branch}</div>
                    </td>
                    <td className="px-6 py-3">
                      {project ? (
                        <div>
                          <div className="text-sm font-medium text-slate-800">{project.name}</div>
                          {record.leaveType === 'None' && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                                Auto: {project.payStructure === '8+4' ? '4' : '3'} hrs OT
                              </div>
                              <div className={`text-[10px] font-medium px-2 py-0.5 rounded ${project.customOtMultiplier && dayType === 'Normal Day' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                @ {mult}x
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No Project Assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-col gap-1.5">
                        <select
                          value={record.leaveType === 'None' && record.hasOT !== false ? 'None' : (record.leaveType === 'Rest' || (record.leaveType === 'None' && record.hasOT === false) ? 'Rest' : record.leaveType)}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'Rest') {
                              handleFieldChange(emp.id, 'leaveType', 'Rest');
                              handleFieldChange(emp.id, 'hasOT', false);
                            } else {
                              handleFieldChange(emp.id, 'leaveType', val);
                              if (val === 'None') handleFieldChange(emp.id, 'hasOT', true);
                              if (val !== 'None' && record.duration === undefined) {
                                handleFieldChange(emp.id, 'duration', 1);
                              }
                            }
                          }}
                          className="w-48 px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          {dayType === 'Normal Day' ? (
                            <>
                              <option value="None">Working (Present)</option>
                              <option value="Annual">Annual Leave</option>
                              <option value="MC">Medical Leave (MC)</option>
                              <option value="Hospitalization">Hospitalization</option>
                              <option value="Maternity">Maternity Leave</option>
                              <option value="Unpaid Leave">Unpaid Leave</option>
                            </>
                          ) : (
                            <>
                              <option value="None">Working</option>
                              <option value="Rest">Non-working</option>
                            </>
                          )}
                        </select>
                        
                        {record.leaveType !== 'None' && record.leaveType !== 'Rest' && (
                          <div className="flex items-center gap-2 mt-1">
                            <select
                              value={record.duration || 1}
                              onChange={(e) => handleFieldChange(emp.id, 'duration', parseFloat(e.target.value))}
                              className="w-24 px-2 py-1 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                              <option value={1}>Full Day</option>
                              <option value={0.5}>Half Day</option>
                            </select>
                            
                            <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={record.hasOT || false}
                                onChange={(e) => handleFieldChange(emp.id, 'hasOT', e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-3 h-3"
                              />
                              Include OT
                            </label>
                          </div>
                        )}
                        
                        {record.leaveType === 'None' && (
                          <div className="flex items-center gap-2 mt-1">
                            <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={record.hasOT !== false}
                                onChange={(e) => handleFieldChange(emp.id, 'hasOT', e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-3 h-3"
                              />
                              Include OT
                            </label>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] text-slate-500 font-medium space-x-2">
                            <span>AL: {balances.annual}/{balances.annualLimit}</span>
                            <span>MC: {balances.mc}/{settings.mcDays}</span>
                            <span className="text-red-500">Unpaid: {balances.unpaid}</span>
                          </div>
                          {record.leaveType !== 'None' && (
                            leaveWarning || record.leaveType === 'Unpaid Leave' ? (
                              <div className="flex items-center gap-1 text-red-600 text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                UNPAID {leaveWarning ? `(${leaveWarning})` : ''}
                              </div>
                            ) : (
                              <div className="text-green-600 text-[10px] font-bold">
                                PAID LEAVE
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="font-semibold text-slate-800">
                        RM {estPay.toFixed(2)}
                      </div>
                      {activeOt > 0 && (
                        <div className="text-[10px] text-slate-500">
                          (Incl. RM {(activeOt * otRate).toFixed(2)} OT)
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No employees found for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={Object.keys(edits).length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Changes ({Object.keys(edits).length})
          </button>
        </div>
      </div>
    </div>
  );
}
