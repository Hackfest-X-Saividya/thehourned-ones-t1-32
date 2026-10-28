/**
 * Locally bundled, synthetic graphite sketches used as visual placeholders in
 * the Feature Comparison demo. These are not verified images of any record.
 */
const RECORD_SKETCH_MAP = {
  // Default synthetic demonstration registry
  'CRIM-KA-2026-0912': 1,
  'CRIM-KA-2025-0441': 2,
  'CRIM-KA-2025-0778': 3,
  'CRIM-KA-2024-0319': 4,
  'CRIM-KA-2026-1102': 5,

  // Built-in sample dataset: Karnataka State Special Taskforce
  'CUST-TF-2026-001': 6,
  'CUST-TF-2026-002': 7,
  'CUST-TF-2026-003': 8,
  'CUST-TF-2026-004': 9,
  'CUST-TF-2026-005': 10,

  // Built-in sample dataset: Bengaluru Metro Robbery Cell
  'ROB-BLR-101': 1,
  'ROB-BLR-102': 7,
  'ROB-BLR-103': 3
};

function stableNumber(value) {
  const text = String(value || 'synthetic-record');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return (hash % 10) + 1;
}

/** Return a stable local sketch asset for a record, including imported records. */
export function getEvaluatedSketchForRecord(record) {
  const recordKey = record?.suspectId || record?.firNumber || record?.fullName;
  const number = RECORD_SKETCH_MAP[record?.suspectId] || stableNumber(recordKey);
  const paddedNumber = String(number).padStart(3, '0');
  const baseUrl = import.meta.env.BASE_URL || '/';

  return {
    id: `FACE-${paddedNumber}`,
    src: `${baseUrl}evaluated-sketches/face_${paddedNumber}.jpg`
  };
}
