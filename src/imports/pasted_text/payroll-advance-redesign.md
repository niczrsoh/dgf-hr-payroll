Redesign BOTH Advance and Payroll modules into a professional workspace layout instead of long tables.

Do not change router, authentication, dummy employee data, calculations, or sidebar structure.

==================================================
MAIN LAYOUT CONCEPT
==================================================

Use a split workspace layout:

LEFT PANEL:
Employee List

RIGHT PANEL:
Selected Employee Workspace

The module should feel like:
- enterprise payroll software
- accounting workstation
- HR operation workspace

NOT like a long spreadsheet page.

==================================================
TOP SECTION
==================================================

Keep compact top action bar only:

Advance module:
- Month selector
- Branch selector
- Generate Selected
- Approve Selected
- Pay Selected
- Export

Payroll module:
- Month selector
- Branch selector
- Generate Selected
- Finalize Selected
- Pay Selected
- Export

Do not add large dashboard cards or unnecessary statistics.

==================================================
LEFT PANEL - EMPLOYEE LIST
==================================================

Create a fixed-width employee list panel.

Features:
- searchable
- filter by branch
- checkbox selection
- multi-selection
- select all

Each employee card/list item should show:

Advance module:
- employee name
- branch
- advance amount
- approval/payment status

Payroll module:
- employee name
- branch
- net salary
- payroll status

Employee list must:
- scroll internally only
- fixed height
- page must remain static
- no long full-page scrolling

Selected employee row should highlight clearly.

==================================================
RIGHT PANEL - DETAIL WORKSPACE
==================================================

When user clicks employee from left panel,
load employee details in right workspace panel.

==================================================
ADVANCE WORKSPACE DETAILS
==================================================

Inside right panel show:

1. Employee Information
- employee name
- employee no
- branch
- status

2. Attendance Summary
- attendance days
- OT hours
- rest day hours
- PH hours
- OT replacement
- unpaid days

3. Advance Calculation
- attendance eligibility
- advance eligibility
- advance amount
- payment date

4. Action Buttons
- Edit Attendance
- Edit Advance
- Preview Advance Slip
- Approve
- Pay

==================================================
PAYROLL WORKSPACE DETAILS
==================================================

Inside right panel show:

1. Employee Information
- employee name
- employee no
- branch
- payroll status
- payment status

2. Attendance Summary
- attendance days
- OT hours
- rest day hours
- PH hours
- OT replacement
- unpaid days

3. Payroll Calculation
- basic salary
- gross salary
- EPF
- SOCSO
- SIP
- advance deduction
- other deductions
- net salary

4. Action Buttons
- Edit Attendance
- Edit Payroll
- Preview Payslip
- Finalize
- Pay

==================================================
EDITABLE ATTENDANCE
==================================================

Attendance values must be editable directly inside:
- Advance workspace
- Payroll workspace

Editable fields:
- Attendance Days
- OT Hours
- Rest Day Hours
- PH Hours
- OT Replacement
- Unpaid Days

After editing:
- show Unsaved Changes
- require Save
- require Recalculate
- sync Attendance module
- sync Advance calculation
- sync Payroll calculation
- sync Payslip preview

==================================================
MULTI-SELECTION WORKFLOW
==================================================

Payroll admin must be able to:
- select one employee
- select multiple employees
- select all employees

Selected actions must process only selected employees.

Before processing:
show preview confirmation modal.

==================================================
PDF PREVIEW
==================================================

Preview buttons must open PDF-style preview.

Advance:
- simple advance slip

Payroll:
- standard payslip

Payslip design must follow original Dynamic Guardforce sample:
- simple
- black/grey lines
- professional
- printable
- not colourful

==================================================
SCROLL BEHAVIOUR
==================================================

Very important:
- employee list scrolls internally
- right detail panel scrolls internally if needed
- page layout must remain fixed
- avoid very long page scrolling

==================================================
FINAL EXPECTATION
==================================================

System should feel like a real payroll operation workspace where Payroll Admin can:
- select employee
- review attendance
- edit attendance
- recalculate
- preview slip
- approve payment
- pay employee

all inside one operational workspace without repeatedly changing pages.