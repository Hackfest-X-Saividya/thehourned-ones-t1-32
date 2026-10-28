import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from '../context/SessionContext';
import FinalizedSuspectPanel from '../components/verification/FinalizedSuspectPanel';
import DbSearchControls from '../components/verification/DbSearchControls';
import CriminalMatchCard from '../components/verification/CriminalMatchCard';
import FeatureComparisonModal from '../components/verification/FeatureComparisonModal';
import DatabaseIntegratorModal from '../components/verification/DatabaseIntegratorModal';
import ResponsibleAiNoticeModal from '../components/verification/ResponsibleAiNoticeModal';
import { fetchCriminalRecords, verifySuspectInDb } from '../services/api';
import { calculateSuspectMatch } from '../services/mockCriminalDb';
import {
  ShieldAlert,
  UserCheck,
  Search,
  Filter,
  AlertTriangle,
  Database,
  RefreshCw,
  Info,
  Sliders,
  Sparkles
} from 'lucide-react';
import Button from '../components/common/Button';

export default function DbVerificationPage() {
  const {
    finalizedSketch,
    recordAuditAction,
    addToast,
    registryMode = 'SYNTHETIC_DEMO',
    setRegistryMode,
    customDbRecords = [],
    updateCustomDatabase,
    resetToDefaultRegistry
  } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [topMatch, setTopMatch] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('score_desc');
  const [minScore, setMinScore] = useState(30);

  // Modal inspection & integration state
  const [selectedSuspectForModal, setSelectedSuspectForModal] = useState(null);
  const [isIntegratorOpen, setIsIntegratorOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  // Execute database verification comparison on mount or when finalized sketch / database source changes
  useEffect(() => {
    async function runVerification() {
      if (!finalizedSketch) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        if (registryMode === 'CUSTOM_IMPORTED' && customDbRecords && customDbRecords.length > 0) {
          // Custom Department Offender Database
          await new Promise((r) => setTimeout(r, 200));
          const scored = customDbRecords.map((record) => {
            const evalResult = calculateSuspectMatch(finalizedSketch.features, record);
            return {
              ...record,
              ...evalResult
            };
          });

          scored.sort((a, b) => b.combinedScore - a.combinedScore);
          setRecords(scored);
          setTopMatch(scored[0] || null);

          await recordAuditAction(
            'EXECUTED_CUSTOM_DB_COMPARISON',
            finalizedSketch.imageId,
            `Evaluated ${customDbRecords.length} user-integrated custom department criminal records`
          );
        } else {
          // Default Synthetic Police Registry
          const result = await verifySuspectInDb({ finalizedSketch });
          setRecords(result.matches || []);
          setTopMatch(result.topMatch || null);
          await recordAuditAction(
            'EXECUTED_CRIMINAL_DB_COMPARISON',
            finalizedSketch.imageId,
            `Evaluated ${result.evaluatedRecordsCount || 0} synthetic criminal registry records`
          );
        }
      } catch (err) {
        console.error('DB Verification failed:', err);
        addToast('Error querying criminal registry.', 'danger');
      } finally {
        setIsLoading(false);
      }
    }
    runVerification();
  }, [finalizedSketch, registryMode, customDbRecords]);

  // Client-side filtering & sorting of retrieved scored records
  const filteredRecords = useMemo(() => {
    let list = [...records];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          (r.fullName && r.fullName.toLowerCase().includes(q)) ||
          (r.alias && r.alias.toLowerCase().includes(q)) ||
          (r.firNumber && r.firNumber.toLowerCase().includes(q)) ||
          (r.crimeCategory && r.crimeCategory.toLowerCase().includes(q)) ||
          (r.lastKnownLocation && r.lastKnownLocation.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'ALL') {
      list = list.filter((r) => r.crimeCategory && r.crimeCategory.includes(selectedCategory));
    }

    if (selectedStatus !== 'ALL') {
      list = list.filter((r) => r.status === selectedStatus);
    }

    if (minScore > 0) {
      list = list.filter((r) => r.combinedScore >= minScore);
    }

    list.sort((a, b) => {
      if (sortBy === 'score_desc') return b.combinedScore - a.combinedScore;
      if (sortBy === 'vector_desc') return b.vectorSimilarity - a.vectorSimilarity;
      if (sortBy === 'feature_desc') return b.featureScore - a.featureScore;
      if (sortBy === 'age_asc') return a.age - b.age;
      return 0;
    });

    return list;
  }, [records, searchQuery, selectedCategory, selectedStatus, sortBy, minScore]);

  return (
<div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Title & Synthetic Demonstration Disclaimer */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-bold text-[#E5EDF7] tracking-wide flex items-center gap-2">
              <Database size={18} className="text-[#60A5FA]" />
              <span>Criminal Record Facial Feature Comparison Engine</span>
            </h1>
            <p className="text-xs text-[#A2B1C5] mt-0.5">
              Dual-metric comparison combining 512-d biometric embedding similarity (60% weight) with
              structured anatomical trait alignment (40% weight).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsIntegratorOpen(true)}
              className="flex items-center gap-2 bg-[#111B2B] hover:bg-[#172337] border border-[#29374B] hover:border-[#60A5FA]/60 px-3 py-1.5 rounded-lg text-xs font-mono transition-all text-[#A2B1C5] hover:text-[#E5EDF7] cursor-pointer shadow-sm shrink-0"
              title="Click to integrate custom departmental database or switch datasets"
            >
              <span className={`w-2 h-2 rounded-full ${registryMode === 'CUSTOM_IMPORTED' && customDbRecords?.length > 0 ? 'bg-[#2DD4BF] animate-pulse' : 'bg-[#60A5FA]'}`} />
              <span className="text-[#77879D] text-[11px]">Database:</span>
              <span className="font-semibold text-[#E5EDF7] text-xs">
                {registryMode === 'CUSTOM_IMPORTED' && customDbRecords?.length > 0
                  ? `Custom (${customDbRecords.length})`
                  : 'Synthetic Demo'}
              </span>
              <span className="text-[10px] text-[#60A5FA] bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-800/80 ml-0.5">
                Integrate DB
              </span>
            </button>
          </div>
        </div>

        {/* Responsible AI & Non-Biometric Evidence Guardrail Notice */}
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 text-xs text-[#FBBF24] flex items-start gap-3">
          <AlertTriangle size={18} className="text-[#FBBF24] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold uppercase tracking-wider text-[11px] text-[#FBBF24]">
              Mandatory Responsible AI & Forensic Evidence Notice
            </div>
            <div className="text-[11px] leading-relaxed text-[#FBBF24]/90">
              All criminal records, FIR numbers, mugshots, and similarity scores presented in this
              module are <strong>SYNTHETIC DEMONSTRATION DATA</strong>. This software does not
              perform real-world biometric identification and does not access active operational
              police databases. Similarity scores are investigative exploration aids only and
              must never be presented as proof of identity, criminality, or guilt.
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Panel (Query Input) + Right Panel (Database Match Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Finalized Suspect Sketch & Extracted Facial Features */}
        <div className="lg:col-span-4 sticky top-20">
          <FinalizedSuspectPanel />
        </div>

        {/* Right Column: Search, Verdict Banner & Results */}
        <div className="lg:col-span-8 space-y-5">
          {/* Top Verdict Banner */}
          {topMatch && topMatch.combinedScore >= 75.0 ? (
            <div className="bg-teal-950/50 border-2 border-[#2DD4BF]/60 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-teal-950/20">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#2DD4BF]/15 border border-[#2DD4BF]/40 flex items-center justify-center text-[#2DD4BF] shrink-0">
                  <UserCheck size={22} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2DD4BF] tracking-wide uppercase">
                    Existing Criminal Record Match Detected
                  </div>
                  <div className="text-xs text-[#E5EDF7] mt-0.5">
                    High-confidence dual-metric alignment with repeat offender{' '}
                    <strong className="text-white font-semibold">{topMatch.fullName}</strong> ({topMatch.firNumber})
                  </div>
                  <div className="text-[11px] text-[#2DD4BF] font-mono mt-1">
                    Matched {topMatch.matchedTraits?.length || 0} of 6 key anatomical traits ({topMatch.featureScore}% trait match)
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="text-2xl font-extrabold text-[#2DD4BF] font-mono">
                  {topMatch.combinedScore}%
                </div>
                <div className="text-[10px] text-[#77879D] font-mono uppercase">
                  Overall Weighted Score
                </div>
              </div>
            </div>
          ) : (
<div className="bg-[#111B2B] border border-[#29374B] rounded-xl p-4 flex items-center gap-3">
              <Info size={18} className="text-[#60A5FA] shrink-0" />
              <div className="text-xs text-[#A2B1C5]">
                No criminal record met the 75% or higher high-confidence threshold. Closest
                candidate records ranked by dual similarity below.
              </div>
            </div>
          )}

          {/* Database Search & Filter Controls */}
          <DbSearchControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            sortBy={sortBy}
            onSortChange={setSortBy}
            minScore={minScore}
            onMinScoreChange={setMinScore}
          />

          {/* Results List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-[#77879D] px-1">
              <span>EVALUATED REGISTRY RECORDS ({filteredRecords.length})</span>
              <span>{registryMode === 'CUSTOM_IMPORTED' ? 'DEPARTMENT DATABASE' : 'SYNTHETIC PROFILES'}</span>
            </div>

            {isLoading ? (
<div className="bg-[#111B2B] border border-[#29374B] rounded-xl p-12 text-center space-y-3">
                <RefreshCw size={24} className="animate-spin text-[#60A5FA] mx-auto" />
                <div className="text-xs font-mono text-[#77879D]">
                  Executing dual-metric facial feature comparison across active registry...
                </div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="bg-[#111B2B] border border-[#29374B] rounded-xl p-12 text-center space-y-2">
                <Database size={24} className="text-[#77879D] mx-auto" />
                <div className="text-xs font-semibold text-[#E5EDF7]">
                  No criminal records match the active search and filter criteria.
                </div>
                <div className="text-[11px] text-[#77879D]">
                  Try lowering the match threshold or clearing the search term.
                </div>
              </div>
            ) : (
              filteredRecords.map((suspect) => (
                <CriminalMatchCard
                  key={suspect.suspectId}
                  suspect={suspect}
                  queryFeatures={finalizedSketch?.features}
                  onInspectComparison={(s) => setSelectedSuspectForModal(s)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Feature Comparison Modal */}
      <FeatureComparisonModal
        isOpen={Boolean(selectedSuspectForModal)}
        onClose={() => setSelectedSuspectForModal(null)}
        finalizedSketch={finalizedSketch}
        suspectRecord={selectedSuspectForModal}
      />

      {/* Database Integrator Modal */}
      <DatabaseIntegratorModal
        isOpen={isIntegratorOpen}
        onClose={() => setIsIntegratorOpen(false)}
        activeMode={registryMode}
        customRecords={customDbRecords}
        onApplyDatabase={(imported, mode) => {
          updateCustomDatabase(imported, mode);
          addToast(`Custom database connected with ${imported.length} suspects! Re-executing match engine...`, 'success');
        }}
        onResetDefault={() => {
          resetToDefaultRegistry();
          addToast('Reverted to default Synthetic Demo Registry.', 'info');
        }}
      />

      {/* Responsible AI Notice Full Disclosure Modal */}
      <ResponsibleAiNoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
      />
    </div>
  );
}
