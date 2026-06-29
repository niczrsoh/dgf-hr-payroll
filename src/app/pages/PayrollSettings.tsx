import { useState, useEffect } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { Save, Info, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '../components/ConfirmDialog';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export default function PayrollSettings() {
  const { settings, updateSettings } = usePayroll();
  const [formData, setFormData] = useState(settings);
  const [saveConfirm, setSaveConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [viewingTable, setViewingTable] = useState<'socso' | 'eis' | 'skbbk' | null>(null);

  // Sync local form state when the context settings are loaded/updated from the database
  useEffect(() => {
    if (!hasChanges) {
      setFormData(settings);
    }
  }, [settings, hasChanges]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const parsePDFText = (textItems: any[]) => {
    const rows: { [y: number]: any[] } = {};
    textItems.forEach(item => {
      const y = Math.round(item.transform[5] / 2) * 2;
      if (!rows[y]) rows[y] = [];
      rows[y].push(item);
    });
    
    const parsedData: any[] = [];
    const sortedY = Object.keys(rows).map(Number).sort((a, b) => b - a);
    
    sortedY.forEach(y => {
      const rowItems = rows[y].sort((a, b) => a.transform[4] - b.transform[4]);
      const rowText = rowItems.map(i => i.str).join(' ').trim();
      
      const nums = rowText.match(/[\d,]+\.\d{2}/g);
      if (nums && nums.length >= 3) {
        let min = 0, max = 0, employer = 0, employee = 0;
        if (nums.length === 3) {
          max = parseFloat(nums[0].replace(/,/g, ''));
          employer = parseFloat(nums[1].replace(/,/g, ''));
          employee = parseFloat(nums[2].replace(/,/g, ''));
        } else if (nums.length === 4) {
          max = parseFloat(nums[0].replace(/,/g, ''));
          employer = parseFloat(nums[1].replace(/,/g, ''));
          employee = parseFloat(nums[2].replace(/,/g, ''));
        } else if (nums.length >= 5) {
          min = parseFloat(nums[0].replace(/,/g, ''));
          max = parseFloat(nums[1].replace(/,/g, ''));
          employer = parseFloat(nums[2].replace(/,/g, ''));
          employee = parseFloat(nums[3].replace(/,/g, ''));
        }
        if (max > 0) {
          parsedData.push({ min, max, employer, employee });
        }
      }
    });
    return parsedData;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'socso' | 'eis' | 'skbbk') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading(`Parsing ${file.name}...`);

    try {
      let parsedData: any[] = [];
      
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let allItems: any[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          allItems = allItems.concat(content.items);
        }
        parsedData = parsePDFText(allItems);
      } else {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        json.forEach(row => {
          const nums = row.map(cell => typeof cell === 'string' ? parseFloat(cell.replace(/,/g, '').replace(/[^\d.]/g, '')) : cell).filter(cell => typeof cell === 'number' && !isNaN(cell));
          if (nums.length >= 3) {
            let min = 0, max = 0, employer = 0, employee = 0;
            if (nums.length === 3) {
              max = nums[0]; employer = nums[1]; employee = nums[2];
            } else if (nums.length === 4) {
              max = nums[0]; employer = nums[1]; employee = nums[2];
            } else if (nums.length >= 5) {
              min = nums[0]; max = nums[1]; employer = nums[2]; employee = nums[3];
            }
            if (max > 0) {
              parsedData.push({ min, max, employer, employee });
            }
          }
        });
      }

      if (parsedData.length > 0) {
        toast.success(`${type.toUpperCase()} data pulled successfully! Found ${parsedData.length} brackets.`, { id: toastId });
        const updatedDataString = JSON.stringify(parsedData);
        
        // Auto-save the table to database
        updateSettings({
          [`${type}TableData`]: updatedDataString,
          statutoryTableUploaded: true
        });
        
        // Update local form state
        setFormData(prev => ({
          ...prev,
          [`${type}TableData`]: updatedDataString,
          statutoryTableUploaded: true
        }));
      } else {
        toast.error(`Could not extract table data from ${file.name}. Please ensure it is a valid table.`, { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to parse file.', { id: toastId });
    }
  };

  const renderWorkHourTable = (dataString: string, field: string, title: string) => {
    let parsedData: any[] = [];
    try {
      parsedData = JSON.parse(dataString);
    } catch (e) {
      parsedData = [];
    }

    const handleTableChange = (index: number, key: string, value: number) => {
      const newData = [...parsedData];
      newData[index] = { ...newData[index], [key]: value };
      handleChange(field, JSON.stringify(newData));
    };

    return (
      <div className="mt-6 border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-slate-800">
          {title}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Work Day</th>
                <th className="px-4 py-3 font-medium">Hourly Payment Rate</th>
                <th className="px-4 py-3 font-medium">Multiplier</th>
                <th className="px-4 py-3 font-medium">Hours</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.map((row, index) => (
                <tr key={index} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium border-r">{row.dayType}</td>
                  <td className="px-4 py-2 border-r">
                    <input type="number" step="0.0001" value={row.hourlyRate} onChange={(e) => handleTableChange(index, 'hourlyRate', parseFloat(e.target.value))} className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                  </td>
                  <td className="px-4 py-2 border-r">
                    <input type="number" step="0.01" value={row.multiplier} onChange={(e) => handleTableChange(index, 'multiplier', parseFloat(e.target.value))} className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" step="0.01" value={row.hours} onChange={(e) => handleTableChange(index, 'hours', parseFloat(e.target.value))} className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const handleSave = () => {
    setSaveConfirm(true);
  };

  const confirmSave = () => {
    updateSettings(formData);
    setHasChanges(false);
    toast.success('Payroll settings saved successfully');
    setSaveConfirm(false);
  };

  const handleReset = () => {
    setFormData(settings);
    setHasChanges(false);
    toast.info('Changes discarded');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">Configure payroll calculations and parameters</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm md:text-base"
            >
              Discard Changes
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center justify-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            <Save className="w-5 h-5" />
            Save Settings
          </button>
        </div>
      </div>

      {/* Salary Settings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Salary Configuration</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Basic Salary (RM)
              </label>
              <input
                type="number"
                value={formData.basicSalary}
                onChange={(e) => handleChange('basicSalary', parseFloat(e.target.value))}
                step="0.01"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Salary Payment Date (Day of Month)
              </label>
              <input
                type="number"
                value={formData.salaryDate}
                onChange={(e) => handleChange('salaryDate', parseInt(e.target.value))}
                min="1"
                max="31"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Default Uniform Reimbursement (RM)
              </label>
              <input
                type="number"
                value={formData.defaultUniformReimbursement ?? 100}
                onChange={(e) => handleChange('defaultUniformReimbursement', parseFloat(e.target.value))}
                step="1"
                min="0"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Advance Payment Settings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Advance Payment Configuration</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Advance Amount (RM)
              </label>
              <input
                type="number"
                value={formData.fullAdvance}
                onChange={(e) => handleChange('fullAdvance', parseFloat(e.target.value))}
                step="0.01"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Half Advance Amount (RM)
              </label>
              <input
                type="number"
                value={formData.halfAdvance}
                onChange={(e) => handleChange('halfAdvance', parseFloat(e.target.value))}
                step="0.01"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Minimum Days for Full Advance
              </label>
              <input
                type="number"
                value={formData.minFullAdvanceDays}
                onChange={(e) => handleChange('minFullAdvanceDays', parseInt(e.target.value))}
                min="0"
                max="10"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Minimum Days for Half Advance
              </label>
              <input
                type="number"
                value={formData.minHalfAdvanceDays}
                onChange={(e) => handleChange('minHalfAdvanceDays', parseInt(e.target.value))}
                min="0"
                max="10"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Advance Calculation Start Date (Day of Month)
              </label>
              <input
                type="number"
                value={formData.advanceCalculationStartDate}
                readOnly
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Advance Calculation End Date (Day of Month)
              </label>
              <input
                type="number"
                value={formData.advanceCalculationEndDate}
                readOnly
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Advance Payment Date (Day of Month)
              </label>
              <input
                type="number"
                value={formData.advancePaymentDate}
                onChange={(e) => handleChange('advancePaymentDate', parseInt(e.target.value))}
                min="1"
                max="31"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Deductions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Statutory Contributions</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-slate-800">
              Specific EPF Parts Configuration
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium border-r">Part</th>
                    <th className="px-4 py-3 font-medium border-r">Who</th>
                    <th className="px-4 py-3 font-medium border-r">Employee %</th>
                    <th className="px-4 py-3 font-medium">Employer %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-white">
                    <td className="px-4 py-3 font-semibold border-r">A</td>
                    <td className="px-4 py-3 border-r">Malaysian / PR below 60</td>
                    <td className="px-4 py-2 border-r"><input type="number" value={formData.epfPartAEmployee} onChange={(e) => handleChange('epfPartAEmployee', parseFloat(e.target.value))} step="0.01" className="w-full px-2 py-1 border rounded" /></td>
                    <td className="px-4 py-2"><input type="number" value={formData.epfPartAEmployer} onChange={(e) => handleChange('epfPartAEmployer', parseFloat(e.target.value))} step="0.01" className="w-full px-2 py-1 border rounded" /></td>
                  </tr>
                  <tr className="border-b bg-slate-50">
                    <td className="px-4 py-3 font-semibold border-r">C</td>
                    <td className="px-4 py-3 border-r">Non-citizen PR 60 and above</td>
                    <td className="px-4 py-2 border-r"><input type="number" value={formData.epfPartCEmployee} onChange={(e) => handleChange('epfPartCEmployee', parseFloat(e.target.value))} step="0.01" className="w-full px-2 py-1 border rounded" /></td>
                    <td className="px-4 py-2"><input type="number" value={formData.epfPartCEmployer} onChange={(e) => handleChange('epfPartCEmployer', parseFloat(e.target.value))} step="0.01" className="w-full px-2 py-1 border rounded" /></td>
                  </tr>
                  <tr className="border-b bg-white">
                    <td className="px-4 py-3 font-semibold border-r">E</td>
                    <td className="px-4 py-3 border-r">Malaysian citizen 60 and above</td>
                    <td className="px-4 py-2 border-r"><input type="number" value={formData.epfPartEEmployee} onChange={(e) => handleChange('epfPartEEmployee', parseFloat(e.target.value))} step="0.01" className="w-full px-2 py-1 border rounded" /></td>
                    <td className="px-4 py-2"><input type="number" value={formData.epfPartEEmployer} onChange={(e) => handleChange('epfPartEEmployer', parseFloat(e.target.value))} step="0.01" className="w-full px-2 py-1 border rounded" /></td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="px-4 py-3 font-semibold border-r">F</td>
                    <td className="px-4 py-3 border-r">Non-citizen non-PR (any age)</td>
                    <td className="px-4 py-2 border-r"><input type="number" value={formData.epfPartFEmployee} onChange={(e) => handleChange('epfPartFEmployee', parseFloat(e.target.value))} step="0.01" className="w-full px-2 py-1 border rounded" /></td>
                    <td className="px-4 py-2"><input type="number" value={formData.epfPartFEmployer} onChange={(e) => handleChange('epfPartFEmployer', parseFloat(e.target.value))} step="0.01" className="w-full px-2 py-1 border rounded" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>


          <div className="pt-6 border-t border-slate-200">
            <h4 className="font-medium text-slate-800 mb-4">Upload Contribution Tables (PDF/Excel)</h4>
            <p className="text-sm text-slate-500 mb-4">Upload a PDF or Excel file containing the latest employee & employer contribution tables to auto pull the data.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">SOCSO Table</label>
                <div className="flex flex-col gap-2">
                  <input type="file" accept=".pdf,.csv,.xlsx,.xls" onChange={(e) => handleFileUpload(e, 'socso')} className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {formData.socsoTableData && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded w-fit">✓ Data Pulled Successfully</span>
                      <button onClick={() => setViewingTable('socso')} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded">
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">EIS Table</label>
                <div className="flex flex-col gap-2">
                  <input type="file" accept=".pdf,.csv,.xlsx,.xls" onChange={(e) => handleFileUpload(e, 'eis')} className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {formData.eisTableData && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded w-fit">✓ Data Pulled Successfully</span>
                      <button onClick={() => setViewingTable('eis')} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded">
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">SKBBK Table</label>
                <div className="flex flex-col gap-2">
                  <input type="file" accept=".pdf,.csv,.xlsx,.xls" onChange={(e) => handleFileUpload(e, 'skbbk')} className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {formData.skbbkTableData && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded w-fit">✓ Data Pulled Successfully</span>
                      <button onClick={() => setViewingTable('skbbk')} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded">
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Leave Policy */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Leave Policy</h3>
          <p className="text-sm text-slate-500 mt-1">Set maximum days allowed per year. Note: Annual leave will be pro-rated over 12 months.</p>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">MC Days</label>
            <input type="number" step="0.5" value={formData.mcDays} onChange={(e) => handleChange('mcDays', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Hospitalisation Days</label>
            <input type="number" step="0.5" value={formData.hospitalisationDays} onChange={(e) => handleChange('hospitalisationDays', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Total Annual Leave / Year</label>
            <input type="number" step="0.5" value={formData.annualLeaveDays} onChange={(e) => handleChange('annualLeaveDays', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Maternity Days</label>
            <input type="number" step="0.5" value={formData.maternityDays} onChange={(e) => handleChange('maternityDays', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="px-6 pb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.annualLeaveProRata} 
              onChange={(e) => handleChange('annualLeaveProRata', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-700">Enable Monthly Pro-Rata for Annual Leave</span>
          </label>
          <p className="text-xs text-slate-500 mt-1 ml-6">If enabled, employees will earn (Total Annual Leave / 12) for each month worked instead of getting the full amount instantly.</p>
        </div>
      </div>

      {/* Setup 8+4 & 8+3 Data */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Setup 8+4 & 8+3 Data</h3>
          <p className="text-sm text-slate-500 mt-1">Configure the hourly payment rates, multipliers, and hours for each payment and day type.</p>
        </div>
        <div className="p-6 space-y-2">
          {renderWorkHourTable(formData.eightPlusFourData, 'eightPlusFourData', '8+4 Setup')}
          {renderWorkHourTable(formData.eightPlusThreeData, 'eightPlusThreeData', '8+3 Setup')}
        </div>
      </div>

      {/* Formula Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-3 text-sm md:text-base">Payroll Calculation Formulas</h4>
            <div className="space-y-3 text-xs md:text-sm text-blue-800">
              <div>
                <p className="font-medium">Gross Earnings (Pendapatan):</p>
                <p className="font-mono text-xs bg-blue-100 px-2 py-1 rounded mt-1 break-words">
                  Basic Salary + OT Pay + Rest Day Pay + Public Holiday Pay + OT Replacement + Reimbursements + Manual Adjustments
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Reimbursements include standard allowances and the Default Uniform Reimbursement for new employees.
                </p>
              </div>
              <div>
                <p className="font-medium">Employee Deductions (Potongan):</p>
                <p className="font-mono text-xs bg-blue-100 px-2 py-1 rounded mt-1 break-words">
                  EPF ({formData.epfRate}%) + SOCSO ({formData.socsoEmployee}%) + SIP ({formData.sipRate}%) + SKBBK + Advance + Uniform + Unpaid Days
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  SKBBK and statutory deductions are automatically matched from their respective tables based on total eligible wages.
                </p>
              </div>
              <div>
                <p className="font-medium">Unpaid Day Deduction Formula:</p>
                <p className="font-mono text-xs bg-blue-100 px-2 py-1 rounded mt-1">
                  Unpaid Days × (Basic Salary ÷ 26 working days)
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Example: 2 days × RM{(formData.basicSalary / 26).toFixed(2)} = RM{(2 * formData.basicSalary / 26).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="font-medium">Advance Payment Eligibility:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                  <div className="bg-green-100 px-2 py-1 rounded text-center">
                    <p className="text-xs font-semibold text-green-800">{formData.minFullAdvanceDays}-10 days</p>
                    <p className="text-xs text-green-700">RM{formData.fullAdvance}</p>
                  </div>
                  <div className="bg-orange-100 px-2 py-1 rounded text-center">
                    <p className="text-xs font-semibold text-orange-800">{formData.minHalfAdvanceDays}-{formData.minFullAdvanceDays - 1} days</p>
                    <p className="text-xs text-orange-700">RM{formData.halfAdvance}</p>
                  </div>
                  <div className="bg-red-100 px-2 py-1 rounded text-center">
                    <p className="text-xs font-semibold text-red-800">0-{formData.minHalfAdvanceDays - 1} days</p>
                    <p className="text-xs text-red-700">RM0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {saveConfirm && (
        <ConfirmDialog
        isOpen={saveConfirm}
        title="Save Settings"
        message="Are you sure you want to save these payroll settings? This will affect future payroll calculations."
        onConfirm={confirmSave}
        onCancel={() => setSaveConfirm(false)}
        confirmText="Save Settings"
        confirmStyle="warning"
      />
      )}

      {viewingTable && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">
                {viewingTable === 'socso' ? 'SOCSO' : viewingTable === 'eis' ? 'EIS' : 'SKBBK'} Contribution Table
              </h3>
              <button onClick={() => setViewingTable(null)} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-50 text-slate-700 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 border">Wages From (RM)</th>
                    <th className="px-4 py-2 border">Wages To (RM)</th>
                    <th className="px-4 py-2 border">Employer (RM)</th>
                    <th className="px-4 py-2 border">Employee (RM)</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const dataStr = formData[`${viewingTable}TableData` as keyof typeof formData];
                    if (typeof dataStr === 'string' && dataStr) {
                      try {
                        const arr = JSON.parse(dataStr);
                        return arr.map((row: any, i: number) => (
                          <tr key={i} className="border-b">
                            <td className="px-4 py-2 border">{row.min !== undefined ? row.min.toFixed(2) : '0.00'}</td>
                            <td className="px-4 py-2 border">{row.max !== undefined ? row.max.toFixed(2) : '0.00'}</td>
                            <td className="px-4 py-2 border">{row.employer !== undefined ? row.employer.toFixed(2) : '0.00'}</td>
                            <td className="px-4 py-2 border">{row.employee !== undefined ? row.employee.toFixed(2) : '0.00'}</td>
                          </tr>
                        ));
                      } catch (e) {
                        return <tr><td colSpan={4} className="text-center py-4">Error loading data</td></tr>;
                      }
                    }
                    return <tr><td colSpan={4} className="text-center py-4">No data</td></tr>;
                  })()}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end">
              <button onClick={() => setViewingTable(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-sm font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
