# ✅ PROPER PAYROLL WORKFLOW - COMPLETE GUIDE

**Last Updated:** 2026-05-19  
**Version:** 2.0 - After Comprehensive Flow Fix

---

## 🎯 **OVERVIEW: THE CORRECT SEQUENCE**

```
┌──────────────┐
│ 1. ATTENDANCE│ → Create/Edit attendance data
│    ENTRY     │   Save & Recalculate (generates advances + payroll)
└──────┬───────┘
       │
       v
┌──────────────┐
│ 2. ADVANCE   │ → Generate → Approve → Pay → Bank File
│    PAYMENT   │   (Based on attendance days 1st-10th)
└──────┬───────┘
       │
       v
┌──────────────┐
│ 3. PAYROLL   │ → Generate → Finalize → Pay → Bank File
│   PROCESSING │   (Full month salary - advance deduction)
└──────┬───────┘
       │
       v
┌──────────────┐
│ 4. PAYSLIP   │ → View/Print/Download payslips (Read-only)
└──────────────┘
```

---

## 📋 **MODULE 1: ATTENDANCE ENTRY**

### **Purpose:**
Record employee working hours, OT, unpaid leave, etc.

### **Action Buttons:**
| Button | Action | When Enabled | What It Does |
|--------|--------|--------------|--------------|
| **Edit** (individual) | Edit single employee attendance | Always | Opens modal to edit attendance fields |
| **Bulk Edit** | Edit multiple employees | When employees selected | Opens modal to edit multiple at once |
| **Save Attendance** | Save changes | After editing | Saves to database, sets `needsRecalculation = true` |
| **Recalculate Now** | Trigger recalculation | When `needsRecalculation = true` | Calls `generateAdvances()` then `generatePayroll()` |

### **Status Flow:**
```
No Status (Just attendance data)
└─> Triggers recalculation flag when edited
```

### **✅ PROPER WORKFLOW:**

**Step 1: Enter/Edit Attendance**
```typescript
1. Select month (e.g., "May 2026")
2. Click "Edit" icon for employee
3. Input:
   - Attendance Days (1-31)
   - OT Hours
   - Rest Day Hours
   - Public Holiday Hours
   - OT Replacement
   - Unpaid Days
4. Click "Save Attendance"
   → Attendance saved to database
   → needsRecalculation = true
```

**Step 2: Recalculate**
```typescript
5. Warning appears: "Attendance data has changed. Recalculation required"
6. Click "Recalculate Now"
   → Step 2a: generateAdvances(month, true)
      - Calculate Full/Half/None eligibility
      - Create/update advance records
   → Step 2b: generatePayroll(month)
      - Calculate gross salary
      - Deduct advance amounts
      - Calculate net salary
7. needsRecalculation = false
```

### **⚠️ CRITICAL FIX:**
**BEFORE (BROKEN):**
```typescript
const confirmRecalculate = () => {
  generatePayroll(selectedMonth); // ❌ SKIPS ADVANCES!
};
```

**AFTER (FIXED):**
```typescript
const confirmRecalculate = () => {
  generateAdvances(selectedMonth, true); // ✅ First advances
  generatePayroll(selectedMonth);         // ✅ Then payroll
};
```

---

## 📋 **MODULE 2: ADVANCE PAYMENT**

### **Purpose:**
Calculate and pay employee advance based on first 10 days attendance.

### **Action Buttons:** *(Now properly ordered)*
| Button | Action | When Enabled | Status Required |
|--------|--------|--------------|-----------------|
| **Generate Advances** | Create advance records | Employees selected | Any |
| **Approve Advance** | Approve for payment | Employees selected, no recalc needed | Generated or Not Generated |
| **Pay Advance** | Process payment | Employees selected, no recalc needed | Approved |
| **Edit Attendance** | Modify attendance | Employees selected | Any (but locks after Paid) |

### **Status Flow:**
```
Not Generated
  ↓ (Click "Generate Advances" or auto-generate on approve)
Generated (eligible amount calculated)
  ↓ (Click "Approve Advance")
Approved (ready for payment)
  ↓ (Click "Pay Advance")
Paid (payment processed)
  ↓ (Generate bank file)
Bank File Generated
```

### **Eligibility Rules:**
```
Attendance Days 1-10:
- 7+ days = Full Advance (RM 400)
- 5-6 days = Half Advance (RM 250)
- <5 days = None (RM 0)
```

### **✅ PROPER WORKFLOW:**

**Option A: Manual Generation**
```typescript
1. Select month
2. Select employees (checkbox)
3. Click "Generate Advances"
   → Preview shows eligibility calculations
4. Confirm generation
   → Status: Not Generated → Generated
5. Click "Approve Advance"
   → Preview shows approved amounts
6. Confirm approve
   → Status: Generated → Approved
7. Click "Pay Advance"
   → Confirm payment
   → Status: Approved → Paid
```

**Option B: Auto-Generation (Old Flow - Still Works)**
```typescript
1. Select employees
2. Click "Approve Advance" directly
   → Auto-generates if not generated
   → Auto-approves
   → Status: Not Generated → Approved
3. Click "Pay Advance"
   → Status: Approved → Paid
```

### **Individual Row Actions:**
| Icon | Action | Status Required |
|------|--------|-----------------|
| ✏️ Edit | Edit attendance | Any (locked if Paid) |
| 👁️ View | Preview advance slip | Any |
| ✓ Approve | Individual approve | Generated or Not Generated |
| $ Pay | Individual payment | Approved |

---

## 📋 **MODULE 3: PAYROLL PROCESSING**

### **Purpose:**
Calculate and pay full month salary with statutory deductions.

### **Action Buttons:** *(Now properly ordered)*
| Button | Action | When Enabled | Status Required |
|--------|--------|--------------|-----------------|
| **Generate Payroll** | Create payroll records | Employees selected | Any |
| **Finalize Payroll** | Lock calculations | Employees selected, no recalc needed | Draft or Generated |
| **Pay Salary** | Process payment | Employees selected, no recalc needed | Finalized |
| **Edit Attendance** | Modify attendance | Employees selected | Any (but locks after Paid) |

### **Status Flow:**
```
Not Generated
  ↓ (Click "Generate Payroll" or auto-generate on finalize)
Draft/Generated (calculations completed)
  ↓ (Click "Finalize Payroll")
Finalized (locked, ready for payment)
  ↓ (Click "Pay Salary")
Paid (payment processed)
  ↓ (Generate bank file)
Bank File Generated
```

### **Payroll Calculation:**
```
Gross Earnings = Basic Salary + OT Pay + RD Pay + PH Pay
Total Deductions = EPF(employee) + SOCSO(employee) + SIP(employee) + Advance Deduction + Salary Deduction
Net Salary = Gross Earnings - Total Deductions
```

### **✅ PROPER WORKFLOW:**

**Step 1: Generate Payroll**
```typescript
1. Select month
2. Select employees (checkbox)
3. Click "Generate Payroll"
   → Preview shows salary calculations
   → Includes:
     - Gross earnings
     - EPF/SOCSO/SIP contributions
     - Advance deduction (from Advance Payment module)
     - Net salary
4. Confirm generation
   → Status: Not Generated → Draft
```

**Step 2: Finalize**
```typescript
5. Review calculations
6. Click "Finalize Payroll"
   → Locks the calculations
   → Status: Draft → Finalized
```

**Step 3: Pay**
```typescript
7. Click "Pay Salary"
   → Confirm payment
   → Status: Finalized → Paid
```

**Step 4: Bank File (Optional)**
```typescript
8. Select paid employees
9. Click "Generate Bank Upload"
   → Creates CSV/Excel for bank transfer
   → Status: Paid → Bank File Generated
```

### **Individual Row Actions:**
| Icon | Action | Status Required |
|------|--------|-----------------|
| ✏️ Edit Attendance | Edit attendance | Any (locked if Paid) |
| 👁️ View | Preview payslip | Any |
| ✓ Finalize | Individual finalize | Draft |
| $ Pay | Individual payment | Finalized |

---

## 📋 **MODULE 4: PAYSLIP**

### **Purpose:**
View, print, and download employee payslips (Read-only).

### **Action Buttons:**
| Button | Action | What It Does |
|--------|--------|--------------|
| **View** (👁️) | View payslip | Opens preview modal with full details |
| **Print** (🖨️) | Print preview | Opens print dialog |
| **Download** (⬇️) | Download PDF | Generates PDF file |
| **Bulk Export** | Export multiple | Exports all filtered payslips |

### **Status Filter:**
```
All statuses from Payroll Processing:
- Generated
- Finalized  
- Paid
- Bank File Generated
```

### **✅ PROPER WORKFLOW:**

```typescript
1. Select filters:
   - Month (default: ALL)
   - Year (default: 2026)
   - Branch (default: ALL)
2. Search by employee name/number
3. Click "View" icon → Preview payslip details
4. Click "Print" icon → Print payslip
5. Click "Download" icon → Save as PDF
6. Click "Bulk Export" → Export all filtered payslips
```

### **Payslip Contains:**
- Employee information
- Gross earnings breakdown
- Deductions breakdown (EPF, SOCSO, SIP, Advance)
- Employer contributions (EPF, SOCSO, SIP)
- Net salary
- Payment reference

---

## 🔄 **CROSS-MODULE DATA FLOW**

### **How Modules Interact:**

```
ATTENDANCE DATA
    ↓
    ├──> ADVANCE PAYMENT (uses days 1-10)
    │    ├─> Calculates eligibility
    │    └─> Stores advance amount
    │
    └──> PAYROLL PROCESSING (uses full month)
         ├─> Reads advance amount
         ├─> Calculates gross salary
         ├─> Deducts advance
         └─> Calculates net salary
              ↓
         PAYSLIP (displays final payslip)
```

### **Critical Dependencies:**

1. **Attendance → Advance:**
   - Advance eligibility depends on attendance days
   - Changes to attendance MUST recalculate advances

2. **Advance → Payroll:**
   - Payroll deducts advance amount
   - Changes to advance MUST recalculate payroll

3. **Payroll → Payslip:**
   - Payslip displays payroll data
   - Read-only view of finalized payroll

---

## 🚨 **VALIDATION RULES**

### **Recalculation Required:**
```
When attendance is edited:
1. Set needsRecalculation = true
2. Disable "Approve" and "Pay" buttons
3. Show warning: "Recalculation required"
4. User MUST click "Recalculate" before proceeding
```

### **Status Transitions:**
```
✅ ALLOWED:
- Not Generated → Generated
- Generated → Approved
- Approved → Paid
- Paid → Bank File Generated

❌ NOT ALLOWED:
- Skip states (e.g., Not Generated → Paid)
- Go backwards (e.g., Paid → Approved)
- Edit attendance after Paid status
```

### **Cross-Module Locks:**
```
When Advance is Paid:
- ❌ Cannot edit attendance (UI disabled)
- ❌ Cannot regenerate advance
- ✅ Can still generate payroll (uses paid advance amount)

When Payroll is Paid:
- ❌ Cannot edit attendance (UI disabled)
- ❌ Cannot regenerate payroll
- ❌ Cannot regenerate advance
- ✅ Can view/print payslip
```

---

## 🎨 **UI/UX IMPROVEMENTS MADE**

### **1. Consistent Button Ordering:**
```
BEFORE (Inconsistent):
Advance:  Edit | Approve | Pay
Payroll:  Edit | Finalize | Pay

AFTER (Consistent):
Advance:  Generate | Approve | Pay | Edit
Payroll:  Generate | Finalize | Pay | Edit
```

### **2. Responsive Layout:**
```
Mobile (< 640px):   Buttons stack vertically (2 columns)
Tablet (640-1024):  Buttons in 2 columns
Desktop (> 1024):   Buttons in 4 columns (Advance) or 4 columns (Payroll)
```

### **3. Clear Status Labels:**
```
BEFORE:
- "Bulk Payment" (ambiguous)
- "Finalize Payroll" (unclear what it does)

AFTER:
- "Pay Advance" (clear action)
- "Pay Salary" (clear distinction)
- "Generate Advances" (explicit generation step)
- "Generate Payroll" (explicit generation step)
```

### **4. Disabled State Feedback:**
```
All disabled buttons now show tooltips:
- "Please recalculate before approving"
- "Please recalculate before processing payment"
- "Please recalculate before finalizing"
```

---

## 📊 **TESTING CHECKLIST**

### **Test 1: Complete Happy Path**
```
☐ 1. Create attendance for May 2026
☐ 2. Click "Recalculate Now"
☐ 3. Go to Advance Payment
☐ 4. Click "Generate Advances"
☐ 5. Verify eligibility calculated correctly
☐ 6. Click "Approve Advance"
☐ 7. Click "Pay Advance"
☐ 8. Go to Payroll Processing
☐ 9. Click "Generate Payroll"
☐ 10. Verify advance deducted from salary
☐ 11. Click "Finalize Payroll"
☐ 12. Click "Pay Salary"
☐ 13. Go to Payslip
☐ 14. Verify payslip shows correct data
```

### **Test 2: Attendance Edit After Advance Paid**
```
☐ 1. Pay advance for employee
☐ 2. Try to edit attendance
☐ 3. Verify Edit button is disabled
☐ 4. Check tooltip shows "Locked - Payment Completed"
```

### **Test 3: Recalculation Flow**
```
☐ 1. Edit attendance
☐ 2. Verify warning appears
☐ 3. Verify Approve/Pay buttons disabled
☐ 4. Click "Recalculate Now"
☐ 5. Verify warning disappears
☐ 6. Verify buttons re-enabled
☐ 7. Check advance amounts updated
☐ 8. Check payroll amounts updated
```

### **Test 4: Individual vs Bulk Actions**
```
☐ 1. Test individual Approve (checkmark icon)
☐ 2. Test bulk Approve (button)
☐ 3. Verify both work correctly
☐ 4. Test individual Pay (dollar icon)
☐ 5. Test bulk Pay (button)
☐ 6. Verify both work correctly
```

### **Test 5: Archive Employee**
```
☐ 1. Archive an employee
☐ 2. Verify removed from Attendance
☐ 3. Verify removed from Advance Payment
☐ 4. Verify removed from Payroll Processing
☐ 5. Verify removed from Payslip
☐ 6. Verify removed from all dropdowns
☐ 7. Toggle "View Archived"
☐ 8. Verify employee appears
☐ 9. Restore employee
☐ 10. Verify reappears in all modules
```

---

## 🐛 **KNOWN ISSUES (Now Fixed)**

| Issue | Status | Fix |
|-------|--------|-----|
| Recalculate skips advances | ✅ FIXED | Now calls generateAdvances() first |
| Missing "Generate" buttons | ✅ FIXED | Added to both Advance & Payroll |
| Button logic inverted | ✅ FIXED | Corrected disabled state logic |
| Can edit locked payroll | ⚠️ PARTIAL | UI locked, but need backend validation |
| Bank file status conflict | ⚠️ NOTED | Same status used for advance & payroll |
| No cascade update | ⏳ PLANNED | Will implement in next iteration |

---

## 📚 **RELATED DOCUMENTATION**

- `CARA_ARCHIVE_EMPLOYEE_PROPER.md` - Employee archival system
- `CARA_CARI_EMPLOYEE_ARCHIVED.md` - Finding archived employees (Malay)

---

## 💡 **QUICK REFERENCE**

### **Attendance Calculation Period:**
- **Advance:** Days 1-10 of the month
- **Payroll:** Full month (Day 1 to end of month)

### **Payment Dates:**
- **Advance:** 20th of the month
- **Salary:** 7th of next month

### **Eligibility:**
- **Full Advance (RM400):** 7+ attendance days
- **Half Advance (RM250):** 5-6 attendance days
- **No Advance (RM0):** < 5 attendance days

### **Status Order:**
```
Advance:  Not Generated → Generated → Approved → Paid → Bank File Generated
Payroll:  Not Generated → Draft → Finalized → Paid → Bank File Generated
```

---

**End of Workflow Guide**  
**For support, refer to in-app info panels or contact administrator.**
