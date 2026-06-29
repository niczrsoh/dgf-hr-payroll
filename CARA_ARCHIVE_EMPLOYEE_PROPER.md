# PANDUAN PROPER: Archive/Delete Employee

## ❌ MASALAH SEBELUM NI:
Employee yang di-delete atau archived masih muncul di modul lain:
- ❌ Payslip masih show employee archived
- ❌ Advance Payment History show employee archived  
- ❌ Payroll Processing History show employee archived
- ❌ Employee dropdown dalam history filters show semua employee termasuk yang archived

## ✅ APA YANG TELAH DIPERBAIKI:

### 1. **Payslip Module - Filter Archived Employees**
**File:** `/src/app/pages/Payslip.tsx`

**Sebelum:**
```typescript
const filteredPayrolls = payrolls.filter(p => {
  const employee = employees.find(e => e.id === p.employeeId);
  if (!employee) return false;
  // Tiada check untuk archived!
  return matchesSearch && matchesBranch && matchesMonth && matchesYear;
});
```

**Selepas:**
```typescript
const filteredPayrolls = payrolls.filter(p => {
  const employee = employees.find(e => e.id === p.employeeId);
  if (!employee) return false;
  
  // ✅ CRITICAL: Exclude archived/deleted employees
  if (employee.archivedDate) return false;
  
  return matchesSearch && matchesBranch && matchesMonth && matchesYear;
});
```

### 2. **Advance Payment History - Filter Archived Employees**
**File:** `/src/app/pages/AdvancePayment.tsx`

**Function:** `getFilteredHistoryRecords()`

**Ditambah:**
```typescript
const employee = employees.find(e => e.id === adv.employeeId);
if (!employee) return false;
// ✅ CRITICAL: Exclude archived/deleted employees from history
if (employee.archivedDate) return false;
```

### 3. **Payroll Processing History - Filter Archived Employees**
**File:** `/src/app/pages/PayrollProcessing.tsx`

**Function:** `getFilteredHistoryRecords()`

**Ditambah:**
```typescript
const employee = employees.find(e => e.id === payroll.employeeId);
if (!employee) return false;
// ✅ CRITICAL: Exclude archived/deleted employees from history
if (employee.archivedDate) return false;
```

### 4. **Employee Dropdown Filters - Only Active Employees**
**Files:**
- `/src/app/pages/AdvancePayment.tsx` (History section)
- `/src/app/pages/PayrollProcessing.tsx` (History section)

**Sebelum:**
```typescript
{employees.map((emp, index) => (
  <option key={`emp-${emp.id}-${index}`} value={emp.fullName}>
    {emp.fullName}
  </option>
))}
```

**Selepas:**
```typescript
{employees.filter(emp => !emp.archivedDate).map((emp, index) => (
  <option key={`emp-${emp.id}-${index}`} value={emp.fullName}>
    {emp.fullName}
  </option>
))}
```

---

## 📋 CHECKLIST: Employee Filter Di Semua Module

| Module | Main List | History | Dropdowns | Status |
|--------|-----------|---------|-----------|--------|
| **Employee Management** | ✅ Toggle view | N/A | ✅ Branch filter | ✅ FIXED |
| **Attendance Entry** | ✅ Filtered | ✅ Cycle list | N/A | ✅ FIXED |
| **Advance Payment** | ✅ Filtered | ✅ FIXED | ✅ FIXED | ✅ FIXED |
| **Payroll Processing** | ✅ Filtered | ✅ FIXED | ✅ FIXED | ✅ FIXED |
| **Payslip** | ✅ FIXED | N/A | N/A | ✅ FIXED |

---

## 🔍 CARA ARCHIVE EMPLOYEE WORKS:

### Step 1: User Archive Employee
```typescript
// Di EmployeeManagement.tsx
const handleArchiveEmployee = (id: string) => {
  setArchiveConfirm(id);
};

const confirmArchive = () => {
  if (archiveConfirm) {
    archiveEmployee(archiveConfirm); // Call context function
    setArchiveConfirm(null);
  }
};
```

### Step 2: Context Update Employee
```typescript
// Di PayrollContext.tsx
const archiveEmployee = (id: string) => {
  const archivedDate = new Date().toISOString().split('T')[0]; // e.g., "2026-05-19"
  
  setEmployees(prevEmployees => prevEmployees.map(emp =>
    emp.id === id 
      ? { ...emp, archivedDate, status: 'Inactive' } 
      : emp
  ));
  
  // Update database
  db.updateEmployee(id, { archivedDate, status: 'Inactive' });
};
```

### Step 3: Filter Across All Modules
Semua module sekarang check:
```typescript
if (employee.archivedDate) return false; // ❌ EXCLUDE!
```

---

## 🎯 FILTER LOGIC SUMMARY:

### Main Employee Lists (Attendance, Advance, Payroll):
```typescript
const filteredEmployees = employees.filter(emp => {
  // ❌ CRITICAL: Exclude archived employees
  if (emp.archivedDate) return false;
  
  // ❌ Only show employees created on/before selected month
  if (emp.createdDate && emp.createdDate > selectedMonth + '-01') return false;
  
  // ✅ Apply other filters
  return matchesSearch && matchesBranch;
});
```

### Payslip Records:
```typescript
const filteredPayrolls = payrolls.filter(p => {
  const employee = employees.find(e => e.id === p.employeeId);
  if (!employee) return false;
  
  // ❌ CRITICAL: Exclude archived employees
  if (employee.archivedDate) return false;
  
  return matchesSearch && matchesBranch && matchesMonth && matchesYear;
});
```

### History Records (Advance & Payroll):
```typescript
const getFilteredHistoryRecords = () => {
  return records.filter(record => {
    const employee = employees.find(e => e.id === record.employeeId);
    if (!employee) return false;
    
    // ❌ CRITICAL: Exclude archived employees
    if (employee.archivedDate) return false;
    
    return matchesMonth && matchesEmployee && matchesBranch;
  });
};
```

### Employee Dropdowns:
```typescript
{employees.filter(emp => !emp.archivedDate).map((emp, index) => (
  <option key={`emp-${emp.id}-${index}`} value={emp.fullName}>
    {emp.fullName}
  </option>
))}
```

---

## 💾 DATABASE STRUCTURE:

### Employee Table:
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY,
  employee_no VARCHAR(50),
  full_name VARCHAR(255),
  status VARCHAR(20),        -- 'Active' or 'Inactive'
  created_date DATE,         -- When employee was added
  archived_date DATE,        -- When employee was archived (NULL if active)
  ...
);
```

### Important Notes:
- `status: 'Inactive'` - User manually set employee as inactive (still appears in lists)
- `archivedDate: '2026-05-19'` - Employee was deleted/archived (HIDDEN from all lists)
- Both can be set together when archiving

---

## ✅ TESTING CHECKLIST:

### Test Archive Employee:
1. ✅ Go to Employee Management
2. ✅ Click "Archive" on an employee
3. ✅ Confirm archive action
4. ✅ Check employee disappears from:
   - [ ] Employee Management active list (toggle to view archived)
   - [ ] Attendance Entry
   - [ ] Advance Payment
   - [ ] Payroll Processing
   - [ ] Payslip
   - [ ] All History sections
   - [ ] All employee dropdowns

### Test Restore Employee:
1. ✅ Toggle "View Archived Employees"
2. ✅ Click "Restore" on archived employee
3. ✅ Confirm restore
4. ✅ Check employee reappears in all modules (for current/future months only)

---

## 🚨 IMPORTANT NOTES:

### Historical Data Integrity:
- ✅ Archived employee's **past records remain** in database
- ✅ Past payslips/advances/payrolls are **preserved**
- ❌ But archived employees are **filtered out from UI**
- ❌ They won't appear in any lists, dropdowns, or filters

### Why This Approach:
1. **Data Integrity**: Historical payment records preserved for auditing
2. **Clean UI**: Users don't see deleted employees cluttering lists
3. **Reversible**: Can restore archived employee if needed
4. **Compliant**: Audit trail maintained for compliance

### Future Considerations:
If you need to **permanently delete** employee data:
1. First check all related records (attendance, advances, payrolls)
2. Consider archiving instead of deleting
3. If must delete, implement cascade delete in database
4. Add confirmation dialog with warning about data loss

---

## 📝 QUICK REFERENCE:

### Filter Pattern (Copy-Paste):
```typescript
// In any module filtering employees
const filteredData = data.filter(item => {
  const employee = employees.find(e => e.id === item.employeeId);
  if (!employee) return false;
  if (employee.archivedDate) return false; // ⭐ ALWAYS ADD THIS
  // ... other filters
});
```

### Employee Dropdown Pattern:
```typescript
{employees
  .filter(emp => !emp.archivedDate) // ⭐ ALWAYS FILTER
  .map((emp, index) => (
    <option key={`emp-${emp.id}-${index}`} value={emp.fullName}>
      {emp.fullName}
    </option>
  ))
}
```

---

## 🔧 JIKA MASALAH MASIH ADA:

1. **Clear browser cache** dan reload
2. **Check database** - ensure archivedDate is set:
   ```sql
   SELECT id, full_name, status, archived_date 
   FROM employees 
   WHERE archived_date IS NOT NULL;
   ```
3. **Check browser console** for any errors
4. **Verify filter logic** in each module file

---

**Last Updated:** 2026-05-19  
**Fixed By:** Claude Code  
**Files Modified:**
- `/src/app/pages/Payslip.tsx`
- `/src/app/pages/AdvancePayment.tsx`
- `/src/app/pages/PayrollProcessing.tsx`
