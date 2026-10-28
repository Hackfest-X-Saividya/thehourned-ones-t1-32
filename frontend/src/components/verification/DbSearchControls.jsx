import React from 'react';
import { Search, Filter, ArrowUpDown, SlidersHorizontal } from 'lucide-react';

export default function DbSearchControls({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  minScore,
  onMinScoreChange
}) {
  return (
    <div className="bg-navy-900 border border-slate-800 rounded-xl p-4 space-y-3">
      {/* Search Input Bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by suspect name, alias, FIR number, or jurisdiction..."
          className="w-full bg-navy-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
        />
      </div>

      {/* Filter and Sort Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
        {/* Crime Category */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
            Crime Category:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-navy-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
          >
            <option value="ALL">All Categories</option>
            <option value="Armed Robbery">Armed Robbery & Extortion</option>
            <option value="Vehicle Theft">Vehicle Theft & Gangs</option>
            <option value="Burglary">Burglary & Trespass</option>
            <option value="Cyber Fraud">Cyber Crime & ATM Fraud</option>
            <option value="Contraband">Contraband & Smuggling</option>
          </select>
        </div>

        {/* Legal Status */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
            Custody / Legal Status:
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full bg-navy-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE_WARRANT">Active Warrant (At Large)</option>
            <option value="ON_BAIL">On Bail / Periodic Reporting</option>
            <option value="INVESTIGATION_PENDING">Investigation Pending</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
            Sort Order:
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full bg-navy-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
          >
            <option value="score_desc">Overall Match (High → Low)</option>
            <option value="vector_desc">Biometric Similarity (High → Low)</option>
            <option value="feature_desc">Trait Alignment (High → Low)</option>
            <option value="age_asc">Age (Youngest First)</option>
          </select>
        </div>

        {/* Minimum Match Filter */}
        <div>
          <div className="flex justify-between text-[10px] font-mono uppercase text-slate-400 mb-1">
            <span>Min Match Threshold:</span>
            <span className="text-sky-400 font-bold">{minScore}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            step="5"
            value={minScore}
            onChange={(e) => onMinScoreChange(Number(e.target.value))}
            className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
