import React, { useState, useRef } from 'react';
import Modal from '../common/Modal';
import {
  Database,
  Upload,
  FileText,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Plus,
  RefreshCw,
  FolderOpen,
  Download,
  Users,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import {
  SYNTHETIC_CRIMINAL_REGISTRY,
  SAMPLE_CUSTOM_DATASETS,
  parseSuspectsFromCsv,
  parseSuspectsFromJson,
  getMugshotFallback
} from '../../services/mockCriminalDb';

export default function DatabaseIntegratorModal({
  isOpen,
  onClose,
  activeMode,
  customRecords,
  onApplyDatabase,
  onResetDefault
}) {
  const [selectedSource, setSelectedSource] = useState(activeMode || 'SYNTHETIC_DEMO');
  const [workingRecords, setWorkingRecords] = useState(customRecords || []);
  const [importTab, setImportTab] = useState('PRESETS'); // 'PRESETS' | 'FILE' | 'ADD_MANUAL'
  const [dragOver, setDragOver] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // { type: 'success'|'error', message: string }
  const fileInputRef = useRef(null);

  // Manual Suspect Form state
  const [manualForm, setManualForm] = useState({
    fullName: '',
    alias: '',
    firNumber: '',
    jurisdiction: 'Bengaluru City Police',
    crimeCategory: 'Armed Robbery & Extortion',
    priorOffenses: 'Under Investigation',
    lastKnownLocation: 'State Jurisdiction',
    status: 'ACTIVE_WARRANT',
    gender: 'Male',
    age: 32,
    mugshotUrl: '',
    faceShape: 'Angular Oval',
    jawline: 'Sharp Square',
    eyes: 'Deep-set Almond',
    nose: 'Straight Narrow Bridge',
    facialHair: '3-Day Heavy Stubble',
    marks: 'Scar on Left Eyebrow',
    ageRange: '28-35'
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        let parsed = [];
        if (file.name.endsWith('.csv')) {
          parsed = parseSuspectsFromCsv(text);
        } else {
          parsed = parseSuspectsFromJson(text);
        }

        if (parsed.length === 0) {
          setImportStatus({
            type: 'error',
            message: 'No valid suspect records could be extracted from this file. Check JSON/CSV formatting.'
          });
          return;
        }

        setWorkingRecords(parsed);
        setSelectedSource('CUSTOM_IMPORTED');
        setImportStatus({
          type: 'success',
          message: `Successfully integrated ${parsed.length} suspect records from "${file.name}".`
        });
      } catch (err) {
        setImportStatus({
          type: 'error',
          message: `Failed to parse file: ${err.message}`
        });
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleLoadPreset = (key) => {
    const dataset = SAMPLE_CUSTOM_DATASETS[key];
    if (!dataset) return;
    setWorkingRecords(dataset.records);
    setSelectedSource('CUSTOM_IMPORTED');
    setImportStatus({
      type: 'success',
      message: `Loaded "${dataset.name}" with ${dataset.records.length} suspects.`
    });
  };

  const handleAddManualSuspect = (e) => {
    e.preventDefault();
    if (!manualForm.fullName.trim() || !manualForm.firNumber.trim()) {
      setImportStatus({ type: 'error', message: 'Full name and FIR number are required.' });
      return;
    }

    const newSuspect = {
      suspectId: `CUST-MANUAL-${Date.now().toString().slice(-4)}`,
      fullName: manualForm.fullName.trim(),
      alias: manualForm.alias.trim(),
      firNumber: manualForm.firNumber.trim(),
      jurisdiction: manualForm.jurisdiction,
      crimeCategory: manualForm.crimeCategory,
      priorOffenses: manualForm.priorOffenses,
      lastKnownLocation: manualForm.lastKnownLocation,
      status: manualForm.status,
      gender: manualForm.gender,
      age: parseInt(manualForm.age, 10) || 30,
      mugshotUrl: manualForm.mugshotUrl.trim() || getMugshotFallback(manualForm.gender, Date.now()),
      baseVectorSimilarity: 88.0,
      features: {
        faceShape: manualForm.faceShape,
        jawline: manualForm.jawline,
        eyes: manualForm.eyes,
        nose: manualForm.nose,
        facialHair: manualForm.facialHair,
        marks: manualForm.marks,
        ageRange: manualForm.ageRange
      }
    };

    setWorkingRecords((prev) => [newSuspect, ...prev]);
    setSelectedSource('CUSTOM_IMPORTED');
    setImportStatus({
      type: 'success',
      message: `Added "${newSuspect.fullName}" to custom records.`
    });

    // Reset some fields
    setManualForm((prev) => ({
      ...prev,
      fullName: '',
      alias: '',
      firNumber: '',
      mugshotUrl: ''
    }));
  };

  const handleDeleteRecord = (id) => {
    setWorkingRecords((prev) => prev.filter((r) => r.suspectId !== id));
  };

  const handleApply = () => {
    if (selectedSource === 'CUSTOM_IMPORTED') {
      onApplyDatabase(workingRecords, 'CUSTOM_IMPORTED');
    } else {
      onResetDefault();
    }
    onClose();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(workingRecords, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `custom_forensic_registry_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Law Enforcement Database Integrator"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-5 text-xs">
        {/* Intro Banner */}
        <div className="bg-navy-950 p-3.5 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
              <Database size={18} />
            </div>
            <div>
              <div className="font-bold text-white text-xs">
                Integrate External Offender & Suspect Registries
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Connect your department's internal criminal databases, active arrest rosters, or custom suspect datasets.
                The facial comparison engine will compute dual-metric matches against your integrated dataset.
              </div>
            </div>
          </div>
        </div>

        {/* Source Mode Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Option 1: Synthetic Demo */}
          <div
            onClick={() => setSelectedSource('SYNTHETIC_DEMO')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              selectedSource === 'SYNTHETIC_DEMO'
                ? 'bg-sky-950/40 border-sky-400 ring-1 ring-sky-500/40'
                : 'bg-navy-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span className="font-bold text-slate-200">Synthetic Demo Registry</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {SYNTHETIC_CRIMINAL_REGISTRY.length} Records
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Pre-calibrated demonstration records for algorithm testing, system verification, and hackathon evaluation.
            </p>
          </div>

          {/* Option 2: Custom Department DB */}
          <div
            onClick={() => setSelectedSource('CUSTOM_IMPORTED')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              selectedSource === 'CUSTOM_IMPORTED'
                ? 'bg-emerald-950/40 border-emerald-400 ring-1 ring-emerald-500/40'
                : 'bg-navy-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-slate-200">Custom Department Database</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {workingRecords.length} Suspects Loaded
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Active custom suspect roster imported by the officer. Dual-metric search runs directly over these records.
            </p>
          </div>
        </div>

        {/* Custom Data Import & Management Tabs */}
        <div className="bg-navy-950 rounded-xl border border-slate-800 overflow-hidden">
          {/* Subtabs Header */}
          <div className="flex items-center border-b border-slate-800 bg-slate-900/60 px-2 pt-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setImportTab('PRESETS')}
              className={`px-3 py-2 border-b-2 font-medium transition-colors ${
                importTab === 'PRESETS'
                  ? 'border-sky-400 text-sky-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Pre-Loaded Police Rosters
            </button>
            <button
              type="button"
              onClick={() => setImportTab('FILE')}
              className={`px-3 py-2 border-b-2 font-medium transition-colors ${
                importTab === 'FILE'
                  ? 'border-sky-400 text-sky-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Upload File (JSON / CSV)
            </button>
            <button
              type="button"
              onClick={() => setImportTab('ADD_MANUAL')}
              className={`px-3 py-2 border-b-2 font-medium transition-colors ${
                importTab === 'ADD_MANUAL'
                  ? 'border-sky-400 text-sky-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              + Quick Add Suspect
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Status Alert Banner */}
            {importStatus && (
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                  importStatus.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-600/80 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-600/80 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {importStatus.type === 'success' ? (
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle size={14} className="text-rose-400 shrink-0" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setImportStatus(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}

            {/* TAB 1: PRE-LOADED POLICE ROSTERS */}
            {importTab === 'PRESETS' && (
              <div className="space-y-3">
                <div className="text-[11px] text-slate-400">
                  Select a departmental taskforce dataset to instantly populate your custom database:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(SAMPLE_CUSTOM_DATASETS).map(([key, ds]) => (
                    <div
                      key={key}
                      className="bg-navy-900 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-all flex flex-col justify-between space-y-2"
                    >
                      <div>
                        <div className="font-bold text-white text-xs">{ds.name}</div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                          {ds.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-850">
                        <span className="text-[10px] font-mono text-sky-400">
                          {ds.records.length} Offender Profiles
                        </span>
                        <button
                          type="button"
                          onClick={() => handleLoadPreset(key)}
                          className="px-2.5 py-1 rounded bg-sky-500/20 hover:bg-sky-500 hover:text-navy-950 text-sky-300 font-bold text-[10px] transition-all flex items-center gap-1"
                        >
                          <span>Load Dataset</span>
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: FILE UPLOAD */}
            {importTab === 'FILE' && (
              <div className="space-y-3">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-sky-400 bg-sky-950/30'
                      : 'border-slate-700 bg-navy-900/60 hover:border-slate-600'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload size={28} className="text-sky-400 mx-auto mb-2" />
                  <div className="font-semibold text-slate-200 text-xs">
                    Drop your custom database (.json or .csv) here or browse files
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Supports JSON array of suspects or CSV with columns (name, fir, category, age, jawline, eyes, nose, facialHair, marks)
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: QUICK ADD MANUAL */}
            {importTab === 'ADD_MANUAL' && (
              <form onSubmit={handleAddManualSuspect} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={manualForm.fullName}
                      onChange={(e) => setManualForm({ ...manualForm, fullName: e.target.value })}
                      placeholder="e.g. Ramesh Shetty"
                      className="w-full bg-navy-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Alias / Street Name</label>
                    <input
                      type="text"
                      value={manualForm.alias}
                      onChange={(e) => setManualForm({ ...manualForm, alias: e.target.value })}
                      placeholder="e.g. Rocky Bhai"
                      className="w-full bg-navy-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">FIR Record Number *</label>
                    <input
                      type="text"
                      required
                      value={manualForm.firNumber}
                      onChange={(e) => setManualForm({ ...manualForm, firNumber: e.target.value })}
                      placeholder="e.g. FIR-BLR-2025-019"
                      className="w-full bg-navy-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Jawline</label>
                    <select
                      value={manualForm.jawline}
                      onChange={(e) => setManualForm({ ...manualForm, jawline: e.target.value })}
                      className="w-full bg-navy-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-sky-400"
                    >
                      <option value="Sharp Square">Sharp Square</option>
                      <option value="Heavy Chiseled">Heavy Chiseled</option>
                      <option value="Soft Rounded">Soft Rounded</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Eyes</label>
                    <select
                      value={manualForm.eyes}
                      onChange={(e) => setManualForm({ ...manualForm, eyes: e.target.value })}
                      className="w-full bg-navy-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-sky-400"
                    >
                      <option value="Deep-set Almond">Deep-set Almond</option>
                      <option value="Narrow Hooded">Narrow Hooded</option>
                      <option value="Wide Round">Wide Round</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Facial Hair</label>
                    <select
                      value={manualForm.facialHair}
                      onChange={(e) => setManualForm({ ...manualForm, facialHair: e.target.value })}
                      className="w-full bg-navy-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-sky-400"
                    >
                      <option value="3-Day Heavy Stubble">3-Day Heavy Stubble</option>
                      <option value="Full Dense Beard">Full Dense Beard</option>
                      <option value="Thick Horseshoe Mustache">Thick Horseshoe Mustache</option>
                      <option value="Clean Shaven">Clean Shaven</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Distinguishing Marks</label>
                    <input
                      type="text"
                      value={manualForm.marks}
                      onChange={(e) => setManualForm({ ...manualForm, marks: e.target.value })}
                      placeholder="e.g. Scar on Left Eyebrow"
                      className="w-full bg-navy-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs shadow transition-all"
                  >
                    <Plus size={13} />
                    <span>Add Suspect to Custom Database</span>
                  </button>
                </div>
              </form>
            )}

            {/* CURRENT LOADED RECORDS PREVIEW */}
            {workingRecords.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono uppercase">
                    Active Custom Suspect Roster ({workingRecords.length} Records)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportJson}
                      className="flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 font-mono"
                    >
                      <Download size={11} />
                      <span>Export JSON</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkingRecords([])}
                      className="flex items-center gap-1 text-[10px] text-rose-400 hover:text-rose-300 font-mono"
                    >
                      <Trash2 size={11} />
                      <span>Clear All</span>
                    </button>
                  </div>
                </div>

                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {workingRecords.map((r, idx) => (
                    <div
                      key={r.suspectId || idx}
                      className="bg-navy-900 border border-slate-800/90 rounded px-3 py-1.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-bold text-white truncate">
                          {r.fullName}
                        </span>
                        {r.alias && (
                          <span className="text-[10px] text-slate-400 italic">
                            ({r.alias})
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-1 rounded border border-sky-850">
                          {r.firNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-slate-400">
                          {r.crimeCategory}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(r.suspectId)}
                          className="text-slate-500 hover:text-rose-400 p-0.5"
                          title="Remove record"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded border border-slate-700 bg-navy-950 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-all"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-2 rounded bg-sky-500 hover:bg-sky-400 text-navy-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <ShieldCheck size={14} />
            <span>
              {selectedSource === 'CUSTOM_IMPORTED'
                ? `Activate Custom Database (${workingRecords.length} Suspects)`
                : 'Activate Synthetic Demo Registry'}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

