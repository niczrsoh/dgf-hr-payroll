Update Advance and Payroll modules to include editable attendance detail table inside the module.

Do not change router, authentication, sidebar, or existing data structure.

==================================================
MAIN OBJECTIVE
==================================================

In both Advance module and Payroll module, Payroll Admin must be able to view and edit employee attendance details directly without going to Attendance module.

The attendance data layout should look like the Attendance Entry table:
- Employee
- Branch
- Attendance Days (1st–10th)
- OT Hours
- Rest Day Hours
- PH Hours
- OT Replacement
- Unpaid Days

==================================================
SCROLLABLE ATTENDANCE FRAME
==================================================

Do not make the page long.

Create a fixed-height attendance detail frame inside Advance and Payroll modules.

Frame behaviour:
- show around 4 employee rows at one time
- remaining employees can be viewed by scrolling inside the frame only
- table header must be sticky
- sidebar and page layout must remain static
- no full-page vertical stretching

==================================================
ADVANCE MODULE REQUIREMENT
==================================================

Inside Advance module, add:

1. Attendance Detail Section
   - editable attendance table
   - fixed-height scrollable frame
   - same data as Attendance module
   - edits must sync back to Attendance module

2. Advance Processing Section
   - checkbox per employee
   - select one employee
   - select multiple employees
   - select all eligible employees

3. Buttons:
   - Generate Selected Advance
   - Approve Selected
   - Pay Selected
   - Preview Selected Advance Slip

4. Before Generate Selected Advance:
   show preview modal first.

Preview modal must show:
- selected employees
- branch
- attendance days
- eligibility
- advance amount
- payment date
- total selected amount

Then user can click:
- Confirm Generate
- Cancel

5. Individual row actions:
- View Attendance
- Edit Attendance
- Edit Advance
- Approve
- Pay
- View Advance Slip PDF

==================================================
PAYROLL MODULE REQUIREMENT
==================================================

Inside Payroll module, add:

1. Attendance Detail Section
   - editable attendance table
   - fixed-height scrollable frame
   - show around 4 rows only
   - internal scroll for more rows
   - sticky table header
   - edits sync to Attendance module, Payroll calculation, and Payslip

2. Payroll Processing Section
   - checkbox per employee
   - select one employee
   - select multiple employees
   - select all employees

3. Buttons:
   - Generate Selected Payroll
   - Recalculate Selected
   - Approve Selected
   - Finalize Selected
   - Pay Selected
   - Preview Selected Payslip

4. Before Generate Selected Payroll:
   show preview modal first.

Preview modal must show:
- selected employees
- branch
- basic salary
- attendance summary
- earnings
- deductions
- advance deduction
- unpaid days
- net salary
- total payout

Then user can click:
- Confirm Generate
- Cancel

5. Individual row actions:
- View Attendance
- Edit Attendance
- Edit Payroll
- Recalculate
- Approve
- Finalize
- Pay
- View Payslip PDF

==================================================
PAYROLL SELECTION FLOW
==================================================

Payroll Admin must be able to pay salary manually by selection:

Example:
- tick 1 employee → generate payroll only for that employee
- tick 3 employees → generate payroll only for selected employees
- tick all → generate payroll for all selected employees

Do not force all employees to be processed at once.

==================================================
PDF / PAYSLIP STYLE
==================================================

Payslip preview must be simple and standard.

Do not make payslip colourful.

Payslip must closely follow the original provided Dynamic Guardforce payslip sample:
- black/grey table lines
- simple layout
- company header
- earnings column
- deductions column
- employer contribution column
- working days section
- net salary bottom right
- clean printable format

Use English labels only.

==================================================
SYNC REQUIREMENT
==================================================

When attendance is edited in Advance or Payroll module:
- update Attendance module
- update Advance eligibility
- update Advance amount
- update Payroll calculation
- update Payslip preview

==================================================
IMPORTANT
==================================================

Do not create separate unrelated attendance data.

All attendance data must come from the same dummy employee records.

Keep existing dummy payroll values and employee names.
Only improve module layout, editable attendance view, selected processing, and preview-before-generate workflow.