# Employee Archive & Date-Based Filtering Guide

## Overview

The payroll system now includes employee archival functionality and date-based filtering to prevent retroactive data sync and keep archived employees separate from active operations.

## Key Features

### 1. **Employee Creation Date Tracking**
Every employee now has a `createdDate` field that records when they were added to the system.

**Behavior:**
- New employees automatically get `createdDate` set to the current date
- Employees only appear in data for months **on or after** their creation date
- Prevents confusion from employees appearing in historical months before they joined

**Example:**
- Employee added on `2026-05-15`
- ✅ Will appear in May 2026 attendance/payroll
- ✅ Will appear in June 2026 and future months  
- ❌ Will NOT appear in April 2026 or earlier months

### 2. **Employee Archival System**
Archive employees who have left or are no longer active, separate from the "Inactive" status.

**Archive Icon:**
- Located in the employee actions column (Archive icon)
- Clicking opens a confirmation dialog
- Sets `archivedDate` to current date and status to "Inactive"

**What Happens When You Archive:**
- Employee is removed from ALL active employee lists
- No longer appears in:
  - Employee Management dashboard
  - Attendance Entry dropdowns
  - Advance Payment lists
  - Payroll Processing lists
  - Quick Search results
  - Statistics and reports
- Data is preserved in the database but hidden from normal operations

### 3. **Inactive vs Archived**

| Status | Visibility | Use Case |
|--------|-----------|----------|
| **Inactive** | Still appears in lists, marked as "Inactive" | Temporarily unavailable employee (on leave, suspended) |
| **Archived** | Hidden from all lists and modules | Permanently left the company, no longer employed |

## How It Works Across Modules

### Employee Management
```
Filter: excludes archived employees (archivedDate is set)
Statistics: only count non-archived employees
Actions: Archive icon available for all employees
```

### Attendance Entry
```
When creating attendance cycle for a month:
- Only includes employees with createdDate <= month date
- Excludes all archived employees
```

### Advance Payment
```
Employee list filtered by:
- Not archived (archivedDate is null)
- Created on or before selected month
```

### Payroll Processing
```
Employee list filtered by:
- Not archived (archivedDate is null)  
- Created on or before selected month
```

### Dashboard Statistics
```
Active Employees: counts only non-archived employees with status = 'Active'
```

## Database Setup

If you're using Supabase, run this migration to add the new columns:

```bash
# In Supabase SQL Editor, run:
/workspaces/default/code/add-employee-archive-columns.sql
```

This will:
1. Add `created_date` column to employees table
2. Add `archived_date` column to employees table
3. Create indexes for faster filtering
4. Set default `created_date` for existing employees to '2025-12-01'

## Usage Examples

### Archive an Employee
1. Go to Employee Management
2. Find the employee you want to archive
3. Click the Archive icon (box with arrow)
4. Confirm in the dialog
5. Employee disappears from all active lists

### Add a New Employee (Current Month)
1. Click "Add Employee"
2. Fill in details
3. Save
4. `createdDate` is automatically set to today
5. Employee appears in current month and future months only

### View Archived Employees
Currently, archived employees are hidden from the UI. To view them, you would need to:
- Query the database directly
- Filter where `archived_date IS NOT NULL`

(Future feature: Add "Show Archived" toggle to Employee Management)

## Best Practices

1. **Use "Inactive" for temporary status changes**
   - Employee on medical leave → Inactive
   - Employee suspended → Inactive
   - Can be reactivated later

2. **Use "Archive" for permanent separations**
   - Employee resigned → Archive
   - Employee terminated → Archive
   - Should not appear in day-to-day operations

3. **Don't delete employees**
   - Archiving preserves historical data
   - Allows reporting on past payrolls
   - Maintains data integrity

4. **Review archives periodically**
   - Keep database clean
   - Ensure proper record keeping
   - Comply with data retention policies

## Technical Implementation

### Context Functions
```typescript
// Archive an employee
archiveEmployee(employeeId: string)
// Sets archivedDate to current date and status to 'Inactive'

// Add employee (auto-sets createdDate)
addEmployee(employee: Employee)
// Automatically adds createdDate = today
```

### Filter Logic
```typescript
// Exclude archived employees
employees.filter(e => !e.archivedDate)

// Only show for valid months
employees.filter(e => 
  !e.archivedDate && 
  (!e.createdDate || e.createdDate <= selectedMonth + '-01')
)
```

## Migration Notes

### Existing Employees
All existing employees in the system have been given `createdDate = '2025-12-01'` so they appear in all months (Jan 2026 onwards).

### Database Compatibility
The system works with or without these columns in the database:
- If columns don't exist, features gracefully degrade
- Local state still enforces filtering
- Recommended to run migration for persistence

## Troubleshooting

**Problem:** Employee doesn't appear in attendance for a month

**Solution:** Check that `createdDate` is on or before that month

---

**Problem:** Archived employee still appearing

**Solution:** Verify `archivedDate` is set in database and refresh the page

---

**Problem:** Can't see archived employees

**Solution:** This is by design. Query database directly or add "Show Archived" filter (future feature)

## Future Enhancements

Potential improvements:
- [ ] "Show Archived" toggle in Employee Management
- [ ] Unarchive functionality
- [ ] Archived employees report
- [ ] Archive reason field
- [ ] Bulk archive operations
- [ ] Auto-archive after X months inactive

## Summary

The new archival and date-tracking system provides:
✅ Clean separation of active vs. left employees  
✅ Prevents new employees from appearing in old months  
✅ Maintains data integrity and historical records  
✅ Simplifies day-to-day operations by hiding irrelevant employees  
✅ Flexible status management (Inactive vs Archived)
