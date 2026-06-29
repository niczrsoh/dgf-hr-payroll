UI/UX FIX PROMPT — FOLLOW USER REVIEW EXACTLY

IMPORTANT:
Follow this review exactly.
Do not redesign randomly.
Do not add “coming soon”.
Do not create empty sections.
Do not create placeholder tabs without functions.
All layouts must follow the same professional structure.

CURRENT PROBLEM:
Some modules follow requested layout.
Some modules still ignore previous instructions.
Fix all inconsistencies below.

==================================================
GLOBAL LAYOUT RULE
==================================================

Attendance, Advance, Payroll, and Employees must use SAME layout structure.

Structure:
1. Page title
2. Small description
3. Top summary cards
4. Filter/search/action bar
5. Main table list
6. Action buttons inside table
7. Optional bottom summary/report section

NO separate empty panels.
NO blank white sections.
NO “coming soon”.
NO dead tabs.

Everything visible must work.

==================================================
1. DASHBOARD FIX
==================================================

KEEP current dashboard layout.
Dashboard already acceptable.

ONLY:
- remove unnecessary empty spacing
- ensure all stats sync live
- ensure activity section updates automatically

Do not add new action buttons.

==================================================
2. EMPLOYEES MODULE FIX
==================================================

CURRENT PROBLEM:
- Branch tab still empty
- Import/Bulk Add still empty
- UI still shows “coming soon”
- Layout inconsistent
- Too many unnecessary tab sections

FIX:

REMOVE:
- Branches module from sidebar completely

REMOVE:
- Empty Branch tab
- Empty Import/Bulk Add tab
- “coming soon” text

Instead:
Merge everything into ONE Employees page.

Employees page must contain:

TOP SUMMARY CARDS:
- Total Employees
- Active Employees
- Inactive Employees
- Total Branches
- Staff Per Branch

MAIN ACTION BAR:
- Search
- Branch Filter
- Status Filter
- Add Employee
- Import Employees
- Export Employees

TABLE COLUMNS:
- Checkbox
- Employee
- Branch
- Position
- Bank
- Salary
- Status
- Actions

ACTION BUTTONS:
- View
- Edit
- Assign Branch
- Employee History
- Deactivate

ALL buttons must function.

Assign Branch:
- popup modal
- select branch
- confirm update
- sync all modules

IMPORT EMPLOYEE:
Must function.
Must allow:
- Excel upload
- CSV upload
- Preview before import
- Confirm import popup

Bulk selection:
When checkbox selected:
show floating bulk action bar:
- Bulk Assign Branch
- Bulk Export
- Bulk Deactivate

Do NOT permanently show bulk buttons.

==================================================
3. ATTENDANCE MODULE FIX
==================================================

CURRENT PROBLEM:
- Layout not matching Advance/Payroll
- Attendance Entry button confusing
- No proper action flow
- Missing functions

FIX:

Attendance module must follow SAME table structure as Advance and Payroll.

REMOVE:
- useless Attendance Entry top button

RENAME:
Monthly Attendance → Attendance Records

TOP BAR:
- Search
- Month Picker
- Branch Filter
- Export
- Print

TABLE COLUMNS:
- Checkbox
- Employee
- Branch
- Attendance Days
- OT Hours
- Rest Day
- PH Hours
- OT Replacement
- Unpaid Days
- Status
- Actions

STATUS:
- Draft
- Saved
- Completed
- Locked

ACTION BUTTONS:
- View Attendance
- Edit Attendance
- Save Attendance
- Print
- Download PDF
- Lock Attendance

ALL buttons must function.

When Edit clicked:
- open modal
- editable fields
- preview recalculation
- confirmation popup before save

Bulk Actions:
Only appear after selecting employee(s):
- Bulk Edit
- Bulk Save
- Bulk Lock
- Bulk Export

ALL bulk actions must work.

==================================================
4. ADVANCE MODULE FIX
==================================================

CURRENT PROBLEM:
- Layout partially correct
- Some actions still fake/static
- No proper process flow
- No payment history section
- Button logic inconsistent

KEEP current table style.
Current Advance table is closest to correct.

BUT FIX:

TOP ACTION BAR:
- Month Picker
- Branch Filter
- Generate Advance
- Approve Advance
- Pay Advance
- Bank File
- Export

Buttons must:
- disabled until selection made
- activate after checkbox selected

NO permanent active buttons.

PROCESS FLOW:

Attendance Completed
→ Generate Advance
→ Preview
→ Confirm Generate
→ Status = Generated

Then:
Approve Advance
→ Confirm popup
→ Status = Approved

Then:
Pay Advance
→ Payment popup
→ Payment method
→ Bank reference
→ Status = Paid

Then:
Generate Bank File
→ PDF/Excel/CSV
→ download works

Advance table columns:
- Checkbox
- Employee
- Branch
- Attendance Summary
- Eligibility
- Advance Amount
- Approval Status
- Payment Status
- Actions

Attendance Summary:
KEEP compact tag style.
Current compact style is correct.

DO NOT use vertical summary blocks anymore.

ACTION BUTTONS:
- View
- Edit
- Generate
- Approve
- Pay
- Print Slip
- Download PDF

Bottom section:
REMOVE blue instruction guide section completely.

Replace with:
Advance Payment History

Must contain:
- Month filter
- Employee filter
- Branch filter
- Paid records Jan–Apr 2026
- Print
- Download
- Export

==================================================
5. PAYROLL MODULE FIX
==================================================

CURRENT PROBLEM:
- Still showing blue instruction guide
- Actions not following real payroll flow
- Missing payment history
- Some buttons still static

Payroll layout must EXACTLY mirror Advance layout.

REMOVE:
Blue Payroll Processing Guide section completely.

TOP ACTION BAR:
- Month Picker
- Branch Filter
- Generate Payroll
- Approve Payroll
- Finalize Payroll
- Pay Salary
- Bank File
- Export

Buttons only active after employee selected.

PROCESS FLOW:

Attendance Completed
→ Advance Paid
→ Generate Payroll
→ Preview Payroll
→ Confirm Generate
→ Status = Generated

Then:
Approve Payroll
→ Confirm popup
→ Status = Approved

Then:
Finalize Payroll
→ Lock payroll
→ Status = Finalized

Then:
Pay Salary
→ Payment popup
→ Bank reference
→ Status = Paid

Then:
Generate Bank File
→ export works

TABLE COLUMNS:
- Checkbox
- Employee
- Branch
- Attendance Summary
- Basic Salary
- Gross Salary
- Deduction
- Advance Deduction
- Net Salary
- Payroll Status
- Payment Status
- Actions

ACTION BUTTONS:
- View
- Edit
- Generate
- Approve
- Finalize
- Pay Salary
- Print Payslip
- Download PDF

Bottom section:
Replace removed guide section with:
Salary Payment History

Must include:
- month filter
- employee filter
- branch filter
- paid records Jan–Apr 2026
- print
- download
- export

==================================================
6. BUTTON / ACTION FIX
==================================================

Every visible button must work.

If action unavailable:
- show disabled state
- tooltip explanation

Every sensitive action:
must show confirmation popup.

Popup must show:
- employee count
- selected names
- affected data
- amount
- warning message

Buttons:
- Cancel
- Confirm Action

NO vague labels.

Correct labels:
- Generate Advance
- Approve Advance
- Pay Advance
- Generate Payroll
- Approve Payroll
- Finalize Payroll
- Pay Salary

==================================================
7. DATA SYNC FIX
==================================================

ALL modules must sync automatically.

If attendance edited:
- Advance recalculates
- Payroll recalculates
- Payslip updates

If advance paid:
- Payroll deduction updates
- History updates

If payroll paid:
- Payslip updates
- Dashboard updates

ALL dummy data Jan–Apr 2026 must exist across:
- Attendance
- Advance
- Payroll
- History
- Dashboard

==================================================
8. FINAL UI RULE
==================================================

Do NOT:
- create empty sections
- create fake tabs
- create placeholder text
- create “coming soon”
- create dead buttons

System must feel:
- clean
- compact
- professional
- real payroll system
- consistent across all modules