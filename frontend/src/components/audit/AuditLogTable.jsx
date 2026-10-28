import React, { useState, useMemo } from 'react';
import { useSession } from '../../context/SessionContext';
import BlockHashInspector from './BlockHashInspector';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Calendar,
  Lock,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import Badge from '../common/Badge';

export default function AuditLogTable() {
  const { auditLogs } = useSession();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [sortDirection, setSortDirection] = useState('desc'); // 'desc' = newest first
  const [expandedBlockIndex, setExpandedBlockIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter and sort logs
  const filteredLogs = useMemo(() => {
    let logs = [...auditLogs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.memberName.toLowerCase().includes(q) ||
          l.memberId.toLowerCase().includes(q) ||
          l.sessionId.toLowerCase().includes(q) ||
          l.imageId.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          (l.metadata && l.metadata.toLowerCase().includes(q))
      );
    }

    if (selectedAction !== 'ALL') {
      logs = logs.filter((l) => l.action.includes(selectedAction));
    }

    logs.sort((a, b) => {
      if (sortDirection === 'desc') {
        return b.blockIndex - a.blockIndex;
      }
      return a.blockIndex - b.blockIndex;
    });

    return logs;
  }, [auditLogs, searchQuery, selectedAction, sortDirection]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const toggleExpand = (blockIndex) => {
    setExpandedBlockIndex(expandedBlockIndex === blockIndex ? null : blockIndex);
  };

  const getActionBadge = (action) => {
    if (action.includes('TAMPER')) return <Badge variant="danger">{action}</Badge>;
    if (action.includes('FINALIZED')) return <Badge variant="success">FINALIZED</Badge>;
    if (action.includes('GENERATED')) return <Badge variant="info">GENERATED</Badge>;
    if (action.includes('REFINED')) return <Badge variant="cyan">REFINED</Badge>;
    if (action.includes('VERIFICATION') || action.includes('DB')) return <Badge variant="warning">DB QUERY</Badge>;
    if (action.includes('EXPORT')) return <Badge variant="neutral">EXPORT</Badge>;
    return <Badge variant="neutral">{action}</Badge>;
  };

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-xl overflow-hidden space-y-4 p-4">
      {/* Table Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Filter by officer, action, session..."
            className="w-full bg-navy-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
          />
        </div>

        {/* Action Type & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-navy-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
          >
            <option value="ALL">All Forensic Actions</option>
            <option value="SESSION">Session Initialization</option>
            <option value="GENERATED">Node Generation</option>
            <option value="REFINED">Composite Refinement</option>
            <option value="FINALIZED">Finalized Image</option>
            <option value="DB">Criminal DB Queries</option>
            <option value="EXPORT">Dossier PDF Export</option>
          </select>

          <button
            onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <ArrowUpDown size={13} />
            <span>{sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-navy-950/90 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <th className="py-3 px-3 w-10 text-center"></th>
              <th className="py-3 px-3">Block #</th>
              <th className="py-3 px-4">Member Identity</th>
              <th className="py-3 px-4">Session / Case</th>
              <th className="py-3 px-3">Image ID</th>
              <th className="py-3 px-3">Action</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Cryptographic Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-slate-500 font-mono">
                  No audit log blocks match the selected query criteria.
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => {
                const isExpanded = expandedBlockIndex === log.blockIndex;

                return (
                  <React.Fragment key={log.blockIndex}>
                    <tr
                      onClick={() => toggleExpand(log.blockIndex)}
                      className={`cursor-pointer transition-colors ${
                        isExpanded ? 'bg-navy-950/80' : 'hover:bg-navy-950/50'
                      }`}
                    >
                      <td className="py-3 px-3 text-center text-slate-500">
                        {isExpanded ? (
                          <ChevronDown size={14} className="text-sky-400" />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-sky-400">
                        #{log.blockIndex}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{log.memberName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{log.memberId}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        <div>{log.sessionId}</div>
                        <div className="text-[10px] text-slate-500">{log.caseNumber}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-amber-300">
                        {log.imageId || 'N/A'}
                      </td>
                      <td className="py-3 px-3">{getActionBadge(log.action)}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                        <div className="text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px]">
                        <div className="text-slate-500">
                          Prev: {log.prevHash ? `${log.prevHash.slice(0, 10)}...` : '0000...'}
                        </div>
                        <div className="text-emerald-400 font-bold">
                          Curr: {log.currHash ? `${log.currHash.slice(0, 10)}...` : 'computing...'}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Inspection Details */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="8" className="p-0 bg-navy-950">
                          <BlockHashInspector log={log} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 pt-2 font-mono">
        <div>
          Showing {filteredLogs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} blocks
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1 rounded bg-navy-950 border border-slate-800 disabled:opacity-40"
            aria-label="First page"
          >
            <ChevronsLeft size={14} />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 rounded bg-navy-950 border border-slate-800 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>

          <span className="px-2.5 py-1 text-slate-200">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1 rounded bg-navy-950 border border-slate-800 disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1 rounded bg-navy-950 border border-slate-800 disabled:opacity-40"
            aria-label="Last page"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
