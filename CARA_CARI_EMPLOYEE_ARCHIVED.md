# Cara Cari & Restore Employee Yang Di-Archive

## Untuk Melihat Employee Yang Di-Archive

Ada **3 cara** untuk melihat employee yang sudah di-archive:

### Cara 1: Klik Card "Archived" (Paling Mudah!)

1. Pergi ke halaman **Employee Management**
2. Lihat summary cards di bahagian atas
3. **Klik pada card "Archived"** (warna kelabu dengan icon kotak)
4. Sistem akan automatik tunjuk semua employee yang di-archive

### Cara 2: Klik Pada Angka Archived

Di summary cards, akan ada angka berapa employee yang di-archive. Contoh: "5" bermaksud ada 5 employee dalam archive.

Klik pada card tu untuk toggle antara:
- **Active Employees** (biasa)
- **Archived Employees** (yang sudah di-archive)

### Cara 3: Search Biasa (Tak Akan Jumpa!)

⚠️ **PENTING**: Employee yang di-archive **TAK AKAN** keluar dalam search biasa!

Kena klik card "Archived" dulu, baru boleh search dalam archived employees.

---

## Bila View Archived Employees

Bila anda view archived employees, sistem akan:

✅ **Tunjuk banner kuning** kat atas - "Viewing Archived Employees"  
✅ **Hanya tunjuk** employee yang di-archive sahaja  
✅ **Sembunyikan** employee yang active  
✅ **Tunjuk tarikh** bila employee tu di-archive  

Contoh dalam table:
```
Nama Employee: Ahmad Bin Ali
Employee No: EMP001
Archived: 19/5/2026  ← Tarikh bila di-archive
```

---

## Untuk Restore (Buka Balik) Employee

Bila dah view archived employees:

1. **Cari** employee yang nak restore
2. Klik button **"Restore"** (warna hijau)
3. Confirm dialog akan keluar
4. Klik **"Yes, Restore"**
5. ✅ **Selesai!** Employee akan:
   - Kembali ke status **Active**
   - Keluar dalam semua modul (Attendance, Payroll, etc.)
   - `archivedDate` akan di-clear
   - Automatik switch balik ke view Active Employees

---

## Maklumat Yang Ditunjuk Untuk Archived Employees

| Butir | Ditunjuk? | Catatan |
|-------|-----------|---------|
| Employee Name | ✅ Ya | Dengan tarikh archive |
| Employee No | ✅ Ya | |
| Branch | ✅ Ya | Branch terakhir |
| Status | ✅ Ya | Biasanya "Inactive" |
| Bank Details | ✅ Ya | |
| View Profile | ✅ Ya | Boleh tengok detail penuh |
| Edit | ❌ Tidak | Kena restore dulu |
| Assign Branch | ❌ Tidak | Kena restore dulu |
| Activate/Deactivate | ❌ Tidak | Kena restore dulu |
| Archive | ❌ Tidak | Dah archive dah |
| **Restore** | ✅ **Ya** | **Button utama!** |

---

## Actions Yang Boleh Buat Dengan Archived Employees

### ✅ **BOLEH**:
- View profile (tengok detail)
- Restore (buka balik dari archive)
- Search by name/employee no (dalam archived view)
- Filter by branch/status (dalam archived view)

### ❌ **TAK BOLEH**:
- Edit employee details
- Assign to branch
- Change status Active/Inactive
- Add to attendance
- Process payroll
- Generate advance

Sebab semua action tu untuk active employees sahaja.

---

## Perbezaan: Inactive vs Archived

| | Inactive | Archived |
|---|----------|----------|
| **Keluar dalam list?** | ✅ Ya | ❌ Tidak |
| **Boleh process payroll?** | ✅ Ya | ❌ Tidak |
| **Keluar dalam dropdown?** | ✅ Ya | ❌ Tidak |
| **Kira dalam statistik?** | ✅ Ya (as Inactive) | ❌ Tidak |
| **Guna untuk** | Cuti panjang, suspend | Dah keluar kerja |

### Bila Guna Inactive:
- Employee cuti sakit panjang
- Employee di-suspend
- Temporary tidak aktif

### Bila Guna Archived:
- Employee dah resign
- Employee dah terminate
- Permanently tak kerja lagi

---

## Step-by-Step: Archive → Restore

### Scenario 1: Archive Employee

1. Employee Management → Cari employee
2. Klik icon **Archive** (kotak dengan anak panah)
3. Confirm → "Yes, Archive"
4. ✅ Employee hilang dari active list

### Scenario 2: Cari & View Archived Employee

1. Employee Management
2. **Klik card "Archived"** (summary card)
3. Banner kuning keluar: "Viewing Archived Employees"
4. Tengok semua employee yang di-archive
5. Boleh search/filter macam biasa

### Scenario 3: Restore Employee

1. (Dari archived view) → Cari employee
2. Klik button **"Restore"** (hijau)
3. Confirm → "Yes, Restore"
4. ✅ Employee kembali Active
5. Automatik balik ke active view

---

## Tips & Best Practices

### 🎯 **Bila Nak Archive**:
- Employee dah resign/keluar kerja permanently
- Nak bersihkan active list
- Nak pastikan tak accident process payroll untuk ex-employee

### 🎯 **Bila Nak Restore**:
- Employee re-join company
- Tersalah archive (mistake)
- Nak transfer data ke system lain

### 🎯 **Jangan Archive**:
- Employee cuti sahaja → Guna "Inactive"
- Employee temporary tak aktif → Guna "Inactive"
- Masih nak track dalam report → Guna "Inactive"

---

## Troubleshooting

### ❓ Tak Jumpa Employee Di-Archive

**Sebab**: Mungkin tak klik card "Archived" lagi

**Penyelesaian**:
1. Pergi Employee Management
2. **Klik card "Archived"** (warna kelabu)
3. Check bila banner kuning keluar

---

### ❓ Card "Archived" Tunjuk "0"

**Sebab**: Memang takde employee yang di-archive

**Penyelesaian**: Tak perlu buat apa-apa. Bila ada employee di-archive, angka akan update.

---

### ❓ Lepas Restore, Employee Tak Keluar

**Sebab**: Mungkin masih dalam archived view

**Penyelesaian**:
1. Klik button "Back to Active Employees" (dalam banner kuning)
2. ATAU klik card "Archived" sekali lagi untuk toggle off
3. Employee akan keluar dalam active list

---

### ❓ Nak Archive Banyak Employees Sekaligus

**Penyelesaian**: Kena archive satu-satu. Tiada bulk archive untuk elakkan accident.

---

## Database Note

Kalau guna Supabase, pastikan dah run migration:
```
add-employee-archive-columns.sql
```

File ni akan:
- Tambah column `created_date` 
- Tambah column `archived_date`
- Create index untuk performance

---

## Ringkasan Cepat

```
ARCHIVE EMPLOYEE:
📦 Employee Management → Click Archive icon → Confirm

VIEW ARCHIVED:  
👁️ Click card "Archived" → Tengok list

RESTORE EMPLOYEE:
♻️ (Dalam archived view) → Click "Restore" button → Confirm

BALIK KE ACTIVE:
🔙 Click "Back to Active Employees" OR click card "Archived" lagi
```

---

Mudah je! Kalau ada masalah, check EMPLOYEE_ARCHIVE_GUIDE.md untuk details lagi lengkap.
