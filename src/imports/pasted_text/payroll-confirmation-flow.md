CRITICAL ACTION BUTTON + CONFIRMATION FLOW FIX

Fix all sensitive process actions across the payroll system.

Current issue:
Many important buttons directly execute actions without proper confirmation flow, causing confusion and unsafe payroll operations.

The system must behave like a real enterprise payroll system.

==================================================
MAIN RULE
==================================================

ALL sensitive payroll actions MUST require:

1. Preview Screen
2. Warning / Confirmation Popup
3. Explicit confirmation button
4. Success notification after completion

No direct execution allowed.

==================================================
REMOVE CONFUSING BUTTON NAMES
==================================================

Current naming like:
- Generate
- Confirm Generate
- Process
- Submit

is too generic and confusing.

Replace button labels with action-specific names.

==================================================
CORRECT BUTTON TERMINOLOGY
==================================================

ADVANCE MODULE

Before approval:
- Generate Advance

After generated:
- Approve Advance

After approved:
- Pay Advance

After payment:
- Generate Bank File

==================================================
PAYROLL MODULE

Before calculation:
- Generate Payroll

After generated:
- Approve Payroll

After approved:
- Finalize Payroll

After finalized:
- Pay Salary

After payment:
- Generate Bank File

==================================================
ATTENDANCE MODULE

- Save Attendance
- Recalculate Payroll
- Lock Attendance Cycle

==================================================
BANK MODULE

- Generate Bank File
- Export Bank File
- Download Bank File

==================================================
REMOVE WRONG BUTTON LABELS
==================================================

DO NOT USE:
- Confirm Generate
- Process
- Submit Payroll
- Submit Advance
- Continue

Use action-specific wording instead.

==================================================
PROPER ENTERPRISE FLOW
==================================================

EXAMPLE:
ADVANCE FLOW

STEP 1
User clicks:
Generate Advance

STEP 2
Show Preview Modal

TITLE:
Advance Payment Preview

CONTENT:
- Selected employees
- Attendance summary
- Eligibility
- Payment amount
- Total payout
- Payment date

BOTTOM WARNING:
“This process will generate advance payment records for selected employees.”

BUTTONS:
- Cancel
- Continue

==================================================
STEP 3
SECOND CONFIRMATION POPUP

TITLE:
Confirm Advance Generation

MESSAGE:
“Are you sure you want to generate advance payments for 6 employees?”

WARNING BOX:
“This action will create official advance payment records.”

BUTTONS:
- No, Cancel
- Yes, Generate Advance

==================================================
STEP 4
SUCCESS MESSAGE

“Advance payments generated successfully.”

==================================================
PAYMENT FLOW FIX
==================================================

Current system directly processes payment.

This is incorrect.

==================================================
CORRECT FLOW:
==================================================

User clicks:
Pay Advance

OR

Pay Salary

==================================================
SHOW PAYMENT PREVIEW
==================================================

Preview:
- Employee list
- Total payout
- Payment method
- Payment date
- Bank status
- Branch
- Reference number

==================================================
THEN SHOW FINAL WARNING POPUP
==================================================

TITLE:
Confirm Payment

MESSAGE:
“You are about to process official salary payments.”

WARNING BOX:
- This action affects payroll records
- Payment status will be updated
- Bank upload process will become available

BUTTONS:
- No, Cancel
- Yes, Proceed Payment

==================================================
BANK FILE FLOW
==================================================

User clicks:
Generate Bank File

Show popup:

TITLE:
Generate Bank Upload File

MESSAGE:
“This will generate a bank transfer file for paid employees only.”

SHOW:
- Total employees
- Total amount
- Payment batch reference
- Bank format type

BUTTONS:
- Cancel
- Generate File

==================================================
DELETE / RESET WARNING
==================================================

All delete/reset actions require RED warning popup.

Examples:
- Delete payroll
- Reset attendance
- Remove bank file
- Cancel payment

==================================================
WARNING DESIGN STANDARD
==================================================

Use:
- warning icon
- yellow/red alert box
- bold warning text
- clear irreversible notice

==================================================
BUTTON COLOR STANDARD
==================================================

SAFE ACTION:
Blue

SAVE:
Blue

APPROVAL:
Green

PAYMENT:
Dark Green

DELETE:
Red

BANK FILE:
Purple

CANCEL:
Grey

==================================================
GLOBAL CONFIRMATION STANDARD
==================================================

All confirmation popups MUST use ONLY:

LEFT BUTTON:
Cancel

RIGHT BUTTON:
Action-specific confirm

Examples:
- Yes, Generate Advance
- Yes, Approve Payroll
- Yes, Finalize Payroll
- Yes, Process Payment
- Yes, Generate Bank File

==================================================
FINAL EXPECTATION
==================================================

The payroll system must feel:
- professional
- safe
- enterprise-grade
- finance-compliant
- HR operational standard

Every sensitive action must:
- explain what will happen
- show preview
- require confirmation
- provide clear success feedback

No action should execute immediately after single click.