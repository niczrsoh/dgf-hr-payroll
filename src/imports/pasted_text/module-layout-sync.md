STANDARDIZE ALL OPERATIONAL MODULES LAYOUT AND SYNC WORKFLOW

Do not change router, authentication, sidebar, dummy data, logo, or existing calculation base.

==================================================
MAIN REQUIREMENT
==================================================

Employees, Attendance, Advance, and Payroll modules must use the SAME table-based layout pattern.

Client prefers the staff list/table layout, not split workspace.

Apply same layout style to:
- Employees
- Attendance
- Advance
- Payroll

Only the module functions/actions are different.

==================================================
STANDARD MODULE LAYOUT
==================================================

Each module must have:

1. Page header
2. Month picker where relevant
3. Branch filter
4. Search field
5. Full staff table/list
6. Checkbox selection
7. Bulk action buttons
8. Row action buttons
9. Fixed-height table frame
10. Sticky table header
11. Internal table scroll only

Table should show around 5 staff rows.
Remaining rows scroll inside the table frame.
Do not stretch page endlessly downward.

==================================================
EMPLOYEES MODULE
==================================================

Employees module must follow the same table layout.

Columns:
- Checkbox
- Employee
- Branch
- Position
- Bank
- Basic Salary
- Status
- Actions

Actions:
- View Employee
- Edit Employee
- Assign Branch
- Payroll History
- Deactivate Employee

Bulk actions:
- Bulk Add Employees
- Bulk Import Employees
- Bulk Assign Branch
- Bulk Activate
- Bulk Deactivate
- Export Selected

Any employee edit must sync to:
- Attendance
- Advance
- Payroll
- Payslip
- Bank File
- Branch
- Dashboard

==================================================
ATTENDANCE MODULE
==================================================

Attendance module must follow the same table layout.

Important:
Do NOT show editable input fields immediately by default.

Default mode:
View-only attendance table.

Columns:
- Checkbox
- Employee
- Branch
- Attendance Days
- OT Hours
- Rest Day Hours
- PH Hours
- OT Replacement
- Unpaid Days
- Status
- Actions

Actions:
- View Attendance
- Edit Attendance
- Save Attendance
- Recalculate
- Lock Attendance Cycle
- Export Attendance PDF

When Edit Attendance is clicked:
- only selected row becomes editable
- fields are pre-filled with current data
- user can change attendance data
- unchanged fields must remain unchanged
- Save Attendance required
- Recalculate required after save

Bulk actions:
- Bulk Edit Attendance
- Bulk Save Attendance
- Recalculate Selected
- Export Selected

Attendance status:
- Draft
- Saved
- Attendance Completed
- Locked

==================================================
ATTENDANCE IS MAIN SOURCE DATA
==================================================

The payroll process must start from attendance.

Correct workflow:
1. Create Attendance Cycle
2. Key in / Edit Attendance
3. Save Attendance
4. Recalculate
5. Attendance Completed
6. Advance can be generated
7. Payroll can be generated

If attendance cycle does not exist:
Advance and Payroll must show warning:
“Attendance cycle has not been created for this month.”

If attendance is not saved/completed:
Disable Generate Advance and Generate Payroll.

Tooltip:
“Complete attendance first.”

==================================================
ADVANCE MODULE
==================================================

Advance module must follow the same table layout.

Columns:
- Checkbox
- Employee
- Branch
- Attendance Summary
- Eligibility
- Advance Amount
- Advance Status
- Payment Status
- Actions

Attendance Summary must show:
- Attendance Days
- OT Hours
- Rest Day Hours
- PH Hours
- OT Replacement
- Unpaid Days

Actions:
- View Attendance
- Edit Attendance
- Edit Advance
- Generate Advance
- Approve Advance
- Pay Advance
- Preview Advance Slip
- Generate Bank File

Bulk actions:
- Generate Selected Advance
- Approve Selected
- Pay Selected
- Generate Bank File
- Export Selected

Advance rules:
- 7–10 attendance days = Full Advance RM400
- 5–6 attendance days = Half Advance RM250
- 0–4 attendance days = No Advance RM0

Advance status:
- Not Generated
- Generated
- Approved
- Paid
- Bank File Generated

Advance payment date:
- 20th of current payroll month
- keep editable in settings if needed

After Pay Advance:
- payment status becomes Paid
- payment reference is generated
- advance deduction must sync to Payroll module

==================================================
PAYROLL MODULE
==================================================

Payroll module must follow the same table layout.

Columns:
- Checkbox
- Employee
- Branch
- Attendance Summary
- Basic Salary
- Gross Salary
- Total Deduction
- Advance Deduction
- Net Salary
- Payroll Status
- Payment Status
- Actions

Attendance Summary must show:
- Attendance Days
- OT Hours
- Rest Day Hours
- PH Hours
- OT Replacement
- Unpaid Days

Actions:
- View Attendance
- Edit Attendance
- Edit Payroll
- Generate Payroll
- Approve Payroll
- Finalize Payroll
- Pay Salary
- Preview Payslip
- Generate Bank File

Bulk actions:
- Generate Selected Payroll
- Approve Selected
- Finalize Selected
- Pay Selected
- Generate Bank File
- Export Selected

Payroll status:
- Draft
- Generated
- Approved
- Finalized
- Paid
- Bank File Generated

Salary payment date:
- 7th of following month

Example:
April 2026 payroll salary payment date = 7th May 2026

Basic salary:
- Static Guard basic salary remains RM1700
- Do not reduce displayed basic salary
- incomplete attendance goes to Unpaid Days deduction

After Pay Salary:
- payment status becomes Paid
- payment reference is generated
- payslip becomes available
- bank file can be generated

==================================================
DATA SYNC REQUIREMENT
==================================================

All data must use one shared source.

If data is edited in any module, it must sync everywhere.

Examples:

If employee branch is edited:
- Employees
- Attendance
- Advance
- Payroll
- Payslip
- Bank File
- Dashboard

If attendance is edited:
- Attendance
- Advance eligibility
- Advance amount
- Payroll calculation
- Payslip preview
- Dashboard summary

If advance is paid:
- Advance status updates
- Payroll advance deduction updates
- Employee history updates
- Dashboard updates

If salary is paid:
- Payroll status updates
- Payslip status updates
- Bank file readiness updates
- Dashboard updates

==================================================
EDITING RULE
==================================================

When editing one field, do not reset other fields.

Use partial update / merge update logic.

Correct:
Update only changed field and preserve other values.

Incorrect:
Reset unchanged fields to 0 or blank.

==================================================
SENSITIVE ACTION CONFIRMATION
==================================================

All sensitive actions must show preview and confirmation popup before processing.

Apply to:
- Save Attendance
- Recalculate
- Generate Advance
- Approve Advance
- Pay Advance
- Generate Payroll
- Approve Payroll
- Finalize Payroll
- Pay Salary
- Generate Bank File
- Bulk Edit
- Bulk Save
- Bulk Import
- Bulk Export
- Deactivate Employee
- Save Settings

Popup must show:
- selected employee(s)
- action type
- affected data
- total amount if payment-related
- warning message
- Cancel button
- action-specific confirm button

Button examples:
- Yes, Generate Advance
- Yes, Approve Advance
- Yes, Pay Advance
- Yes, Generate Payroll
- Yes, Finalize Payroll
- Yes, Pay Salary
- Yes, Generate Bank File

Do not use vague labels like:
- Confirm Generate
- Process
- Submit

==================================================
BANK FILE RULE
==================================================

Generate Bank File only after records are Paid.

If not Paid:
disable button and show tooltip:
“Only paid records can generate bank file.”

Bank file preview must show:
- Employee No
- Employee Name
- Branch
- Bank Name
- Bank Account No
- Payment Type
- Payment Amount
- Payment Date
- Payment Reference
- Status

==================================================
PDF PREVIEW RULE
==================================================

All View / Preview / Export documents must open PDF-style preview.

Advance:
- Advance Slip PDF

Payroll:
- Payslip PDF

Payslips:
- Payslip archive PDF

Bank File:
- Bank Upload PDF / CSV / Excel preview

Payslip design:
- English labels only
- simple black/grey table
- not colourful
- follow original Dynamic Guardforce payslip style

==================================================
BUTTON NAMING CONSISTENCY
==================================================

Use professional button names.

Advance:
- Generate Advance
- Approve Advance
- Pay Advance

Payroll:
- Generate Payroll
- Approve Payroll
- Finalize Payroll
- Pay Salary

Attendance:
- Save Attendance
- Recalculate
- Lock Attendance Cycle

Bank:
- Generate Bank File
- Export Bank File

==================================================
FINAL EXPECTATION
==================================================

All main modules must look consistent.

Employees, Attendance, Advance, and Payroll should have the same view style:
- staff table
- checkbox
- action buttons
- fixed scroll frame
- row actions
- bulk actions

The process must be clear:
Attendance first
→ Advance payment
→ Payroll salary
→ Bank file
→ Payslip / report