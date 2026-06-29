URGENT FIX: Rebuild ONLY Advance and Payroll modules workflow correctly.

Do not change router, authentication, sidebar, employee dummy data, or other modules.

Current issue:
Advance and Payroll modules are missing important operational workflow.
Some buttons do not work, selected employee data is incomplete, attendance is not visible properly, and the flow does not match payroll operation requirement.

==================================================
CORE RULE
==================================================

Advance and Payroll modules must NOT be simple payment screens.

They must allow Payroll Admin to:
1. Select employee
2. View attendance details
3. Edit attendance details
4. Recalculate related payment
5. Generate selected payment
6. Preview before confirm
7. Approve selected employee
8. Pay selected employee
9. View PDF-style slip

All inside the same module.

==================================================
APPLY TO BOTH MODULES
==================================================

Apply this to:
- Advance module
- Payroll module

Both modules must have the SAME operational structure.

==================================================
LEFT PANEL
==================================================

Left panel:
- employee list
- checkbox per employee
- select all
- search
- branch filter
- internal scroll only

Each employee row must show:
- employee name
- employee no
- branch
- amount
- current status

When employee is clicked:
- load full data on right panel

When employee is checked:
- selected action workflow becomes active

==================================================
RIGHT PANEL MUST NEVER SHOW EMPTY OR DEFAULT ZERO DATA
==================================================

When employee is selected, right panel must load real synced dummy data.

Do NOT show:
- Attendance 0
- Amount RM0
- Eligibility None

unless the selected employee actually has those values.

==================================================
RIGHT PANEL CONTENT
==================================================

For selected employee, show these sections:

1. Employee Information
- Employee Name
- Employee No
- Branch
- Position
- Month
- Status

2. Attendance Details
Must be visible in Advance and Payroll modules.

Show editable fields:
- Attendance Days
- OT Hours
- Rest Day Hours
- PH Hours
- OT Replacement
- Unpaid Days

Buttons:
- Edit Attendance
- Save Attendance
- Cancel

When Edit Attendance is clicked:
- fields become editable
- show Unsaved Changes badge

When Save Attendance is clicked:
- show confirmation popup
- update Attendance module data
- show Recalculation Required badge

3. Recalculation
After attendance is edited and saved:
- enable Recalculate button
- disable Generate/Approve/Pay until recalculation is completed

After Recalculate:
- update Advance amount
- update Payroll amount
- update Payslip preview
- remove Recalculation Required badge

==================================================
ADVANCE MODULE RIGHT PANEL
==================================================

Advance right panel must show:

- Attendance eligibility
- Advance eligibility
- Advance amount
- Payment date
- Approval status
- Payment status

Action buttons:
- Edit Attendance
- Edit Advance
- Recalculate
- Generate Advance
- Approve Advance
- Pay Advance
- Preview Advance Slip

Every button must work.

Edit Advance must allow:
- advance amount
- payment date
- remarks
- status

Preview Advance Slip must open PDF-style preview.

==================================================
PAYROLL MODULE RIGHT PANEL
==================================================

Payroll right panel must show:

- Basic Salary
- Gross Salary
- EPF
- SOCSO
- SIP
- Advance Deduction
- Unpaid Days Deduction
- Total Deduction
- Net Salary
- Payment status

Action buttons:
- Edit Attendance
- Edit Payroll
- Recalculate
- Generate Payroll
- Approve Payroll
- Finalize Payroll
- Pay Salary
- Preview Payslip

Every button must work.

Edit Payroll must allow:
- manual adjustment
- remarks
- deduction adjustment
- payment method

Preview Payslip must open PDF-style preview.

==================================================
SELECTED EMPLOYEE PROCESSING
==================================================

When one or more employees are checked:

Show selected summary panel:
- number of selected employees
- selected employee names
- total amount
- branch summary
- current status

Show action buttons:

Advance:
- Generate Selected Advance
- Approve Selected
- Pay Selected
- Preview Selected Advance Slip
- Generate Bank Upload File

Payroll:
- Generate Selected Payroll
- Approve Selected
- Finalize Selected
- Pay Selected
- Preview Selected Payslip
- Generate Bank Upload File

Actions must apply ONLY to selected employees.

Do not process all employees unless Select All is checked.

==================================================
PREVIEW BEFORE PROCESS
==================================================

Before any critical action:
- Generate
- Approve
- Finalize
- Pay
- Bank File

Show preview confirmation modal first.

Preview modal must show:
- selected employees
- attendance summary
- amount
- deductions if payroll
- payment date
- total amount

Then user can click:
- Confirm
- Cancel

==================================================
BANK UPLOAD FILE
==================================================

After payment status is Paid:
enable Generate Bank Upload File.

Bank file preview must show:
- Employee No
- Employee Name
- Branch
- Bank Name
- Bank Account No
- Payment Amount
- Payment Type: Advance or Salary
- Payment Date
- Payment Reference
- Status

==================================================
BUTTON FUNCTIONALITY
==================================================

No decorative buttons.

Every button must have working interaction:
- modal
- form
- confirmation
- status update
- toast message
- preview
- PDF view

If an action is not allowed yet:
- keep button visible
- disable it
- show tooltip explaining why

Example:
“Recalculate required before payment.”

==================================================
PDF PREVIEW
==================================================

Advance Slip and Payslip preview must be simple and standard.

Do not make it colourful.

Use:
- black/grey table lines
- A4 layout
- company header
- simple payroll document style
- English labels only
- similar to original Dynamic Guardforce payslip sample

==================================================
SYNC REQUIREMENT
==================================================

All data must sync from the same dummy source.

If attendance is edited in Advance:
- update Attendance module
- update Payroll module
- update Payslip

If attendance is edited in Payroll:
- update Attendance module
- update Advance module
- update Payslip

Do not create isolated placeholder data.

==================================================
FINAL EXPECTATION
==================================================

Advance and Payroll modules must feel like real payroll operation workspaces.

Payroll Admin should be able to complete the workflow without leaving the module:
- view attendance
- edit attendance
- recalculate
- generate
- approve
- pay
- preview slip
- generate bank file