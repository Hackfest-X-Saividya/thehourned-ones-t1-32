import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from '../context/SessionContext';
import FinalizedSuspectPanel from '../components/verification/FinalizedSuspectPanel';
import DbSearchControls from '../components/verification/DbSearchControls';
import CriminalMatchCard from '../components/verification/CriminalMatchCard';
import FeatureComparisonModal from '../components/verification/FeatureComparisonModal';
import { fetchCriminalRecords, verifySuspectInDb } from '../services/api';
import {
  ShieldAlert,
  UserCheck,
  Search,
  Filter,
  AlertTriangle,
  Database,
  RefreshCw,
  Info
} from 'lucide-react';
import Button from '../components/common/Button';

export default function DbVerificationPage() {
  const { finalizedSketch, recordAuditAction, addToast } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [topMatch, setTopMatch] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('score_desc');
  const [minScore, setMinScore] = useState(30);

  // Modal inspection state
  const [selectedSuspectForModal, setSelectedSuspectForModal] = useState(null);

  // Execute database verification comparison on mount or when finalized sketch changes
  useEffect(() => {
    async function runVerification() {
      if (!finalizedSketch) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const result = await verifySuspectInDb({ finalizedSketch });
        setRecords(result.matches || []);
        setTopMatch(result.topMatch || null);
        await recordAuditAction(
          'EXECUTED_CRIMINAL_DB_COMPARISON',
          finalizedSketch.imageId,
          `Evaluated ${result.evaluatedRecordsCount || 0} synthetic criminal registry records`
        );
      } catch (err) {
        console.error('DB Verification failed:', err);
        addToast('Error querying synthetic criminal registry.', 'danger');
      } finally {
        setIsLoading(false);
      }
    }
    runVerification();
  }, [finalizedSketch]);

  // Client-side filtering & sorting of retrieved scored records
  const filteredRecords = useMemo(() => {
    let list = [...records];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q) ||
          r.alias.toLowerCase().includes(q) ||
          r.firNumber.toLowerCase().includes(q) ||
          r.crimeCategory.toLowerCase().includes(q) ||
          r.lastKnownLocation.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'ALL') {
      list = list.filter((r) => r.crimeCategory.includes(selectedCategory));
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
            <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Database size={18} className="text-sky-400" />
              <span>Criminal Record Facial Feature Comparison Engine</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Dual-metric comparison combining 512-d biometric embedding similarity (60% weight) with
              structured anatomical trait alignment (40% weight).
            </p>
          </div>

          <div className="flex items-center gap-2 bg-navy-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400">
            <span>REGISTRY STATUS:</span>
            <span className="text-sky-400 font-bold">SYNTHETIC DEMO MODE</span>
          </div>
        </div>

        {/* Responsible AI & Non-Biometric Evidence Guardrail Notice */}
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/80 text-xs text-amber-200 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold uppercase tracking-wider text-[11px] text-amber-300">
              Mandatory Responsible AI & Forensic Evidence Notice
            </div>
            <div className="text-[11px] leading-relaxed text-amber-100/90">
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
            <div className="bg-emerald-950/70 border-2 border-emerald-500/70 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-emerald-950/30">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <UserCheck size={22} />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-300 tracking-wide uppercase">
                    EXISTING CRIMINAL RECORD MATCH DETECTED
                  </div>
                  <div className="text-xs text-slate-200 mt-0.5">
                    High-confidence dual-metric alignment with repeat offender{' '}
                    <strong className="text-white">{topMatch.fullName}</strong> ({topMatch.firNumber})
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono mt-1">
                    Matched {topMatch.matchedTraits?.length || 0} of 6 key anatomical traits ({topMatch.featureScore}% trait match)
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                  {topMatch.combinedScore}%
                </div>
                <div className="text-[10px] text-slate-400 font-mono uppercase">
                  Overall Weighted Score
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-navy-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
              <Info size={18} className="text-sky-400 shrink-0" />
              <div className="text-xs text-slate-300">
                No synthetic criminal record met the 75% or higher high-confidence threshold. Closest
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
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span>EVALUATED REGISTRY RECORDS ({filteredRecords.length})</span>
              <span>SYNTHETIC PROFILES</span>
            </div>

            {isLoading ? (
              <div className="bg-navy-900 border border-slate-800 rounded-xl p-12 text-center space-y-3">
                <RefreshCw size={24} className="animate-spin text-sky-400 mx-auto" />
                <div className="text-xs font-mono text-slate-400">
                  Executing dual-metric facial feature comparison across synthetic registry...
                </div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="bg-navy-900 border border-slate-800 rounded-xl p-12 text-center space-y-2">
                <Database size={24} className="text-slate-600 mx-auto" />
                <div className="text-xs font-semibold text-slate-300">
                  No criminal records match the active search and filter criteria.
                </div>
                <div className="text-[11px] text-slate-500">
                  Try lowering the match threshold or clearing the search term.
                </div>
              </div>
            ) : (
              filteredRecords.map((suspect) => (
                <CriminalMatchCard
                  key={suspect.suspectId}
                  suspect={suspect}
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
    </div>
  );
}
