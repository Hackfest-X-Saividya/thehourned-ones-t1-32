import React, { useState, useMemo, useEffect } from 'react';
import { useSession } from '../../context/SessionContext';
import { fetchAuditLogs } from '../../services/api';
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
  ChevronsRight,
  Database,
  RefreshCw,
  FileCode
} from 'lucide-react';
import Badge from '../common/Badge';

export default function AuditLogTable() {
  const { auditLogs } = useSession();

  const [activeLedgerType, setActiveLedgerType] = useState('d1'); // 'd1' | 'blockchain'
  const [d1Logs, setD1Logs] = useState([]);
  const [isLoadingD1, setIsLoadingD1] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [sortDirection, setSortDirection] = useState('desc'); // 'desc' = newest first
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Load real Cloudflare D1 audit records
  const loadD1Audit = async () => {
    setIsLoadingD1(true);
    try {
      const data = await fetchAuditLogs();
      if (Array.isArray(data)) {
        setD1Logs(data);
      }
    } catch (err) {
      console.warn('Failed loading D1 audit records:', err);
    } finally {
      setIsLoadingD1(false);
    }
  };

  useEffect(() => {
    loadD1Audit();
  }, []);

  // Filter and sort logs depending on active tab
  const filteredLogs = useMemo(() => {
    let logs = activeLedgerType === 'd1' ? [...d1Logs] : [...auditLogs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (activeLedgerType === 'd1') {
        logs = logs.filter(
          (l) =>
            (l.userEmail && l.userEmail.toLowerCase().includes(q)) ||
            (l.userId && l.userId.toLowerCase().includes(q)) ||
            (l.requestId && l.requestId.toLowerCase().includes(q)) ||
            (l.action && l.action.toLowerCase().includes(q)) ||
            (l.resourceId && l.resourceId.toLowerCase().includes(q))
        );
      } else {
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
    }

    if (selectedAction !== 'ALL') {
      logs = logs.filter((l) => (l.action || '').includes(selectedAction));
    }

    logs.sort((a, b) => {
      if (activeLedgerType === 'd1') {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return sortDirection === 'desc' ? timeB - timeA : timeA - timeB;
      }
      return sortDirection === 'desc' ? b.blockIndex - a.blockIndex : a.blockIndex - b.blockIndex;
    });

    return logs;
  }, [activeLedgerType, d1Logs, auditLogs, searchQuery, selectedAction, sortDirection]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getActionBadge = (action = '') => {
    if (action.includes('TAMPER')) return <Badge variant="danger">{action}</Badge>;
    if (action.includes('FINALIZED') || action.includes('SELECT')) return <Badge variant="success">{action}</Badge>;
    if (action.includes('GENERATE')) return <Badge variant="info">GENERATE</Badge>;
    if (action.includes('EDIT') || action.includes('REFINED')) return <Badge variant="cyan">EDIT / INPAINT</Badge>;
    if (action.includes('RESTORE')) return <Badge variant="purple">RESTORE</Badge>;
    if (action.includes('VERIFICATION') || action.includes('DB')) return <Badge variant="warning">DB QUERY</Badge>;
    if (action.includes('EXPORT')) return <Badge variant="neutral">EXPORT</Badge>;
    return <Badge variant="neutral">{action}</Badge>;
  };

  return (
<div className="bg-[#111B2B] border border-[#29374B] rounded-xl overflow-hidden space-y-4 p-4 shadow-sm">
      {/* Ledger Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#29374B] pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#0B1120] rounded-lg border border-[#29374B]">
          <button
            type="button"
            onClick={() => {
              setActiveLedgerType('d1');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-2 transition-all ${
              activeLedgerType === 'd1'
                ? 'bg-[#60A5FA] text-[#0B1120] shadow'
                : 'text-[#A2B1C5] hover:text-[#E5EDF7]'
            }`}
          >
            <Database size={13} />
            <span>Cloudflare D1 Audit Records (Live DB)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#111B2B] text-[#60A5FA] font-bold">
              {d1Logs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveLedgerType('blockchain');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-2 transition-all ${
              activeLedgerType === 'blockchain'
                ? 'bg-[#60A5FA] text-[#0B1120] shadow'
                : 'text-[#A2B1C5] hover:text-[#E5EDF7]'
            }`}
          >
            <Lock size={13} />
            <span>Cryptographic SHA-256 Chain</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#111B2B] text-[#60A5FA] font-bold">
              {auditLogs.length}
            </span>
          </button>
        </div>

        {activeLedgerType === 'd1' && (
          <button
            type="button"
            onClick={loadD1Audit}
            disabled={isLoadingD1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0B1120] border border-[#29374B] text-xs text-[#60A5FA] hover:text-[#93C5FD] transition-colors"
          >
            <RefreshCw size={13} className={isLoadingD1 ? 'animate-spin' : ''} />
            <span>Refresh D1 Records</span>
          </button>
        )}
      </div>
      {/* Table Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77879D]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
placeholder={
              activeLedgerType === 'd1'
                ? 'Filter by request ID, user, action...'
                : 'Filter by officer, action, session...'
            }
            className="w-full bg-[#0B1120] border border-[#29374B] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#E5EDF7] placeholder:text-[#77879D] focus:outline-none focus:border-[#60A5FA] transition-colors"
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
            className="bg-[#0B1120] border border-[#29374B] rounded-lg px-2.5 py-1.5 text-xs text-[#E5EDF7] focus:outline-none focus:border-[#60A5FA] transition-colors"
          >
            <option value="ALL">All Forensic Actions</option>
            <option value="GENERATE">Image Generation</option>
            <option value="EDIT">Image Edit / Inpainting</option>
            <option value="SELECT">Candidate Selection</option>
            <option value="RESTORE">Version Restoration</option>
            <option value="CASE">Case Operations</option>
            <option value="AUDIT">Audit Inspection</option>
          </select>

          <button
            onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1120] border border-[#29374B] text-xs text-[#A2B1C5] hover:text-[#E5EDF7] transition-colors"
          >
            <ArrowUpDown size={13} />
            <span>{sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto rounded-lg border border-[#29374B]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0B1120] text-[#77879D] uppercase tracking-wider text-[11px] font-medium border-b border-[#29374B]">
              <th className="py-3 px-3 w-10 text-center"></th>
              {activeLedgerType === 'd1' ? (
                <>
                  <th className="py-3 px-3">Request ID</th>
                  <th className="py-3 px-4">Officer Identity</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-4">Resource Target</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                </>
              ) : (
                <>
                  <th className="py-3 px-3">Block #</th>
                  <th className="py-3 px-4">Member Identity</th>
                  <th className="py-3 px-4">Session / Case</th>
                  <th className="py-3 px-3">Image ID</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Cryptographic Link</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#29374B]">
            {paginatedLogs.length === 0 ? (
              <tr>
<td colSpan={activeLedgerType === 'd1' ? 7 : 8} className="py-8 text-center text-[#77879D] font-mono">
                  {isLoadingD1
                    ? 'Fetching audit trail from Cloudflare D1...'
                    : 'No audit records match the selected query criteria.'}
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => {
                const rowKey = activeLedgerType === 'd1' ? log.id || log.requestId : log.blockIndex;
                const isExpanded = expandedId === rowKey;

                return (
                  <React.Fragment key={rowKey}>
                    <tr
                      onClick={() => toggleExpand(rowKey)}
                      className={`cursor-pointer transition-colors ${
                        isExpanded ? 'bg-[#172337]/60' : 'hover:bg-[#172337]/40'
                      }`}
                    >
                      <td className="py-3 px-3 text-center text-[#77879D]">
                        {isExpanded ? (
                          <ChevronDown size={14} className="text-[#60A5FA]" />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </td>
{activeLedgerType === 'd1' ? (
                        <>
                          <td className="py-3 px-3 font-mono font-semibold text-[#60A5FA]">
                            {log.requestId}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#E5EDF7]">{log.userEmail || log.userId}</div>
                            <div className="text-[10px] text-[#77879D] font-mono uppercase">{log.userRole || 'officer'}</div>
                          </td>
                          <td className="py-3 px-3">{getActionBadge(log.action)}</td>
                          <td className="py-3 px-4 font-mono text-[#A2B1C5]">
                            <div className="text-[#FBBF24] font-semibold">{log.resourceId || 'N/A'}</div>
                            <div className="text-[10px] text-[#77879D] uppercase">{log.resourceType}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] font-mono font-semibold text-[#2DD4BF] bg-teal-950/60 border border-teal-800/60 px-1.5 py-0.5 rounded">
                              {log.status || 'SUCCESS'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[#A2B1C5] font-mono text-[11px]">
                            <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                            <div className="text-[#77879D]">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-3 font-mono font-semibold text-[#60A5FA]">
                            #{log.blockIndex}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#E5EDF7]">{log.memberName}</div>
                            <div className="text-[10px] text-[#77879D] font-mono">{log.memberId}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[#A2B1C5]">
                            <div>{log.sessionId}</div>
                            <div className="text-[10px] text-[#77879D]">{log.caseNumber}</div>
                          </td>
                          <td className="py-3 px-3 font-mono text-[#FBBF24]">
                            {log.imageId || 'N/A'}
                          </td>
                          <td className="py-3 px-3">{getActionBadge(log.action)}</td>
                          <td className="py-3 px-4 text-[#A2B1C5] font-mono text-[11px]">
                            <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                            <div className="text-[#77879D]">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[10px]">
                            <div className="text-[#77879D]">
                              Prev: {log.prevHash ? `${log.prevHash.slice(0, 10)}...` : '0000...'}
                            </div>
                            <div className="text-[#2DD4BF] font-semibold">
                              Curr: {log.currHash ? `${log.currHash.slice(0, 10)}...` : 'computing...'}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>

                    {/* Expandable Inspection Details */}
                    {isExpanded && (
                      <tr>
<td colSpan={activeLedgerType === 'd1' ? 7 : 8} className="p-0 bg-[#0B1120]">
                          {activeLedgerType === 'd1' ? (
                            <div className="p-4 border-t border-[#29374B] space-y-2 bg-[#0B1120] text-xs font-mono">
                              <div className="flex items-center justify-between text-[#A2B1C5]">
                                <span className="font-semibold text-[#60A5FA] flex items-center gap-1.5">
                                  <FileCode size={13} /> D1 Audit Payload Details ({log.id})
                                </span>
                                <span className="text-[#77879D]">Case ID: {log.caseId}</span>
                              </div>
                              <pre className="p-3 bg-[#111B2B] border border-[#29374B] rounded-lg text-[#E5EDF7] text-[11px] overflow-x-auto leading-relaxed">
                                {JSON.stringify(log.details || log, null, 2)}
                              </pre>
                            </div>
                          ) : (
                            <BlockHashInspector log={log} />
                          )}
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#77879D] pt-2 font-mono">
        <div>
          Showing {filteredLogs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} blocks
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1 rounded bg-[#0B1120] border border-[#29374B] text-[#A2B1C5] hover:text-[#E5EDF7] disabled:opacity-40 transition-colors"
            aria-label="First page"
          >
            <ChevronsLeft size={14} />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 rounded bg-[#0B1120] border border-[#29374B] text-[#A2B1C5] hover:text-[#E5EDF7] disabled:opacity-40 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>

          <span className="px-2.5 py-1 text-[#E5EDF7]">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1 rounded bg-[#0B1120] border border-[#29374B] text-[#A2B1C5] hover:text-[#E5EDF7] disabled:opacity-40 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1 rounded bg-[#0B1120] border border-[#29374B] text-[#A2B1C5] hover:text-[#E5EDF7] disabled:opacity-40 transition-colors"
            aria-label="Last page"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

