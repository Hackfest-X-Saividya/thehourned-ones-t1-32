import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import {
  CATEGORIES,
  FEATURE_CATALOGUE
} from '../data/featureCatalogue';
import {
  ScanFace,
  Search,
  Check,
  CheckCircle2,
  X,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Filter,
  Layers,
  Compass,
  Smile,
  Eye,
  Minus,
  Triangle,
  MessageCircle,
  User,
  Square,
  Bookmark,
  Info
} from 'lucide-react';

const CATEGORY_ICONS = {
  'all': Layers,
  'face-shapes': Smile,
  'eyes': Eye,
  'eyebrows': Minus,
  'nose': Triangle,
  'lips-mouth': MessageCircle,
  'facial-hair': User,
  'forehead-hairline': Sparkles,
  'chin-jawline': Square,
  'distinguishing-marks': Bookmark
};

export default function FeatureCataloguePage() {
  const navigate = useNavigate();
  const {
    witnessPrompt,
    setWitnessPrompt,
    selectedCatalogueFeatures = [],
    toggleCatalogueFeature,
    clearCatalogueFeatures,
    caseNumber,
    caseInfo
  } = useSession();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSelectedOnly, setFilterSelectedOnly] = useState(false);
  const [previewModalItem, setPreviewModalItem] = useState(null);

  // Set of selected IDs for O(1) lookup
  const selectedIdSet = useMemo(() => {
    return new Set(selectedCatalogueFeatures.map((f) => f.id));
  }, [selectedCatalogueFeatures]);

  // Compute category item counts dynamically
  const categoryCounts = useMemo(() => {
    const counts = { all: FEATURE_CATALOGUE.length };
    FEATURE_CATALOGUE.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered catalogue items
  const filteredItems = useMemo(() => {
    return FEATURE_CATALOGUE.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      // Selected only filter
      if (filterSelectedOnly && !selectedIdSet.has(item.id)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inLabel = item.label.toLowerCase().includes(q);
        const inDesc = (item.description || '').toLowerCase().includes(q);
        const inDescriptor = (item.descriptor || '').toLowerCase().includes(q);
        const inCategory = item.category.toLowerCase().includes(q);
        return inLabel || inDesc || inDescriptor || inCategory;
      }
      return true;
    });
  }, [activeCategory, filterSelectedOnly, selectedIdSet, searchQuery]);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <section className="bg-[#111B2B] border-b border-[#29374B] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded bg-[#60A5FA]/15 text-[#60A5FA] border border-[#60A5FA]/30">
                <ScanFace size={16} />
              </span>
              <h1 className="text-lg font-bold text-[#E5EDF7] font-mono tracking-wide">
                Witness Feature Catalogue
              </h1>
              <span className="text-[10px] font-mono bg-[#172337] text-[#60A5FA] border border-[#29374B] px-2 py-0.5 rounded">
                85 Visual References
              </span>
            </div>
            <p className="text-xs text-[#77879D]">
              Click any anatomical feature to append its descriptor to the witness statement. Click again to deselect.
            </p>
          </div>

          {/* Quick Navigation to Studio */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-3.5 py-1.5 rounded-lg bg-[#60A5FA] hover:bg-[#3B82F6] text-[#0B1120] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Compass size={14} />
              <span>Back to Studio ({selectedCatalogueFeatures.length} chosen)</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* Synchronized Description & Selections Dock (Sticky Bar) */}
      <div className="sticky top-16 z-30 bg-[#0B1120]/95 backdrop-blur-md border-b border-[#29374B] shadow-md py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-2.5">
          {/* Top row: Label, count badge, clear button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#A2B1C5] flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#60A5FA]" />
                Live Synchronized Witness Statement:
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#172337] text-[#2DD4BF] border border-[#2DD4BF]/40">
                {selectedCatalogueFeatures.length} Feature{selectedCatalogueFeatures.length === 1 ? '' : 's'} Selected
              </span>
            </div>

            {selectedCatalogueFeatures.length > 0 && (
              <button
                type="button"
                onClick={clearCatalogueFeatures}
                className="text-[11px] text-[#F87171] hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw size={11} />
                <span>Clear Selections</span>
              </button>
            )}
          </div>

          {/* Live Editable Textarea */}
          <div className="relative">
            <textarea
              rows={2}
              value={witnessPrompt}
              onChange={(e) => setWitnessPrompt(e.target.value)}
              placeholder="Select features from the catalogue below or type witness testimony..."
              className="w-full bg-[#111B2B] border border-[#29374B] rounded-lg p-2.5 text-xs text-[#E5EDF7] placeholder:text-[#77879D] focus:outline-none focus:border-[#60A5FA] resize-none font-sans min-h-[54px] shadow-inner"
            />
            <div className="absolute right-2 bottom-2 text-[10px] font-mono text-[#77879D]">
              {witnessPrompt.length}/1000
            </div>
          </div>

          {/* Selected Feature Chips */}
          {selectedCatalogueFeatures.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
              <span className="text-[10px] text-[#77879D] uppercase tracking-wider shrink-0 mr-1 font-mono">
                Active:
              </span>
              {selectedCatalogueFeatures.map((feat) => (
                <span
                  key={feat.id}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#60A5FA]/15 text-[#60A5FA] border border-[#60A5FA]/40 text-[11px] font-mono shrink-0 animate-in fade-in duration-200"
                >
                  <Check size={11} className="stroke-[3]" />
                  <span>{feat.label}</span>
                  <button
                    type="button"
                    onClick={() => toggleCatalogueFeature(feat)}
                    title={`Deselect ${feat.label}`}
                    className="p-0.5 hover:bg-[#60A5FA]/30 rounded-full text-[#60A5FA] hover:text-white transition-colors cursor-pointer ml-0.5"
                  >
                    <X size={10} className="stroke-[2.5]" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Search & Category Filter Controls */}
        <div className="space-y-3">
          {/* Search bar & toggles */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77879D]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by feature name or descriptor (e.g. almond, goatee, stubble, scar, button nose)..."
                className="w-full pl-9 pr-8 py-2 bg-[#111B2B] border border-[#29374B] rounded-lg text-xs text-[#E5EDF7] placeholder:text-[#77879D] focus:outline-none focus:border-[#60A5FA] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#77879D] hover:text-[#E5EDF7]"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Selected only toggle */}
            <button
              type="button"
              onClick={() => setFilterSelectedOnly((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                filterSelectedOnly
                  ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]'
                  : 'bg-[#111B2B] text-[#A2B1C5] border border-[#29374B] hover:border-[#60A5FA]/40'
              }`}
            >
              <CheckCircle2 size={13} />
              <span>Selected Only ({selectedCatalogueFeatures.length})</span>
            </button>
          </div>

          {/* Category Pills Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] || Layers;
              const count = categoryCounts[cat.id] || 0;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setFilterSelectedOnly(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#60A5FA] text-[#0B1120] font-bold shadow-sm'
                      : 'bg-[#111B2B] text-[#A2B1C5] hover:text-[#E5EDF7] hover:bg-[#172337] border border-[#29374B]'
                  }`}
                >
                  <Icon size={13} />
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-[#0B1120]/30 text-[#0B1120]' : 'bg-[#0B1120] text-[#77879D]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Info Bar */}
        <div className="flex items-center justify-between text-xs text-[#77879D] pb-1 border-b border-[#29374B]">
          <span>
            Showing <strong className="text-[#E5EDF7]">{filteredItems.length}</strong> reference image{filteredItems.length === 1 ? '' : 's'}
            {activeCategory !== 'all' && ` in ${CATEGORIES.find((c) => c.id === activeCategory)?.label}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>

          <span className="text-[11px] font-mono text-[#77879D]">
            Click tile to toggle selection
          </span>
        </div>

        {/* Grid of Feature Cards */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {filteredItems.map((item) => {
              const isSelected = selectedIdSet.has(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => toggleCatalogueFeature(item)}
                  className={`group relative bg-[#111B2B] rounded-xl overflow-hidden border transition-all cursor-pointer flex flex-col ${
                    isSelected
                      ? 'border-[#2DD4BF] ring-2 ring-[#2DD4BF]/30 shadow-lg shadow-teal-500/10'
                      : 'border-[#29374B] hover:border-[#60A5FA]/60 hover:-translate-y-0.5'
                  }`}
                >
                  {/* Selected Indicator Badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 z-10 bg-[#2DD4BF] text-[#0B1120] font-bold text-[10px] font-mono px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                      <Check size={11} className="stroke-[3]" />
                      <span>SELECTED</span>
                    </div>
                  )}

                  {/* Thumbnail Image Display */}
                  <div className="relative aspect-square w-full bg-[#0B1120] flex items-center justify-center overflow-hidden border-b border-[#29374B]">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.label}
                        loading="lazy"
                        className="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-[11px] text-[#77879D] p-3 text-center">
                        Image Preview
                      </div>
                    )}

                    {/* Category Overlay Tag */}
                    <span className="absolute bottom-1.5 left-1.5 bg-[#0B1120]/90 backdrop-blur-sm text-[9px] font-mono text-[#77879D] px-1.5 py-0.5 rounded border border-[#29374B]">
                      {CATEGORIES.find((c) => c.id === item.category)?.label || item.category}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-2.5 flex flex-col flex-1 justify-between gap-1.5">
                    <div>
                      <h3 className={`text-xs font-semibold leading-snug line-clamp-1 ${isSelected ? 'text-[#2DD4BF]' : 'text-[#E5EDF7]'}`}>
                        {item.label}
                      </h3>
                      {item.description && (
                        <p className="text-[10px] text-[#77879D] line-clamp-2 mt-0.5 leading-tight">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Appends Descriptor Hint */}
                    <div className="pt-1.5 border-t border-[#29374B]/60 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#60A5FA] truncate" title={`Appends: "${item.descriptor}"`}>
                        +{item.descriptor}
                      </span>
                      <span className={`text-[10px] shrink-0 font-bold ${isSelected ? 'text-[#2DD4BF]' : 'text-[#77879D]'}`}>
                        {isSelected ? '✓ Added' : '+ Add'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Search State */
          <div className="py-16 text-center space-y-3 bg-[#111B2B]/40 rounded-xl border border-[#29374B] p-8">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#172337] flex items-center justify-center text-[#77879D]">
              <Search size={22} />
            </div>
            <h3 className="text-sm font-semibold text-[#E5EDF7]">
              No matching reference features found
            </h3>
            <p className="text-xs text-[#77879D] max-w-md mx-auto">
              No features match your current filter criteria. Try resetting your search query or selecting a different category tab.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setFilterSelectedOnly(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#172337] hover:bg-[#203049] text-xs text-[#60A5FA] border border-[#29374B] cursor-pointer"
            >
              Reset Filters & Show All (85)
            </button>
          </div>
        )}

        {/* Forensic Disclaimer */}
        <div className="p-3 bg-[#111B2B]/60 rounded-lg border border-[#29374B] text-[11px] text-[#77879D] flex items-start gap-2.5">
          <Info size={14} className="text-[#60A5FA] shrink-0 mt-0.5" />
          <p>
            <strong className="text-[#A2B1C5]">Forensic Reference Disclaimer:</strong> This visual reference catalogue is designed strictly as an anatomical memory retrieval and articulation aid for eyewitness recall. All imagery is neutral morphological reference data and implies no character, behavioral, or demographic attributes.
          </p>
        </div>
      </main>
    </div>
  );
}

