FINAL MODULE FIX PROMPT

Update only these modules:
- Dashboard
- Employees
- Attendance
- Advance
- Payroll

Do not change authentication, logo, dummy employee names, or calculation base.

1. DASHBOARD

Remove these buttons completely:
- Enter Attendance
- Process Advance
- Generate Payroll

Dashboard should be overview only:
- current payroll month
- total employees
- attendance status
- advance status
- payroll status
- total payout
- recent activity

Navigation must use sidebar only.

2. EMPLOYEES

Remove Branch module from sidebar.

Move all Branch Management data and functions into Employees module.

Employees module must include:
- Employee List
- Branch Setup
- Import / Bulk Add
- Employee History

Branch Setup must include:
- View Branch
- Add Branch
- Edit Branch
- Assign Staff
- Staff Count by Branch
- Active / Inactive Branch

All buttons must work:
- Add Employee
- Edit Employee
- Assign Branch
- Import Employees
- Bulk Add
- Bulk Edit
- Bulk Assign Branch
- Export PDF
- Export Excel
- Deactivate Employee

Assign Branch must open modal:
- selected employee(s)
- select branch
- preview affected records
- confirmation popup
- update all related modules after confirm

3. ATTENDANCE

Attendance is the main source data.

Rename “Cycle History” to:
Monthly Attendance

Attendance module must include:
- Create Attendance Month
- Monthly Attendance
- Employee Attendance Preview
- Edit Attendance
- Bulk Edit Attendance
- Print Attendance
- Download PDF
- Export Excel

Default attendance view must be view-only.

Do not show editable input fields until user clicks Edit.

Row actions:
- View Attendance
- Edit Attendance
- Print
- Download PDF
- Lock Attendance

Bulk actions:
- Bulk Edit
- Recalculate Selected
- Export Selected
- Lock Selected

Attendance statuses:
- Draft
- Saved
- Attendance Completed
- Locked

If attendance is changed:
- save required
- recalculation required
- sync Advance
- sync Payroll
- sync Payslip
- sync Dashboard

4. ADVANCE

Advance module must fully work.

Required working controls:
- Month picker
- Branch filter
- Generate Advance
- Approve Advance
- Pay Advance
- Generate Bank File
- Export

Advance flow:
Attendance Completed
→ Generate Advance
→ Preview
→ Confirm Generate
→ Status: Generated
→ Approve Advance
→ Confirm Approve
→ Status: Approved
→ Pay Advance
→ Confirm Payment
→ Status: Paid
→ Generate Bank File
→ Export PDF / Excel / CSV

Advance table columns:
- Checkbox
- Employee
- Branch
- Attendance Summary
- Eligibility
- Advance Amount
- Advance Status
- Payment Status
- Actions

Attendance Summary must be compact:
Days 8 | OT 60h | RD 9h | PH 3h | OTR 0 | Unpaid 2

Actions:
- View Attendance
- Edit Attendance
- Edit Advance
- Generate Advance
- Approve Advance
- Pay Advance
- Preview Advance Slip
- Generate Bank File

Add section:
Paid Advance History

Paid Advance History must allow:
- filter by month
- filter by branch
- filter by employee
- view paid records Jan 2026 to Apr 2026
- print
- download PDF
- export Excel

If attendance is edited inside Advance:
- update Attendance module
- recalculate eligibility
- update advance amount
- update Payroll advance deduction
- update Payslip preview

5. PAYROLL

Payroll layout and action style must match Advance module.

Payroll flow:
Attendance Completed
→ Advance Paid / Recorded
→ Generate Payroll
→ Preview
→ Confirm Generate
→ Status: Generated
→ Approve Payroll
→ Confirm Approve
→ Finalize Payroll
→ Confirm Finalize
→ Pay Salary
→ Confirm Payment
→ Status: Paid
→ Generate Bank File
→ Payslip Available

Payroll table columns:
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

Add section:
Salary Payment History

Salary Payment History must allow:
- filter by month
- filter by branch
- filter by employee
- view paid salary records Jan 2026 to Apr 2026
- print
- download PDF
- export Excel

6. GLOBAL DATA SYNC

All data must use one shared source.

If employee data changes:
sync to Attendance, Advance, Payroll, Payslip, Bank File, Dashboard.

If branch changes:
sync to Employees, Attendance, Advance, Payroll, Payslip, Dashboard.

If attendance changes:
sync to Advance eligibility, Advance amount, Payroll calculation, Payslip preview, Dashboard.

If Advance is paid:
sync to Payroll advance deduction, Employee history, Dashboard, Bank File.

If Salary is paid:
sync to Payslip status, Employee history, Dashboard, Bank File.

7. BUTTON RULES

Every button must work.

If action is not allowed:
- button remains visible
- disabled state
- tooltip explains why

Sensitive actions must show preview + confirmation popup before process:
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

Use professional button labels:
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

8. PDF / EXPORT

All View, Preview, Print, Download, Export actions must open PDF-style preview first.

Documents:
- Advance Slip
- Payslip
- Attendance Report
- Bank Upload Report
- Employee Report

Payslip style:
- English only
- simple black/grey table
- not colourful
- follow original Dynamic Guardforce payslip layout

9. FINAL EXPECTATION

System must feel like real payroll software.

Main process must be clear:
Employee Setup
→ Attendance
→ Advance Payment
→ Payroll Salary
→ Bank File
→ Payslip / Reports

All reviewed modules must have complete dummy data from January 2026 to April 2026.