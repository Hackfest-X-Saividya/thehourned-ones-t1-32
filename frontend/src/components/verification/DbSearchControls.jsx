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
    <div className="bg-[#111B2B] border border-[#29374B] rounded-xl p-4 space-y-3 shadow-sm">
      {/* Search Input Bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77879D]"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by suspect name, alias, FIR number, or jurisdiction..."
          className="w-full bg-[#0B1120] border border-[#29374B] rounded-lg pl-9 pr-4 py-2 text-xs text-[#E5EDF7] placeholder:text-[#77879D] focus:outline-none focus:border-[#60A5FA] transition-colors"
        />
      </div>

      {/* Filter and Sort Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Crime Category */}
        <div>
          <label className="block text-[11px] font-medium text-[#A2B1C5] mb-1.5">
            Crime Category:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-[#0B1120] border border-[#29374B] rounded-lg px-2.5 py-1.5 text-xs text-[#E5EDF7] focus:outline-none focus:border-[#60A5FA] transition-colors"
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
          <label className="block text-[11px] font-medium text-[#A2B1C5] mb-1.5">
            Custody / Legal Status:
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full bg-[#0B1120] border border-[#29374B] rounded-lg px-2.5 py-1.5 text-xs text-[#E5EDF7] focus:outline-none focus:border-[#60A5FA] transition-colors"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE_WARRANT">Active Warrant (At Large)</option>
            <option value="ON_BAIL">On Bail / Periodic Reporting</option>
            <option value="INVESTIGATION_PENDING">Investigation Pending</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-[11px] font-medium text-[#A2B1C5] mb-1.5">
            Sort Order:
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full bg-[#0B1120] border border-[#29374B] rounded-lg px-2.5 py-1.5 text-xs text-[#E5EDF7] focus:outline-none focus:border-[#60A5FA] transition-colors"
          >
            <option value="score_desc">Overall Match (High → Low)</option>
            <option value="vector_desc">Biometric Similarity (High → Low)</option>
            <option value="feature_desc">Trait Alignment (High → Low)</option>
            <option value="age_asc">Age (Youngest First)</option>
          </select>
        </div>

        {/* Minimum Match Filter */}
        <div>
          <div className="flex justify-between text-[11px] font-medium text-[#A2B1C5] mb-1.5">
            <span>Min Match Threshold:</span>
            <span className="text-[#60A5FA] font-semibold font-mono">{minScore}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            step="5"
            value={minScore}
            onChange={(e) => onMinScoreChange(Number(e.target.value))}
            className="w-full accent-[#60A5FA] cursor-pointer h-1.5 bg-[#172337] rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

