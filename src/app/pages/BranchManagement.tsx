import { useState, useEffect } from 'react';
import { Building2, Users, DollarSign, MapPin, Phone, Mail, Plus, Eye, Pencil, UserPlus, XCircle, X, Save, Loader2, Trash2, CheckCircle, ChevronLeft, ChevronRight, Edit, Briefcase, Table2 } from 'lucide-react';
import { usePayroll, Branch, Project } from '../context/PayrollContext';
import { toast } from 'sonner';
import ConfirmDialog from '../components/ConfirmDialog';
import * as db from '../../lib/database';

export const MALAYSIAN_STATES = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 
  'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Sabah', 
  'Sarawak', 'Selangor', 'Terengganu', 'W.P. Kuala Lumpur', 
  'W.P. Labuan', 'W.P. Putrajaya'
];

export default function BranchManagement() {
  const { employees, branches, projects, payrolls, advances, settings, updateEmployee, addBranch, updateBranch, deleteBranch, addProject, updateProject, deleteProject } = usePayroll();
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Ensure selectedBranch is valid when branches change
  useEffect(() => {
    if (branches.length > 0 && selectedBranch !== 'ALL' && !branches.find(b => b.code === selectedBranch)) {
      setSelectedBranch('ALL');
    }
  }, [branches, selectedBranch]);
  const [showEditBranch, setShowEditBranch] = useState(false);
  const [showViewBranch, setShowViewBranch] = useState(false);
  const [showManageProjects, setShowManageProjects] = useState(false);
  const [managingBranch, setManagingBranch] = useState<Branch | null>(null);
  const [showAssignStaff, setShowAssignStaff] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    payStructure: '8+3',
    status: 'Active'
  });
  const [assignedEmployeesToProject, setAssignedEmployeesToProject] = useState<string[]>([]);
  const [assigningToBranch, setAssigningToBranch] = useState<Branch | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [deactivateConfirm, setDeactivateConfirm] = useState<Branch | null>(null);
  const [activateConfirm, setActivateConfirm] = useState<Branch | null>(null);
  const [deleteBranchConfirm, setDeleteBranchConfirm] = useState<Branch | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [employeeCurrentPage, setEmployeeCurrentPage] = useState(1);
  const employeesPerPage = 5;

  const [newBranch, setNewBranch] = useState<Branch>({
    code: '',
    name: '',
    location: '',
    address: '',
    contact: '',
    email: '',
    contactPerson: '',
    otRate: 7.50,
    restDayRate: 15.00,
    publicHolidayRate: 22.50,
    status: 'Active',
  });

  const getBranchStats = (branchCode: string) => {
    // If "ALL" is selected, aggregate stats for all branches
    const branchEmployees = branchCode === 'ALL'
      ? employees.filter(e => e.status === 'Active' && !e.archivedDate)
      : employees.filter(e => e.branchCode === branchCode && e.status === 'Active' && !e.archivedDate);

    const totalStaff = branchEmployees.length;
    const activeStaff = branchEmployees.filter(e => e.status === 'Active').length;
    const monthlyBasicSalary = branchEmployees.reduce((sum, e) => sum + e.basicSalary, 0);

    const branchPayrolls = branchCode === 'ALL'
      ? payrolls
      : payrolls.filter(p => {
          const emp = employees.find(e => e.id === p.employeeId);
          return emp?.branchCode === branchCode;
        });
    const totalMonthlyPayroll = branchPayrolls.reduce((sum, p) => sum + p.netSalary, 0);

    const branchAdvances = branchCode === 'ALL'
      ? advances
      : advances.filter(a => {
          const emp = employees.find(e => e.id === a.employeeId);
          return emp?.branchCode === branchCode;
        });
    const totalAdvances = branchAdvances.reduce((sum, a) => sum + a.amount, 0);

    return {
      totalStaff,
      activeStaff,
      monthlyBasicSalary,
      totalMonthlyPayroll,
      totalAdvances,
      employees: branchEmployees,
    };
  };

  const handleAddBranch = () => {
    setNewBranch({
      code: '',
      name: '',
      location: '',
      address: '',
      contact: '',
      email: '',
      contactPerson: '',
      otRate: 7.50,
      restDayRate: 15.00,
      publicHolidayRate: 22.50,
      status: 'Active',
    });
    setShowAddBranch(true);
  };

  const handleSaveNewBranch = async () => {
    if (!newBranch.code || !newBranch.name) {
      toast.error('Branch code and name are required');
      return;
    }
    if (branches.some(b => b.code === newBranch.code)) {
      toast.error('Branch code already exists');
      return;
    }

    console.log('%c🏢 Starting branch save process...', 'color: #3b82f6; font-weight: bold;', {
      branchCode: newBranch.code,
      branchName: newBranch.name,
      currentBranchCount: branches.length,
    });

    setIsSaving(true);
    try {
      const branchToSave = { ...newBranch };
      const success = await addBranch(branchToSave);

      if (success) {
        console.log('%c✅ Branch save confirmed!', 'color: #10b981; font-weight: bold;', {
          savedBranch: branchToSave.name,
          newBranchCount: branches.length + 1,
        });

        // Close modal and reset form
        setShowAddBranch(false);
        setNewBranch({
          code: '',
          name: '',
          location: '',
          address: '',
          contact: '',
          email: '',
          contactPerson: '',
          otRate: 7.50,
          restDayRate: 15.00,
          publicHolidayRate: 22.50,
          status: 'Active',
        });

        // Wait a moment for state to update, then select the new branch
        setTimeout(() => {
          setSelectedBranch(branchToSave.code);
        }, 100);

        toast.success(`✅ Branch ${branchToSave.name} saved successfully!\n📊 Available in all modules now.`, {
          duration: 5000,
        });
      } else {
        console.error('%c❌ Branch save failed!', 'color: #ef4444; font-weight: bold;');
        toast.error('❌ Failed to save branch to database. Please try again.');
      }
    } catch (error) {
      console.error('%c❌ Error during branch save:', 'color: #ef4444; font-weight: bold;', error);
      toast.error('❌ Error saving branch. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProject = async (branchCode: string) => {
    if (!newProject.name) {
      toast.error('Project name is required');
      return;
    }

    const projectToSave: Project = {
      id: editingProjectId || (crypto.randomUUID()),
      name: newProject.name,
      branchCode: branchCode,
      payStructure: newProject.payStructure as '8+3' | '8+4',
      status: 'Active',
      customOtMultiplier: newProject.customOtMultiplier
    };

    try {
      if (editingProjectId) {
        await updateProject(editingProjectId, projectToSave);
        await db.updateProject(editingProjectId, projectToSave);
        
        const currentlyAssigned = employees.filter(e => e.projectId === editingProjectId);
        
        const removals = currentlyAssigned
          .filter(emp => !assignedEmployeesToProject.includes(emp.id))
          .map(async emp => {
            updateEmployee(emp.id, { projectId: null as any });
            await db.updateEmployee(emp.id, { projectId: null });
          });
          
        const additions = assignedEmployeesToProject
          .filter(empId => !currentlyAssigned.some(e => e.id === empId))
          .map(async empId => {
            updateEmployee(empId, { projectId: editingProjectId });
            await db.updateEmployee(empId, { projectId: editingProjectId });
          });
          
        await Promise.all([...removals, ...additions]);
        toast.success('Project updated successfully');
      } else {
        addProject(projectToSave);
        await db.createProject(projectToSave);
        
        const assignments = assignedEmployeesToProject.map(async empId => {
          updateEmployee(empId, { projectId: projectToSave.id });
          await db.updateEmployee(empId, { projectId: projectToSave.id });
        });
        
        await Promise.all(assignments);
        toast.success('Project created successfully');
      }
    } catch (err) {
      console.error('Error saving project:', err);
      toast.error('Failed to save project');
    }

    setShowAddProject(false);
    setEditingProjectId(null);
    setNewProject({ name: '', payStructure: '8+3', status: 'Active', customOtMultiplier: undefined });
    setAssignedEmployeesToProject([]);
  };

  const handleEditProject = (project: Project) => {
    setEditingProjectId(project.id);
    setNewProject({ ...project });
    const assignedEmps = employees.filter(e => e.projectId === project.id).map(e => e.id);
    setAssignedEmployeesToProject(assignedEmps);
    setShowAddProject(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch({ ...branch });
    setShowEditBranch(true);
  };

  const handleSaveEditBranch = () => {
    if (editingBranch) {
      updateBranch(editingBranch.code, editingBranch);
      setShowEditBranch(false);
      toast.success('Branch updated successfully');
    }
  };

  const handleViewBranch = (branch: Branch) => {
    setViewingBranch(branch);
    setShowViewBranch(true);
  };

  const handleAssignStaff = (branch: Branch) => {
    setAssigningToBranch(branch);
    setSelectedEmployee('');
    setShowAssignStaff(true);
  };

  const handleConfirmAssignStaff = () => {
    if (selectedEmployee && assigningToBranch) {
      const employee = employees.find(e => e.id === selectedEmployee);
      if (employee) {
        updateEmployee(selectedEmployee, {
          branchCode: assigningToBranch.code,
          branch: assigningToBranch.name,
        });
        toast.success('Staff assigned to branch successfully');
        setShowAssignStaff(false);
      }
    }
  };

  const handleDeactivateBranch = (branch: Branch) => {
    setDeactivateConfirm(branch);
  };

  const confirmDeactivate = () => {
    if (deactivateConfirm) {
      updateBranch(deactivateConfirm.code, { status: 'Inactive' });
      toast.success('Branch deactivated successfully');
      setDeactivateConfirm(null);
    }
  };

  const handleActivateBranch = (branch: Branch) => {
    setActivateConfirm(branch);
  };

  const confirmActivate = () => {
    if (activateConfirm) {
      updateBranch(activateConfirm.code, { status: 'Active' });
      toast.success('Branch activated successfully');
      setActivateConfirm(null);
    }
  };

  const handleDeleteBranch = (branch: Branch) => {
    // Check if any employees are assigned to this branch
    const employeesInBranch = employees.filter(e => e.branchCode === branch.code && !e.archivedDate);
    if (employeesInBranch.length > 0) {
      toast.error(`Cannot delete branch. ${employeesInBranch.length} employee(s) are assigned to this branch.`);
      return;
    }
    setDeleteBranchConfirm(branch);
  };

  const confirmDeleteBranch = () => {
    if (deleteBranchConfirm) {
      deleteBranch(deleteBranchConfirm.code);
      toast.success(`Branch ${deleteBranchConfirm.code} deleted successfully`);
      setDeleteBranchConfirm(null);

      // If deleted branch was selected, switch to All Branches
      if (selectedBranch === deleteBranchConfirm.code) {
        setSelectedBranch('ALL');
      }
    }
  };

  const currentBranch = selectedBranch === 'ALL' ? null : (branches.find(b => b.code === selectedBranch) || branches[0]);
  const currentStats = getBranchStats(selectedBranch);

  // Pagination calculations
  const totalPages = Math.ceil(branches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBranches = branches.slice(startIndex, endIndex);

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Show empty state if no branches
  if (branches.length === 0) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Branches</h1>
            <p className="text-sm md:text-base text-slate-600 mt-1">Manage branch locations and staff assignments</p>
          </div>
          <button
            onClick={handleAddBranch}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            Add Branch
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No Branches Yet</h2>
          <p className="text-slate-600 mb-6">Get started by creating your first branch.</p>
          <button
            onClick={handleAddBranch}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create First Branch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Branches</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Manage branch locations and staff assignments • {branches.length} branch{branches.length !== 1 ? 'es' : ''} total
          </p>
        </div>
        <button
          onClick={handleAddBranch}
          className="flex items-center justify-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors text-sm md:text-base"
        >
          <Plus className="w-5 h-5" />
          Add Branch
        </button>
      </div>

      {/* Branch Selector */}
      <div className="bg-white rounded-lg shadow p-3">
        <label className="block text-xs font-medium text-slate-700 mb-1.5">Select Branch</label>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="w-full md:w-80 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Branches</option>
          {branches.filter(b => b.status === 'Active').map(branch => (
            <option key={branch.code} value={branch.code}>
              {branch.name} ({branch.code})
            </option>
          ))}
        </select>
      </div>

      {/* Branch Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="bg-blue-100 p-1.5 rounded-lg">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-slate-600">Total Employees</p>
          </div>
          <p className="text-xl font-bold text-slate-900">{currentStats?.totalStaff || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="bg-green-100 p-1.5 rounded-lg">
              <Building2 className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xs text-slate-600">Active Staff</p>
          </div>
          <p className="text-xl font-bold text-slate-900">{currentStats?.activeStaff || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="bg-purple-100 p-1.5 rounded-lg">
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xs text-slate-600">Monthly Basic Salary</p>
          </div>
          <p className="text-xl font-bold text-slate-900">RM {(currentStats?.monthlyBasicSalary || 0).toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="bg-orange-100 p-1.5 rounded-lg">
              <Building2 className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-xs text-slate-600">{selectedBranch === 'ALL' ? 'Total Branches' : 'Branch Code'}</p>
          </div>
          <p className="text-xl font-bold text-slate-900">
            {selectedBranch === 'ALL' ? branches.filter(b => b.status === 'Active').length : (currentBranch?.code || 'N/A')}
          </p>
        </div>
      </div>

      {/* Branch Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Branch Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Branch Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total Staff
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Active Staff
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Branch Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedBranches.map((branch) => {
                const stats = getBranchStats(branch.code);
                return (
                  <tr key={branch.code} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {branch.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {branch.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {branch.location}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-slate-900">
                      {stats.totalStaff}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-green-600 font-medium">
                      {stats.activeStaff}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        branch.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {branch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewBranch(branch)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditBranch(branch)}
                          className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                          title="Edit Branch"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAssignStaff(branch)}
                          disabled={branch.status === 'Inactive'}
                          className={`p-1 rounded ${
                            branch.status === 'Inactive'
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={branch.status === 'Inactive' ? 'Cannot assign staff to inactive branch' : 'Assign Staff'}
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setManagingBranch(branch);
                            setShowManageProjects(true);
                          }}
                          disabled={branch.status === 'Inactive'}
                          className={`p-1 rounded ${
                            branch.status === 'Inactive'
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-indigo-600 hover:bg-indigo-50'
                          }`}
                          title={branch.status === 'Inactive' ? 'Cannot manage projects for inactive branch' : 'Manage Projects'}
                        >
                          <Briefcase className="w-4 h-4" />
                        </button>
                        {branch.status === 'Active' ? (
                          <button
                            onClick={() => handleDeactivateBranch(branch)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Deactivate"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateBranch(branch)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Activate"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBranch(branch)}
                          disabled={branch.status === 'Inactive'}
                          className={`p-1 rounded ${
                            branch.status === 'Inactive'
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={branch.status === 'Inactive' ? 'Cannot delete inactive branch' : 'Delete Branch'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing {startIndex + 1} to {Math.min(endIndex, branches.length)} of {branches.length} branches
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    currentPage === page
                      ? 'bg-blue-900 text-white'
                      : 'border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assigned Employees */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 md:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="text-sm text-slate-900">
            Assigned Employees - {selectedBranch === 'ALL' ? 'All Branches' : currentBranch?.name || 'N/A'}
          </h3>
          <span className="text-sm text-slate-600">{currentStats?.totalStaff || 0} employees</span>
        </div>
        <div className="divide-y divide-slate-200">
          {(() => {
            const allEmployees = currentStats?.employees || [];
            const employeeTotalPages = Math.ceil(allEmployees.length / employeesPerPage);
            const employeeStartIndex = (employeeCurrentPage - 1) * employeesPerPage;
            const employeeEndIndex = employeeStartIndex + employeesPerPage;
            const paginatedEmployees = allEmployees.slice(employeeStartIndex, employeeEndIndex);

            return paginatedEmployees.map(emp => (
              <div key={emp.id} className="p-4 hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-900">{emp.fullName}</p>
                    <p className="text-sm text-slate-600">{emp.employeeNo} • {emp.position}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Active
                  </span>
                </div>
              </div>
            ));
          })()}
        </div>

        {/* Employee Pagination */}
        {(() => {
          const allEmployees = currentStats?.employees || [];
          const employeeTotalPages = Math.ceil(allEmployees.length / employeesPerPage);
          const employeeStartIndex = (employeeCurrentPage - 1) * employeesPerPage;
          const employeeEndIndex = employeeStartIndex + employeesPerPage;

          return employeeTotalPages > 1 ? (
            <div className="p-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {employeeStartIndex + 1} to {Math.min(employeeEndIndex, allEmployees.length)} of {allEmployees.length} employees
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEmployeeCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={employeeCurrentPage === 1}
                  className="flex items-center gap-1 px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                {Array.from({ length: employeeTotalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setEmployeeCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      employeeCurrentPage === page
                        ? 'bg-blue-900 text-white'
                        : 'border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setEmployeeCurrentPage(prev => Math.min(employeeTotalPages, prev + 1))}
                  disabled={employeeCurrentPage === employeeTotalPages}
                  className="flex items-center gap-1 px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null;
        })()}
      </div>

      {/* Add Branch Modal */}
      {showAddBranch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Add New Branch</h3>
              <button onClick={() => setShowAddBranch(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Branch Code *</label>
                  <input
                    type="text"
                    value={newBranch.code}
                    onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="PPU-XX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Branch Name *</label>
                  <input
                    type="text"
                    value={newBranch.name}
                    onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Branch name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={newBranch.location}
                    onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City/State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contact Person</label>
                  <input
                    type="text"
                    value={newBranch.contactPerson}
                    onChange={(e) => setNewBranch({ ...newBranch, contactPerson: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Name"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={newBranch.address}
                    onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contact Number</label>
                  <input
                    type="text"
                    value={newBranch.contact}
                    onChange={(e) => setNewBranch({ ...newBranch, contact: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+60X-XXX-XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newBranch.email}
                    onChange={(e) => setNewBranch({ ...newBranch, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">OT Rate (RM/hour)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newBranch.otRate}
                    onChange={(e) => setNewBranch({ ...newBranch, otRate: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rest Day Rate (RM/hour)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newBranch.restDayRate}
                    onChange={(e) => setNewBranch({ ...newBranch, restDayRate: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Public Holiday Rate (RM/hour)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newBranch.publicHolidayRate}
                    onChange={(e) => setNewBranch({ ...newBranch, publicHolidayRate: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={newBranch.status}
                    onChange={(e) => setNewBranch({ ...newBranch, status: e.target.value as 'Active' | 'Inactive' })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowAddBranch(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewBranch}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Branch
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {showEditBranch && editingBranch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Edit Branch</h3>
              <button onClick={() => setShowEditBranch(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Branch Code</label>
                  <input
                    type="text"
                    value={editingBranch.code}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Branch Name *</label>
                  <input
                    type="text"
                    value={editingBranch.name}
                    onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={editingBranch.location}
                    onChange={(e) => setEditingBranch({ ...editingBranch, location: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contact Person</label>
                  <input
                    type="text"
                    value={editingBranch.contactPerson}
                    onChange={(e) => setEditingBranch({ ...editingBranch, contactPerson: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={editingBranch.address}
                    onChange={(e) => setEditingBranch({ ...editingBranch, address: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contact Number</label>
                  <input
                    type="text"
                    value={editingBranch.contact}
                    onChange={(e) => setEditingBranch({ ...editingBranch, contact: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editingBranch.email}
                    onChange={(e) => setEditingBranch({ ...editingBranch, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">OT Rate (RM/hour)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingBranch.otRate}
                    onChange={(e) => setEditingBranch({ ...editingBranch, otRate: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rest Day Rate (RM/hour)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingBranch.restDayRate}
                    onChange={(e) => setEditingBranch({ ...editingBranch, restDayRate: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Public Holiday Rate (RM/hour)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingBranch.publicHolidayRate}
                    onChange={(e) => setEditingBranch({ ...editingBranch, publicHolidayRate: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={editingBranch.status}
                    onChange={(e) => setEditingBranch({ ...editingBranch, status: e.target.value as 'Active' | 'Inactive' })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowEditBranch(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditBranch}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm sm:text-base"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Projects Modal */}
      {showManageProjects && managingBranch && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-semibold text-slate-900">Manage Projects - {managingBranch.name}</h3>
              <button onClick={() => setShowManageProjects(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-slate-900">Projects</h4>
                <button
                  onClick={() => setShowAddProject(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 font-medium rounded hover:bg-blue-100 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Project
                </button>
              </div>

              {showAddProject && (
                <div className="bg-slate-50 p-5 rounded-lg mb-6 border border-slate-200 shadow-sm">
                  <h5 className="font-medium text-slate-800 mb-4">{editingProjectId ? 'Edit Project' : 'Create New Project'}</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Project Name *</label>
                      <input
                        type="text"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="e.g. Phase 1 Construction"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Pay Structure</label>
                      <select
                        value={newProject.payStructure}
                        onChange={(e) => setNewProject({ ...newProject, payStructure: e.target.value as '8+3' | '8+4' })}
                        className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="8+3">8+3 Structure</option>
                        <option value="8+4">8+4 Structure</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Custom Normal OT Multiplier (Optional)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProject.customOtMultiplier || ''}
                        onChange={(e) => setNewProject({ ...newProject, customOtMultiplier: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="e.g. 1.5"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        If set, this overrides the default Normal Day OT multiplier.
                      </p>
                    </div>
                    
                    <div className="col-span-1 sm:col-span-2 mt-2">
                      <h6 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                        <Table2 className="w-4 h-4 text-blue-500" />
                        Preview: {newProject.payStructure} Multiplier Table
                      </h6>
                      <div className="overflow-hidden border border-slate-200 rounded text-xs bg-white">
                        <table className="w-full">
                          <thead className="bg-slate-100">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium text-slate-600">Day Type</th>
                              <th className="px-3 py-2 text-left font-medium text-slate-600">Standard Multiplier</th>
                              <th className="px-3 py-2 text-left font-medium text-slate-600">Effective Multiplier</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(() => {
                              let rawData = [];
                              try {
                                if (newProject.payStructure === '8+3') rawData = JSON.parse(settings.eightPlusThreeData || '[]');
                                else rawData = JSON.parse(settings.eightPlusFourData || '[]');
                              } catch(e) {}
                              
                              if (rawData.length === 0) {
                                return <tr><td colSpan={3} className="px-3 py-3 text-center text-slate-500">No data configured in settings.</td></tr>;
                              }

                              return rawData.map((row: any, i: number) => {
                                const isNormalOT = row.dayType === 'Normal Day OT';
                                const overrideVal = newProject.customOtMultiplier;
                                const isOverridden = isNormalOT && overrideVal !== undefined && overrideVal !== null;
                                
                                return (
                                  <tr key={i} className={isOverridden ? 'bg-amber-50' : ''}>
                                    <td className="px-3 py-2 font-medium text-slate-700">{row.dayType}</td>
                                    <td className="px-3 py-2 text-slate-500">{row.multiplier.toFixed(2)}x</td>
                                    <td className={`px-3 py-2 font-bold ${isOverridden ? 'text-amber-700' : 'text-slate-900'}`}>
                                      {isOverridden ? `${overrideVal.toFixed(2)}x (Custom)` : `${row.multiplier.toFixed(2)}x`}
                                    </td>
                                  </tr>
                                )
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Assign Employees (Optional)</label>
                      <div className="border border-slate-300 rounded max-h-32 overflow-y-auto p-1 bg-white">
                        {employees.filter(e => e.branchCode === managingBranch.code && e.status === 'Active' && !e.archivedDate).map(emp => (
                          <label key={emp.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={assignedEmployeesToProject.includes(emp.id)}
                              onChange={(e) => {
                                if (e.target.checked) setAssignedEmployeesToProject(prev => [...prev, emp.id]);
                                else setAssignedEmployeesToProject(prev => prev.filter(id => id !== emp.id));
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs text-slate-700">{emp.fullName} ({emp.employeeNo})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowAddProject(false);
                        setEditingProjectId(null);
                        setNewProject({ name: '', payStructure: '8+3', status: 'Active' });
                        setAssignedEmployeesToProject([]);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveProject(managingBranch.code)}
                      className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm"
                    >
                      Save Project
                    </button>
                  </div>
                </div>
              )}

              <div className="border border-slate-200 rounded-lg divide-y divide-slate-200">
                {projects.filter(p => p.branchCode === managingBranch.code).map(proj => (
                  <div key={proj.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <p className="font-semibold text-slate-900">{proj.name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                          {proj.payStructure}
                        </span>
                        {proj.customOtMultiplier && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                            Custom OT: {proj.customOtMultiplier}x
                          </span>
                        )}
                        <span className="text-xs text-slate-500 ml-1">
                          {employees.filter(e => e.projectId === proj.id).length} Employees
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEditProject(proj)} className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteProject(proj.id)} className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {projects.filter(p => p.branchCode === managingBranch.code).length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm">No projects created for this branch yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Branch Modal */}
      {showViewBranch && viewingBranch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900">Branch Details - {viewingBranch.name}</h3>
              <button onClick={() => setShowViewBranch(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 md:space-y-6">
              {/* Branch Info */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 text-sm md:text-base">Branch Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <p className="text-slate-600">Branch Code:</p>
                    <p className="font-medium text-slate-900">{viewingBranch.code}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Location:</p>
                    <p className="font-medium text-slate-900">{viewingBranch.location}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-600 flex items-center gap-2"><MapPin className="w-4 h-4" /> Address:</p>
                    <p className="font-medium text-slate-900">{viewingBranch.address}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 flex items-center gap-2"><Phone className="w-4 h-4" /> Contact:</p>
                    <p className="font-medium text-slate-900">{viewingBranch.contact}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 flex items-center gap-2"><Mail className="w-4 h-4" /> Email:</p>
                    <p className="font-medium text-slate-900">{viewingBranch.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Contact Person:</p>
                    <p className="font-medium text-slate-900">{viewingBranch.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Status:</p>
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      viewingBranch.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {viewingBranch.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 text-sm md:text-base">Statistics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {(() => {
                    const stats = getBranchStats(viewingBranch.code);
                    return (
                      <>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-600 mb-1">Total Staff</p>
                          <p className="text-2xl font-bold text-blue-900">{stats.totalStaff}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-purple-600 mb-1">Monthly Basic Salary</p>
                          <p className="text-lg font-bold text-purple-900">RM {stats.monthlyBasicSalary.toFixed(2)}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-green-600 mb-1">Total Advances</p>
                          <p className="text-lg font-bold text-green-900">RM {stats.totalAdvances.toFixed(2)}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Projects List */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-slate-900 text-sm md:text-base">Projects</h4>
                </div>

                <div className="border border-slate-200 rounded-lg divide-y divide-slate-200">
                  {projects.filter(p => p.branchCode === viewingBranch.code).map(proj => (
                    <div key={proj.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-900">{proj.name}</p>
                        <p className="text-xs text-slate-500">
                          Pay Structure: {proj.payStructure} 
                          {proj.customOtMultiplier && ` • OT Multiplier: ${proj.customOtMultiplier}x`}
                          {' '}• Employees: {employees.filter(e => e.projectId === proj.id).length}
                        </p>
                      </div>
                    </div>
                  ))}
                  {projects.filter(p => p.branchCode === viewingBranch.code).length === 0 && (
                    <div className="p-6 text-center text-slate-500 text-sm">
                      No projects created for this branch yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Employee List */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 text-sm md:text-base">Assigned Employees</h4>
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-200">
                  {getBranchStats(viewingBranch.code).employees.map(emp => (
                    <div key={emp.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-900">{String(emp.fullName)}</p>
                        <p className="text-sm text-slate-600">{String(emp.employeeNo)} • {String(emp.position)}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {String(emp.status)}
                      </span>
                    </div>
                  ))}
                  {getBranchStats(viewingBranch.code).employees.length === 0 && (
                    <div className="p-6 text-center text-slate-500">
                      No employees assigned to this branch
                    </div>
                  )}
                </div>
              </div>

              {/* Branch Status */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 text-sm md:text-base">Branch Status</h4>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Monthly Payroll</p>
                      <p className="text-xl font-bold text-slate-900">
                        RM {getBranchStats(viewingBranch.code).totalMonthlyPayroll.toFixed(2)}
                      </p>
                    </div>
                    <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
                      {viewingBranch.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowViewBranch(false)}
                className="w-full sm:w-auto px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm md:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Staff Modal */}
      {showAssignStaff && assigningToBranch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900">Assign Staff to {assigningToBranch.name}</h3>
              <button onClick={() => setShowAssignStaff(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Select Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Employee --</option>
                {employees.filter(e => e.status === 'Active' && e.branchCode !== assigningToBranch.code).map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeNo}) - Current: {emp.branch}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-2">
                This will reassign the selected employee to {assigningToBranch.name}
              </p>
            </div>
            <div className="p-4 sm:p-6 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowAssignStaff(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssignStaff}
                disabled={!selectedEmployee}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                Assign Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation */}
      {deactivateConfirm && (
        <ConfirmDialog
          title="Deactivate Branch"
          message="This branch will be marked as inactive and excluded from future payroll setup. Continue?"
          onConfirm={confirmDeactivate}
          onCancel={() => setDeactivateConfirm(null)}
          confirmText="Deactivate"
          confirmStyle="danger"
        />
      )}

      {/* Activate Confirmation */}
      {activateConfirm && (
        <ConfirmDialog
          title="Activate Branch"
          message={`Are you sure you want to activate branch "${activateConfirm.code} - ${activateConfirm.name}"?`}
          warningBox="This branch will be marked as active and will be included in payroll setup and operations."
          onConfirm={confirmActivate}
          onCancel={() => setActivateConfirm(null)}
          confirmText="Yes, Activate"
          confirmStyle="success"
        />
      )}

      {/* Delete Branch Confirmation */}
      {deleteBranchConfirm && (
        <ConfirmDialog
          title="Delete Branch"
          message={`Are you sure you want to permanently delete branch "${deleteBranchConfirm.code} - ${deleteBranchConfirm.name}"?`}
          warningBox="WARNING: This action cannot be undone! The branch will be permanently deleted from the system. Make sure no employees are assigned to this branch before deleting."
          onConfirm={confirmDeleteBranch}
          onCancel={() => setDeleteBranchConfirm(null)}
          confirmText="Yes, Delete Branch"
          confirmStyle="danger"
        />
      )}
    </div>
  );
}
