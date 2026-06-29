import { useState, useMemo, useEffect } from 'react';
import { usePayroll, Employee } from '../context/PayrollContext';
import { Plus, Download, Search, Eye, Edit, UserX, Building2, CheckSquare, Square, Upload, Users, UserCheck, UserMinus, FileText, Printer, X, BadgeCheck, Archive, Trash } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '../components/ConfirmDialog';
import EmployeeForm from '../components/EmployeeForm';
import EmployeeDetailModal from '../components/EmployeeDetailModal';

export default function EmployeeManagement() {
  const { employees, branches, projects, addEmployee, updateEmployee, deleteEmployee, archiveEmployee, addBranch, updateBranch, deleteBranch } = usePayroll();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showArchived, setShowArchived] = useState(false);
  const [unarchiveConfirm, setUnarchiveConfirm] = useState<Employee | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState<Employee | null>(null);
  const [archiveConfirm, setArchiveConfirm] = useState<Employee | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Employee | null>(null);
  const [activateConfirm, setActivateConfirm] = useState(false);
  const [bulkDeactivateConfirm, setBulkDeactivateConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAssignBranchModal, setShowAssignBranchModal] = useState(false);
  const [selectedBranchForAssign, setSelectedBranchForAssign] = useState('PPU-SA');
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [showEditBranchModal, setShowEditBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<{ code: string; name: string } | null>(null);
  const [deleteBranchConfirm, setDeleteBranchConfirm] = useState<{ code: string; name: string } | null>(null);
  const [showPrintEmployeesModal, setShowPrintEmployeesModal] = useState(false);
  const [selectedBranchesForPrint, setSelectedBranchesForPrint] = useState<string[]>([]);
  const [recentlyAssignedEmployees, setRecentlyAssignedEmployees] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 10;

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    // Exclude archived employees from all statistics
    const activeEmployees = employees.filter(e => !e.archivedDate);
    const archivedEmployees = employees.filter(e => e.archivedDate);

    const total = activeEmployees.length;
    const active = activeEmployees.filter(e => e.status === 'Active').length;
    const inactive = activeEmployees.filter(e => e.status === 'Inactive').length;
    const archived = archivedEmployees.length;

    // Extract unique branches
    const branches = Array.from(new Set(activeEmployees.map(e => e.branchCode)));
    const branchCounts: Record<string, number> = {};

    activeEmployees.forEach(emp => {
      if (emp.status === 'Active') {
        branchCounts[emp.branchCode] = (branchCounts[emp.branchCode] || 0) + 1;
      }
    });

    return {
      total,
      active,
      inactive,
      archived,
      totalBranches: branches.length,
      branchCounts
    };
  }, [employees]);

  const filteredEmployees = employees.filter(emp => {
    // Exclude archived employees unless "Show Archived" is enabled
    if (!showArchived && emp.archivedDate) return false;
    // When showing archived, only show archived employees
    if (showArchived && !emp.archivedDate) return false;

    const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeNo.includes(searchTerm);
    const matchesBranch = filterBranch === 'ALL' || emp.branchCode === filterBranch;
    const matchesStatus = filterStatus === 'ALL' || emp.status === filterStatus;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const startIndex = (currentPage - 1) * employeesPerPage;
  const endIndex = startIndex + employeesPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterBranch, filterStatus, showArchived]);

  const toggleSelectEmployee = (employeeId: string) => {
    const newSelection = new Set(selectedEmployees);
    if (newSelection.has(employeeId)) {
      newSelection.delete(employeeId);
    } else {
      newSelection.add(employeeId);
    }
    setSelectedEmployees(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedEmployees.size === filteredEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredEmployees.map(e => e.id)));
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleViewEmployee = (employee: Employee) => {
    setViewingEmployee(employee);
  };

  const handleDeactivateEmployee = (employee: Employee) => {
    setDeactivateConfirm(employee);
  };

  const handleActivateEmployee = (employee: Employee) => {
    updateEmployee(employee.id, { status: 'Active' });
    toast.success(`${employee.fullName} activated successfully.`);
  };

  const handleArchiveEmployee = (employee: Employee) => {
    setArchiveConfirm(employee);
  };

  const confirmArchive = () => {
    if (archiveConfirm) {
      archiveEmployee(archiveConfirm.id);
      toast.success(`${archiveConfirm.fullName} has been archived successfully.`);
      setArchiveConfirm(null);
    }
  };

  const handleUnarchiveEmployee = (employee: Employee) => {
    setUnarchiveConfirm(employee);
  };

  const confirmUnarchive = () => {
    if (unarchiveConfirm) {
      // @ts-ignore - Set to null to clear archived date in database
      updateEmployee(unarchiveConfirm.id, { archivedDate: null, status: 'Active' });
      toast.success(`${unarchiveConfirm.fullName} has been restored from archive.`);
      setUnarchiveConfirm(null);
      // Switch back to active view
      setShowArchived(false);
    }
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setDeleteConfirm(employee);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteEmployee(deleteConfirm.id);
      toast.success(`${deleteConfirm.fullName} has been deleted permanently.`);
      setDeleteConfirm(null);
    }
  };

  const confirmDeactivate = () => {
    if (deactivateConfirm) {
      updateEmployee(deactivateConfirm.id, { status: 'Inactive' });
      toast.success('Employee deactivated successfully.');
      setDeactivateConfirm(null);
    }
  };

  const handleBulkActivate = () => {
    if (selectedEmployees.size === 0) {
      toast.error('Please select employees.');
      return;
    }
    setActivateConfirm(true);
  };

  const confirmBulkActivate = () => {
    selectedEmployees.forEach(empId => {
      updateEmployee(empId, { status: 'Active' });
    });
    toast.success('Selected employees activated successfully.');
    setActivateConfirm(false);
    setSelectedEmployees(new Set());
  };

  const handleBulkDeactivate = () => {
    if (selectedEmployees.size === 0) {
      toast.error('Please select employees.');
      return;
    }
    setBulkDeactivateConfirm(true);
  };

  const confirmBulkDeactivate = () => {
    selectedEmployees.forEach(empId => {
      updateEmployee(empId, { status: 'Inactive' });
    });
    toast.success('Selected employees deactivated successfully.');
    setBulkDeactivateConfirm(false);
    setSelectedEmployees(new Set());
  };

  const handleSaveEmployee = (employeeData: Partial<Employee>) => {
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, employeeData);
      toast.success('Employee updated successfully.');
    } else {
      const newEmployee: Employee = {
        id: crypto.randomUUID(),
        status: 'Active',
        ...employeeData as Employee,
      };
      addEmployee(newEmployee);
      toast.success('Employee added successfully.');
    }
    setShowForm(false);
    setEditingEmployee(null);
  };

  const handleAddBranch = () => {
    if (!newBranchCode || !newBranchName) {
      toast.error('Please fill in all branch details.');
      return;
    }

    // Check if branch code already exists
    if (branches.some(b => b.code === newBranchCode)) {
      toast.error('Branch code already exists.');
      return;
    }

    addBranch({
      code: newBranchCode,
      name: newBranchName,
      location: '',
      address: '',
      contact: '',
      email: '',
      contactPerson: '',
      otRate: 7.5,
      restDayRate: 15,
      publicHolidayRate: 22.5,
      status: 'Active',
    });
    toast.success(`Branch ${newBranchCode} added successfully.`);
    setShowAddBranchModal(false);
    setNewBranchCode('');
    setNewBranchName('');
  };

  const handleEditBranch = (branch: { code: string; name: string }) => {
    setEditingBranch(branch);
    setShowEditBranchModal(true);
  };

  const handleSaveEditBranch = () => {
    if (!editingBranch?.code || !editingBranch?.name) {
      toast.error('Please fill in all branch details.');
      return;
    }

    updateBranch(editingBranch.code, { name: editingBranch.name });
    toast.success(`Branch ${editingBranch.code} updated successfully.`);
    setShowEditBranchModal(false);
    setEditingBranch(null);
  };

  const handleDeleteBranch = (branch: { code: string; name: string }) => {
    // Check if any employees are assigned to this branch
    const employeesInBranch = employees.filter(e => e.branchCode === branch.code);
    if (employeesInBranch.length > 0) {
      toast.error(`Cannot delete branch. ${employeesInBranch.length} employee(s) are assigned to this branch.`);
      return;
    }

    setDeleteBranchConfirm(branch);
  };

  const confirmDeleteBranch = () => {
    if (deleteBranchConfirm) {
      deleteBranch(deleteBranchConfirm.code);
      toast.success(`Branch ${deleteBranchConfirm.code} deleted successfully.`);
      setDeleteBranchConfirm(null);
    }
  };

  const handlePrintProfile = (employee: Employee) => {
    // Create a simple profile print view
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Employee Profile - ${employee.fullName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .section { margin-bottom: 20px; }
              .label { font-weight: bold; display: inline-block; width: 150px; }
              .value { display: inline-block; }
              @media print { button { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Employee Profile</h1>
              <p>Dynamic Guardforce Sdn Bhd</p>
            </div>
            <div class="section">
              <div><span class="label">Employee No:</span><span class="value">${employee.employeeNo}</span></div>
              <div><span class="label">Full Name:</span><span class="value">${employee.fullName}</span></div>
              <div><span class="label">IC Number:</span><span class="value">${employee.icNumber}</span></div>
              <div><span class="label">Branch:</span><span class="value">${employee.branchCode}</span></div>
              <div><span class="label">Position:</span><span class="value">${employee.position || 'Security Guard'}</span></div>
              <div><span class="label">Basic Salary:</span><span class="value">RM ${employee.basicSalary?.toFixed(2)}</span></div>
              <div><span class="label">Bank:</span><span class="value">${employee.bankName}</span></div>
              <div><span class="label">Account No:</span><span class="value">${employee.accountNumber}</span></div>
              <div><span class="label">Status:</span><span class="value">${employee.status}</span></div>
            </div>
            <button onclick="window.print()" style="padding: 10px 20px; background: #1e40af; color: white; border: none; border-radius: 5px; cursor: pointer;">Print</button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    toast.success(`Opening print preview for ${employee.fullName}`);
  };

  const handleAssignBranch = (employee: Employee) => {
    setSelectedEmployees(new Set([employee.id]));
    setShowAssignBranchModal(true);
  };

  const handleBulkAssignBranch = () => {
    if (selectedEmployees.size === 0) {
      toast.error('Please select employees.');
      return;
    }
    setShowAssignBranchModal(true);
  };

  const confirmAssignBranch = () => {
    const selectedBranch = branches.find(b => b.code === selectedBranchForAssign);
    if (!selectedBranch) {
      toast.error('Invalid branch selection');
      return;
    }

    selectedEmployees.forEach(empId => {
      updateEmployee(empId, {
        branchCode: selectedBranch.code,
        branch: selectedBranch.name
      });
    });
    toast.success(`${selectedEmployees.size} employee(s) assigned to ${selectedBranch.name} successfully.`);

    // Mark employees as recently assigned
    setRecentlyAssignedEmployees(new Set(selectedEmployees));

    // Clear the recently assigned state after 2 seconds
    setTimeout(() => {
      setRecentlyAssignedEmployees(new Set());
    }, 2000);

    setShowAssignBranchModal(false);
    setSelectedEmployees(new Set());
  };

  const handleBulkImport = () => {
    setShowImportModal(true);
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n');
      let imported = 0;

      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV handling quoted fields
        const columns: string[] = [];
        let currentField = '';
        let inQuotes = false;

        for (let j = 0; j < line.length; j++) {
          const char = line[j];

          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            columns.push(currentField.trim());
            currentField = '';
          } else {
            currentField += char;
          }
        }
        columns.push(currentField.trim()); // Add last field

        const [
          employeeNo,
          fullName,
          icNumber,
          position,
          branchCode,
          branch,
          basicSalary,
          bankName,
          accountNumber,
          epfNumber,
          socsoNumber,
          status
        ] = columns;

        if (employeeNo && fullName) {
          // Find the branch to get its name if branchCode is provided
          const foundBranch = branches.find(b => b.code === branchCode);

          const newEmployee: Employee = {
            id: crypto.randomUUID(),
            employeeNo: employeeNo,
            fullName: fullName,
            icNumber: icNumber || '',
            position: position || 'Security Guard',
            branchCode: branchCode || 'PPU-SA',
            branch: branch || foundBranch?.name || 'PPU IKS Simpang Ampat',
            basicSalary: parseFloat(basicSalary) || 2000,
            bankName: bankName || 'MAYBANK',
            accountNumber: accountNumber || '',
            epfNumber: epfNumber || '',
            socsoNumber: socsoNumber || '',
            status: (status as 'Active' | 'Inactive') || 'Active',
          };
          addEmployee(newEmployee);
          imported++;
        }
      }

      toast.success(`Successfully imported ${imported} employee(s).`);
      setShowImportModal(false);
    };
    reader.readAsText(file);
  };

  const handleExportSelected = () => {
    if (selectedEmployees.size === 0) {
      toast.error('Please select employees to export.');
      return;
    }

    // Get selected employees data
    const employeesToExport = Array.from(selectedEmployees)
      .map(id => employees.find(e => e.id === id))
      .filter(e => e);

    // Create CSV headers
    const headers = [
      'Employee No',
      'Full Name',
      'IC Number',
      'Position',
      'Branch Code',
      'Branch',
      'Basic Salary',
      'Bank Name',
      'Account Number',
      'EPF Number',
      'SOCSO Number',
      'Status'
    ];

    // Create CSV rows
    const rows = employeesToExport.map(emp => [
      emp.employeeNo,
      `"${emp.fullName}"`,
      emp.icNumber,
      `"${emp.position}"`,
      emp.branchCode,
      `"${emp.branch}"`,
      emp.basicSalary.toFixed(2),
      `"${emp.bankName}"`,
      emp.accountNumber,
      emp.epfNumber,
      emp.socsoNumber,
      emp.status
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `employees-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast.success(`${employeesToExport.length} employee(s) exported successfully.`);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Employees</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">Manage employee information and records</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Total</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{summaryStats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{summaryStats.active}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Inactive</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{summaryStats.inactive}</p>
            </div>
            <UserMinus className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div
          className={`rounded-lg shadow p-4 cursor-pointer transition-all ${
            showArchived
              ? 'bg-amber-100 border-2 border-amber-500 hover:bg-amber-200'
              : 'bg-white hover:bg-slate-50 hover:border-2 hover:border-slate-300'
          }`}
          onClick={() => setShowArchived(!showArchived)}
          title="Click to view archived employees"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs uppercase tracking-wide ${showArchived ? 'text-amber-800 font-semibold' : 'text-slate-500'}`}>
                Archived
              </p>
              <p className={`text-2xl font-bold mt-1 ${showArchived ? 'text-amber-900' : 'text-slate-600'}`}>
                {summaryStats.archived}
              </p>
            </div>
            <Archive className={`w-8 h-8 ${showArchived ? 'text-amber-700' : 'text-slate-600'}`} />
          </div>
          <div className={`mt-2 text-xs font-medium flex items-center gap-1 ${showArchived ? 'text-amber-800' : 'text-blue-600'}`}>
            {showArchived ? (
              <>
                <span>✓ Viewing Archived</span>
              </>
            ) : (
              <>
                <span>Click to view</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow">
        <div>
            {/* Action Buttons */}
            <div className="px-4 py-3 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPrintEmployeesModal(true)}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    <Printer className="w-4 h-4 inline mr-1" />
                    Print Employees
                  </button>
                  <button
                    onClick={handleAddEmployee}
                    className="px-3 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add Employees
                  </button>
                </div>
              </div>
            </div>

            {/* Archived View Banner */}
            {showArchived && (
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Archive className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        Viewing Archived Employees
                        <span className="ml-2 px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full text-xs">
                          {filteredEmployees.length} archived
                        </span>
                      </p>
                      <p className="text-xs text-amber-700">These employees are hidden from active operations and payroll</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowArchived(false)}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm flex items-center gap-1"
                  >
                    <Users className="w-4 h-4" />
                    Back to Active Employees
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="px-4 py-3 border-b border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or employee no..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Branches</option>
                  {branches.filter(b => b.status === 'Active').map(branch => (
                    <option key={branch.code} value={branch.code}>{branch.name}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkImport}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm"
                  >
                    <Upload className="w-4 h-4 inline mr-1" />
                    Import
                  </button>
                  <button
                    onClick={handleExportSelected}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm"
                  >
                    <Download className="w-4 h-4 inline mr-1" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Employee Table */}
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-center w-12">
                  <button onClick={toggleSelectAll}>
                    {selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Bank
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Basic Salary
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedEmployees.map((employee, index) => (
                <tr
                  key={`employee-${employee.id}-${index}`}
                  className={`transition-colors ${
                    showArchived
                      ? 'bg-amber-50/30 hover:bg-amber-50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleSelectEmployee(employee.id)}>
                      {selectedEmployees.has(employee.id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{employee.fullName}</p>
                      <p className="text-xs text-slate-500">{employee.employeeNo}</p>
                      {showArchived && employee.archivedDate && typeof employee.archivedDate === 'string' && (
                        <p className="text-xs text-amber-600 mt-0.5">
                          Archived: {new Date(employee.archivedDate).toLocaleDateString('en-MY')}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {employee.branch}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {employee.position}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="text-slate-900">{employee.bankName}</p>
                      <p className="text-xs text-slate-500">{employee.accountNumber}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">
                    RM {employee.basicSalary?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewEmployee(employee)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!showArchived && (
                        <>
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                            title="Edit Employee"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAssignBranch(employee)}
                            className={`p-1 rounded ${
                              recentlyAssignedEmployees.has(employee.id)
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-orange-600 hover:bg-orange-50'
                            }`}
                            title={recentlyAssignedEmployees.has(employee.id) ? 'Assigned' : 'Assign Branch'}
                          >
                            {recentlyAssignedEmployees.has(employee.id) ? (
                              <BadgeCheck className="w-4 h-4" />
                            ) : (
                              <Building2 className="w-4 h-4" />
                            )}
                          </button>
                          {employee.status === 'Active' ? (
                            <button
                              onClick={() => handleDeactivateEmployee(employee)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Deactivate"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivateEmployee(employee)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Activate"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleArchiveEmployee(employee)}
                            className="p-1 text-slate-600 hover:bg-slate-50 rounded"
                            title="Archive Employee"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Employee"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {showArchived && (
                        <button
                          onClick={() => handleUnarchiveEmployee(employee)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          title="Restore from Archive"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
                </table>

                {/* Pagination */}
                {filteredEmployees.length > 0 && totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} employees
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
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
                        className="px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {filteredEmployees.length === 0 && (
                  <div className="text-center py-12">
                    {showArchived ? (
                      <>
                        <Archive className="w-12 h-12 text-amber-300 mx-auto mb-3" />
                        <p className="text-slate-700 font-semibold text-lg">No archived employees</p>
                        <p className="text-sm text-slate-500 mt-2">When you archive an employee, they will appear here</p>
                        <button
                          onClick={() => setShowArchived(false)}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          View Active Employees
                        </button>
                      </>
                    ) : (
                      <p className="text-slate-500">No employees found</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      {/* Employee Form Modal */}
      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          branches={branches}
          projects={projects}
          onSave={handleSaveEmployee}
          onCancel={() => {
            setShowForm(false);
            setEditingEmployee(null);
          }}
        />
      )}

      {/* Employee Detail Modal */}
      {viewingEmployee && (
        <EmployeeDetailModal
          employee={viewingEmployee}
          onClose={() => setViewingEmployee(null)}
        />
      )}

      {/* Deactivate Confirmation */}
      {deactivateConfirm && (
        <ConfirmDialog
          title="Deactivate Employee"
          message={`Are you sure you want to deactivate ${deactivateConfirm.fullName}?`}
          warningBox="You can reactivate this employee later if needed."
          onConfirm={confirmDeactivate}
          onCancel={() => setDeactivateConfirm(null)}
          confirmText="Yes, Deactivate"
          confirmStyle="danger"
        />
      )}

      {/* Archive Confirmation */}
      {archiveConfirm && (
        <ConfirmDialog
          title="Archive Employee"
          message={`Are you sure you want to archive ${archiveConfirm.fullName}?`}
          warningBox="Archived employees will be removed from all active lists and will no longer appear in attendance, payroll, or other modules. This action cannot be undone easily."
          onConfirm={confirmArchive}
          onCancel={() => setArchiveConfirm(null)}
          confirmText="Yes, Archive"
          confirmStyle="danger"
        />
      )}

      {/* Unarchive Confirmation */}
      {unarchiveConfirm && (
        <ConfirmDialog
          title="Restore Employee"
          message={`Restore ${unarchiveConfirm.fullName} from archive?`}
          warningBox="This employee will be restored as Active and will appear in all modules again."
          onConfirm={confirmUnarchive}
          onCancel={() => setUnarchiveConfirm(null)}
          confirmText="Yes, Restore"
          confirmStyle="success"
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Employee"
          message={`Are you sure you want to permanently delete ${deleteConfirm.fullName}?`}
          warningBox="WARNING: This action cannot be undone! The employee and all their related records (attendance, advances, payroll) will be permanently deleted from the system."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
          confirmText="Yes, Delete Permanently"
          confirmStyle="danger"
        />
      )}

      {/* Bulk Activate Confirmation */}
      {activateConfirm && (
        <ConfirmDialog
          title="Activate Employees"
          message={`Activate ${selectedEmployees.size} selected employee${selectedEmployees.size > 1 ? 's' : ''}?`}
          onConfirm={confirmBulkActivate}
          onCancel={() => setActivateConfirm(false)}
          confirmText="Yes, Activate"
          confirmStyle="success"
        />
      )}

      {/* Bulk Deactivate Confirmation */}
      {bulkDeactivateConfirm && (
        <ConfirmDialog
          title="Deactivate Employees"
          message={`Deactivate ${selectedEmployees.size} selected employee${selectedEmployees.size > 1 ? 's' : ''}?`}
          warningBox="You can reactivate these employees later if needed."
          onConfirm={confirmBulkDeactivate}
          onCancel={() => setBulkDeactivateConfirm(false)}
          confirmText="Yes, Deactivate"
          confirmStyle="danger"
        />
      )}

      {/* Import Employees Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Import Employees</h3>
              <p className="text-sm text-slate-600 mt-1">Upload Excel or CSV file to import multiple employees</p>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <h4 className="text-sm font-medium text-slate-900 mb-2">Upload Employee Data</h4>
                <p className="text-xs text-slate-600 mb-4">
                  CSV format: Employee No, Full Name, IC Number, Position, Branch Code, Branch, Basic Salary, Bank Name, Account Number, EPF Number, SOCSO Number, Status
                </p>
                <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                  Choose File
                </label>
                <p className="text-xs text-slate-500 mt-3">Supported: CSV, Excel (.xlsx, .xls)</p>
              </div>
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="text-sm font-semibold text-blue-900 mb-2">CSV Format Example:</h5>
                <code className="text-xs text-blue-800 block whitespace-pre-wrap break-all">
                  EMP001,John Doe,900101011234,Security Guard,PPU-SA,PPU IKS Simpang Ampat,2000,MAYBANK,1234567890,EP123456,SO123456,Active<br />
                  EMP002,Jane Smith,910202022345,Static Guard,PPU-BK,PPU HalalHub Batu Kawan,2200,CIMB,0987654321,EP234567,SO234567,Active
                </code>
                <p className="text-xs text-blue-700 mt-2">
                  Column order: Employee No, Full Name, IC Number, Position, Branch Code, Branch, Basic Salary, Bank Name, Account Number, EPF Number, SOCSO Number, Status
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Branch Modal */}
      {showAssignBranchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Assign Branch</h3>
              <p className="text-sm text-slate-600 mt-1">
                Assign {selectedEmployees.size} employee{selectedEmployees.size > 1 ? 's' : ''} to a branch
              </p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Branch
              </label>
              <select
                value={selectedBranchForAssign}
                onChange={(e) => setSelectedBranchForAssign(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {branches.filter(b => b.status === 'Active').map(branch => (
                  <option key={branch.code} value={branch.code}>{branch.name}</option>
                ))}
              </select>
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  This will update the branch assignment for all selected employees. This action will affect their attendance and payroll records.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAssignBranchModal(false);
                  setSelectedEmployees(new Set());
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmAssignBranch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Branch Modal */}
      {showAddBranchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Add New Branch</h3>
              <p className="text-sm text-slate-600 mt-1">Create a new branch location</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Branch Code *
                </label>
                <input
                  type="text"
                  value={newBranchCode}
                  onChange={(e) => setNewBranchCode(e.target.value.toUpperCase())}
                  placeholder="e.g., PPU-PG"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-slate-500 mt-1">Unique identifier for the branch (e.g., PPU-SA, PPU-BK)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Branch Name *
                </label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="e.g., PPU Penang Island"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-slate-500 mt-1">Full name of the branch location</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  New branch will be available immediately in all dropdowns and filters across the system.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddBranchModal(false);
                  setNewBranchCode('');
                  setNewBranchName('');
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBranch}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add Branch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {showEditBranchModal && editingBranch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Edit Branch</h3>
              <p className="text-sm text-slate-600 mt-1">Update branch information</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Branch Code *
                </label>
                <input
                  type="text"
                  value={editingBranch.code}
                  disabled
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">Branch code cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Branch Name *
                </label>
                <input
                  type="text"
                  value={editingBranch.name}
                  onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                  placeholder="e.g., PPU Penang Island"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditBranchModal(false);
                  setEditingBranch(null);
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditBranch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Branch Confirmation */}
      {deleteBranchConfirm && (
        <ConfirmDialog
          title="Delete Branch"
          message={`Are you sure you want to delete branch "${deleteBranchConfirm.code} - ${deleteBranchConfirm.name}"?`}
          warningBox="This action cannot be undone. Make sure no employees are assigned to this branch before deleting."
          onConfirm={confirmDeleteBranch}
          onCancel={() => setDeleteBranchConfirm(null)}
          confirmText="Yes, Delete Branch"
          cancelText="Cancel"
          confirmStyle="danger"
        />
      )}

      {/* Print Employees Modal */}
      {showPrintEmployeesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Print Employee List</h3>
                <p className="text-sm text-slate-600 mt-1">Generate employee list by branch</p>
              </div>
              <button
                onClick={() => {
                  setShowPrintEmployeesModal(false);
                  setSelectedBranchesForPrint([]);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Branches (Multiple Selection)
                </label>
                <div className="space-y-2 border border-slate-300 rounded-lg p-3 max-h-60 overflow-y-auto">
                  <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBranchesForPrint.length === branches.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBranchesForPrint(branches.map(b => b.code));
                        } else {
                          setSelectedBranchesForPrint([]);
                        }
                      }}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-slate-900">All Branches</span>
                  </label>
                  {branches.filter(b => b.status === 'Active').map(branch => {
                    const empCount = employees.filter(e => e.branchCode === branch.code && e.status === 'Active').length;
                    return (
                      <label key={branch.code} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBranchesForPrint.includes(branch.code)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBranchesForPrint([...selectedBranchesForPrint, branch.code]);
                            } else {
                              setSelectedBranchesForPrint(selectedBranchesForPrint.filter(c => c !== branch.code));
                            }
                          }}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-slate-900 flex-1">{branch.code} - {branch.name}</span>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{empCount} staff</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Print Summary</p>
                    <p>• Selected Branches: {selectedBranchesForPrint.length === 0 ? 'None' : selectedBranchesForPrint.length === branches.length ? 'All Branches' : `${selectedBranchesForPrint.length} Branch(es)`}</p>
                    <p>• Total Employees: {selectedBranchesForPrint.length === 0 ? 0 : employees.filter(e => selectedBranchesForPrint.includes(e.branchCode) && e.status === 'Active').length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPrintEmployeesModal(false);
                  setSelectedBranchesForPrint([]);
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedBranchesForPrint.length === 0) {
                    toast.error('Please select at least one branch.');
                    return;
                  }

                  // Filter employees by selected branches
                  const employeesToPrint = employees
                    .filter(e => selectedBranchesForPrint.includes(e.branchCode) && e.status === 'Active')
                    .sort((a, b) => {
                      // Sort by branch, then by name
                      if (a.branchCode !== b.branchCode) {
                        return a.branchCode.localeCompare(b.branchCode);
                      }
                      return a.fullName.localeCompare(b.fullName);
                    });

                  if (employeesToPrint.length === 0) {
                    toast.error('No active employees found in selected branch(es).');
                    return;
                  }

                  // Generate print preview
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    // Group by branch for better organization
                    const branchGroups: Record<string, typeof employeesToPrint> = {};
                    employeesToPrint.forEach(emp => {
                      if (!branchGroups[emp.branchCode]) {
                        branchGroups[emp.branchCode] = [];
                      }
                      branchGroups[emp.branchCode].push(emp);
                    });

                    const branchSections = selectedBranchesForPrint.map(branchCode => {
                      const branchEmps = branchGroups[branchCode] || [];
                      const branch = branches.find(b => b.code === branchCode);

                      if (branchEmps.length === 0) return '';

                      const rows = branchEmps.map((emp, index) => `
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${index + 1}</td>
                          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                            <div style="font-weight: 600; color: #1e293b;">${emp.fullName}</div>
                            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${emp.employeeNo}</div>
                          </td>
                          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${emp.icNumber}</td>
                          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${emp.position}</td>
                          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                            <div>${emp.bankName}</div>
                            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${emp.accountNumber}</div>
                          </td>
                          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 500;">RM ${emp.basicSalary.toFixed(2)}</td>
                        </tr>
                      `).join('');

                      return `
                        <div style="margin-bottom: 30px; page-break-inside: avoid;">
                          <div style="background: #1e40af; color: white; padding: 12px 16px; margin-bottom: 10px; border-radius: 6px;">
                            <div style="font-size: 16px; font-weight: 600;">${branch?.name || branchCode}</div>
                            <div style="font-size: 13px; opacity: 0.9; margin-top: 3px;">${branchCode} • ${branchEmps.length} Employee(s)</div>
                          </div>
                          <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                              <tr>
                                <th style="background: #f1f5f9; padding: 10px; text-align: center; font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; width: 50px;">No.</th>
                                <th style="background: #f1f5f9; padding: 10px; text-align: left; font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; border-bottom: 2px solid #cbd5e1;">Employee Name</th>
                                <th style="background: #f1f5f9; padding: 10px; text-align: left; font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; border-bottom: 2px solid #cbd5e1;">IC Number</th>
                                <th style="background: #f1f5f9; padding: 10px; text-align: left; font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; border-bottom: 2px solid #cbd5e1;">Position</th>
                                <th style="background: #f1f5f9; padding: 10px; text-align: left; font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; border-bottom: 2px solid #cbd5e1;">Bank Details</th>
                                <th style="background: #f1f5f9; padding: 10px; text-align: right; font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; border-bottom: 2px solid #cbd5e1;">Salary</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${rows}
                            </tbody>
                          </table>
                        </div>
                      `;
                    }).join('');

                    printWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <title>Employee List Report</title>
                          <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body {
                              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                              padding: 30px;
                              background: white;
                            }
                            .header {
                              text-align: center;
                              margin-bottom: 30px;
                              padding-bottom: 20px;
                              border-bottom: 3px solid #1e40af;
                            }
                            .company-name {
                              font-size: 26px;
                              font-weight: bold;
                              color: #1e40af;
                            }
                            .report-title {
                              font-size: 18px;
                              color: #475569;
                              margin-top: 10px;
                            }
                            .report-subtitle {
                              font-size: 14px;
                              color: #64748b;
                              margin-top: 6px;
                            }
                            .footer {
                              margin-top: 40px;
                              padding-top: 20px;
                              border-top: 2px solid #e2e8f0;
                              text-align: center;
                              font-size: 12px;
                              color: #64748b;
                            }
                            @media print {
                              body { padding: 20px; }
                              .no-print { display: none; }
                            }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <div class="company-name">DYNAMIC GUARDFORCE SDN BHD</div>
                            <div class="report-title">Employee Directory</div>
                            <div class="report-subtitle">Active Employees by Branch</div>
                          </div>

                          ${branchSections}

                          <div class="footer">
                            <div style="font-weight: 500;">Generated on: ${new Date().toLocaleDateString('en-MY', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</div>
                            <div style="margin-top: 8px;">
                              Total Active Employees: ${employeesToPrint.length} |
                              Branch(es): ${selectedBranchesForPrint.length === branches.length ? 'All' : selectedBranchesForPrint.join(', ')}
                            </div>
                            <div style="margin-top: 10px; font-size: 11px; color: #94a3b8;">
                              Confidential Document - For Internal Use Only
                            </div>
                          </div>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.focus();
                    setTimeout(() => {
                      printWindow.print();
                    }, 250);
                    toast.success('Employee list opened for printing');
                    setShowPrintEmployeesModal(false);
                    setSelectedBranchesForPrint([]);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Printer className="w-4 h-4" />
                Print Employee List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
