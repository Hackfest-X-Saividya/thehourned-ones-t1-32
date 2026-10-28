import React from 'react';
import BlockchainStatusHeader from '../components/audit/BlockchainStatusHeader';
import AuditLogTable from '../components/audit/AuditLogTable';

export default function AuditLogsPage() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Blockchain Status & Integrity Verification Header */}
      <BlockchainStatusHeader />

      {/* Main Filterable Audit Table */}
      <AuditLogTable />
    </div>
  );
}
