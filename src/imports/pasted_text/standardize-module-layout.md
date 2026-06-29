Standardize Employees, Attendance, Advance, and Payroll modules using the same workspace layout pattern.

Do not change router, authentication, sidebar, dummy data, or calculation logic.

==================================================
MAIN ISSUE
==================================================

Current modules use different layouts.
Attendance currently shows editable input table immediately, which is risky because user may accidentally change data.

All operational modules should use the same consistent layout style.

Apply same layout to:
- Employees
- Attendance
- Advance
- Payroll

==================================================
STANDARD WORKSPACE LAYOUT
==================================================

Use this layout for all 4 modules:

LEFT PANEL:
Employee List

RIGHT PANEL:
Selected Employee Workspace

Top section:
- Month picker where relevant
- Branch filter
- Search
- selected action buttons

==================================================
LEFT PANEL REQUIREMENT
==================================================

Left panel must show:
- employee list
- employee name
- employee no
- branch
- status/summary
- checkbox
- select all
- internal scroll

Click employee:
- open employee detail in right panel

Tick checkbox:
- enable selected/bulk actions

==================================================
RIGHT PANEL REQUIREMENT
==================================================

Right panel must show details based on selected employee or selected employees.

If no employee selected:
- show instruction panel
- action buttons visible but disabled

If one employee selected:
- show individual detail workspace

If multiple employees selected:
- show batch workspace for selected employees only

==================================================
ATTENDANCE MODULE BEHAVIOUR
==================================================

Attendance must NOT show editable input table immediately.

Default view should be safe view-only mode.

When employee selected:
show Attendance Summary in view-only mode:
- Attendance Days
- OT Hours
- Rest Day Hours
- PH Hours
- OT Replacement
- Unpaid Days
- Eligibility Indicator

Action buttons:
- View Attendance
- Edit Attendance
- Save Attendance
- Cancel
- Recalculate Related Payroll

Edit Attendance:
- only when user clicks Edit Attendance
- then fields become editable
- Save button appears/enabled
- Cancel restores previous values

Multiple selection:
- show selected employees attendance table in view-only mode first
- Edit Selected Attendance button enables editing for selected employees only
- Save Selected Attendance button saves changes
- Recalculate Selected button updates Advance and Payroll

Do not allow accidental typing/editing without pressing Edit first.

==================================================
EMPLOYEE MODULE BEHAVIOUR
==================================================

Employees module must use same workspace layout.

Left panel:
- employee list
- branch filter
- status

Right panel:
- Employee Profile
- Branch Assignment
- Payroll History
- Attendance History
- Advance History
- Payslip History

Actions:
- Add Employee
- Edit Employee
- Assign Branch
- View Payroll History
- Deactivate Employee

==================================================
ADVANCE MODULE BEHAVIOUR
==================================================

Advance module must use same workspace layout.

Right panel must include:
- Employee Information
- Attendance Summary view-only by default
- Edit Attendance button
- Advance Calculation
- Payment Status
- Advance Slip Preview

Actions:
- Edit Attendance
- Edit Advance
- Generate Advance
- Approve Advance
- Pay Advance
- Preview Advance Slip
- Bank File

Multiple selection:
- Generate Selected
- Approve Selected
- Pay Selected
- Generate Bank File

==================================================
PAYROLL MODULE BEHAVIOUR
==================================================

Payroll module must use same workspace layout.

Right panel must include:
- Employee Information
- Attendance Summary view-only by default
- Edit Attendance button
- Payroll Calculation
- Payment Status
- Payslip Preview

Actions:
- Edit Attendance
- Edit Payroll
- Generate Payroll
- Approve Payroll
- Finalize Payroll
- Pay Salary
- Preview Payslip
- Bank File

Multiple selection:
- Generate Selected
- Approve Selected
- Finalize Selected
- Pay Selected
- Generate Bank File

==================================================
BUTTON CONSISTENCY
==================================================

Use consistent action pattern across all modules:

View
Edit
Save
Cancel
Recalculate
Generate
Approve
Pay
Preview
Export / Bank File

If action is not available:
- keep button visible
- disable it
- show tooltip explaining why

==================================================
DATA SYNC
==================================================

All modules must use same shared data.

If attendance is edited in:
- Attendance module
- Advance module
- Payroll module

It must sync to:
- Attendance
- Advance
- Payroll
- Payslip
- Bank File

==================================================
SAFETY RULE
==================================================

No direct editable input table by default.

All sensitive fields must be view-only until user clicks Edit.

After edit:
- show Unsaved Changes
- require Save
- require Recalculate
- then allow Generate/Approve/Pay

==================================================
FINAL EXPECTATION
==================================================

The system should feel consistent and professional.

Employees, Attendance, Advance, and Payroll should look like one connected system, not separate unrelated pages.

The workflow must be easy for Payroll Admin:
select employee → view data → edit only when needed → save → recalculate → generate/approve/pay.