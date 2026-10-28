import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateBlockHash, calculateSha256 } from '../utils/hashUtils';

const SessionContext = createContext();

const INITIAL_SKETCH = {
  imageId: 'IMG-SKETCH-1042',
  imageUrl: '/api/images/IMG-SKETCH-1042/file',
  prompt: 'Male, early 30s, sharp square jawline, deep-set almond eyes, straight narrow nose, 3-day stubble, vertical scar above left eyebrow',
  seed: 1042,
  iteration: 1,
  parentId: null,
  createdAt: '2026-10-28T09:30:00.000Z',
  imageHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
  confidenceScore: 94.2,
  changeDescription: 'Initial witness testimony composite generated via forensic multimodal pipeline',
  features: {
    faceShape: 'Angular Oval',
    jawline: 'Sharp Square',
    eyes: 'Deep-set Almond',
    nose: 'Straight Narrow Bridge',
    facialHair: '3-Day Heavy Stubble',
    marks: 'Scar on Left Eyebrow',
    ageRange: '28-35'
  }
};

const INITIAL_FLOW_NODES = [
  {
    id: 'node-prompt-root',
    type: 'promptNode',
    position: { x: 40, y: 100 },
    data: {}
  },
  {
    id: 'node-extractor-root',
    type: 'featureExtractorNode',
    position: { x: 410, y: 100 },
    data: {
      features: INITIAL_SKETCH.features,
      status: 'EXTRACTED',
      confidence: 94.8
    }
  },
  {
    id: 'node-sketch-1042',
    type: 'candidateSketchNode',
    position: { x: 780, y: 60 },
    data: {
      sketch: INITIAL_SKETCH,
      isFinalized: true
    }
  }
];

const INITIAL_FLOW_EDGES = [
  {
    id: 'edge-prompt-extractor',
    source: 'node-prompt-root',
    sourceHandle: 'prompt-out',
    target: 'node-extractor-root',
    targetHandle: 'feature-in',
    animated: true,
    style: { stroke: '#38BDF8', strokeWidth: 2 }
  },
  {
    id: 'edge-extractor-sketch-1042',
    source: 'node-extractor-root',
    sourceHandle: 'feature-out',
    target: 'node-sketch-1042',
    targetHandle: 'sketch-in',
    animated: true,
    style: { stroke: '#10B981', strokeWidth: 2 }
  }
];

export function SessionProvider({ children }) {
  // Active Officer & Jurisdiction Identity
  const [officer] = useState({
    id: 'OFF-KA-402',
    name: 'Insp. Vikram Rao',
    unit: 'Cyber & Forensic Crime Cell',
    badge: 'KSP-CID-772',
    rank: 'Senior Forensic Investigator'
  });

  const [sessionId] = useState('SES-2026-8841');
  const [caseNumber] = useState('FIR-BLR-2026-0194');
  const [caseInfo] = useState({
    incidentType: 'Armed Commercial Robbery',
    policeStation: 'Hebbal Police Station, Bengaluru',
    witnessCode: 'WIT-BLR-099',
    interviewDate: '28 Oct 2026'
  });

  // Stored Session-wise image iterations
  const [sessionImages, setSessionImages] = useState([INITIAL_SKETCH]);

  // Selected Finalized Composite for DB verification and high-res export
  const [finalizedSketch, setFinalizedSketch] = useState(INITIAL_SKETCH);

  // Persisted Graph Canvas Nodes & Edges across page navigations
  const [canvasNodes, setCanvasNodes] = useState(null);
  const [canvasEdges, setCanvasEdges] = useState(null);

  // Criminal Database Integrator State: 'SYNTHETIC_DEMO' | 'CUSTOM_IMPORTED'
  const [registryMode, setRegistryMode] = useState(() => {
    try {
      return localStorage.getItem('forensic_registry_mode') || 'SYNTHETIC_DEMO';
    } catch {
      return 'SYNTHETIC_DEMO';
    }
  });

  const [customDbRecords, setCustomDbRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('forensic_custom_db');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const updateCustomDatabase = useCallback((records, mode = 'CUSTOM_IMPORTED') => {
    setCustomDbRecords(records);
    setRegistryMode(mode);
    try {
      localStorage.setItem('forensic_custom_db', JSON.stringify(records));
      localStorage.setItem('forensic_registry_mode', mode);
    } catch {
      // Ignore
    }
  }, []);

  const resetToDefaultRegistry = useCallback(() => {
    setRegistryMode('SYNTHETIC_DEMO');
    try {
      localStorage.setItem('forensic_registry_mode', 'SYNTHETIC_DEMO');
    } catch {
      // Ignore
    }
  }, []);

  // React Flow Persistent Graph State across tab navigation
  const [flowNodes, setFlowNodes] = useState(INITIAL_FLOW_NODES);
  const [flowEdges, setFlowEdges] = useState(INITIAL_FLOW_EDGES);

  // Witness input prompt and language state across tab navigation
  const [witnessPrompt, setWitnessPrompt] = useState(
    'Male early 30s, sharp square jawline, deep-set almond eyes, straight narrow nose, 3-day stubble, vertical scar above left eyebrow'
  );
  const [witnessLanguage, setWitnessLanguage] = useState('en-IN');

  // Reusable Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Tamper-Proof Cryptographic Blockchain Audit Ledger
  const [auditLogs, setAuditLogs] = useState([
    {
      blockIndex: 1,
      sessionId: 'SES-2026-8841',
      caseNumber: 'FIR-BLR-2026-0194',
      imageId: 'GENESIS',
      memberId: 'OFF-KA-402',
      memberName: 'Insp. Vikram Rao',
      action: 'SESSION_INITIALIZED',
      metadata: 'Forensic session initiated; witness cognitive interview commenced',
      timestamp: '2026-10-28T09:00:00.000Z',
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      currHash: '4a9e8b2c1d3f5a7e9b0c2d4f6a8e1b3c5d7f9a1b2c3d4e5f6a7b8c9d0e1f2a3b'
    },
    {
      blockIndex: 2,
      sessionId: 'SES-2026-8841',
      caseNumber: 'FIR-BLR-2026-0194',
      imageId: 'IMG-SKETCH-1042',
      memberId: 'OFF-KA-402',
      memberName: 'Insp. Vikram Rao',
      action: 'SKETCH_NODE_GENERATED',
      metadata: 'Initial composite sketch generated with seed 1042',
      timestamp: '2026-10-28T09:30:00.000Z',
      prevHash: '4a9e8b2c1d3f5a7e9b0c2d4f6a8e1b3c5d7f9a1b2c3d4e5f6a7b8c9d0e1f2a3b',
      currHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4'
    }
  ]);

  // Synchronously compute Genesis and initial block hashes to ensure genuine cryptographic links
  useEffect(() => {
    async function initAuditHashes() {
      const b1 = auditLogs[0];
      const h1 = await generateBlockHash(b1);
      const b2 = { ...auditLogs[1], prevHash: h1 };
      const h2 = await generateBlockHash(b2);

      setAuditLogs([
        { ...b1, currHash: h1 },
        { ...b2, currHash: h2 }
      ]);
    }
    initAuditHashes();
  }, []);

  // Records a new audit action chained to the previous block's hash
  const recordAuditAction = useCallback(async (action, imageId = 'N/A', metadata = '') => {
    setAuditLogs((prevLogs) => {
      const lastBlock = prevLogs[prevLogs.length - 1];
      const nextIndex = lastBlock.blockIndex + 1;
      const timestamp = new Date().toISOString();

      const blockDraft = {
        blockIndex: nextIndex,
        sessionId,
        caseNumber,
        imageId,
        memberId: officer.id,
        memberName: officer.name,
        action,
        metadata: metadata || `Action executed by ${officer.name} on image ${imageId}`,
        timestamp,
        prevHash: lastBlock.currHash,
        currHash: '' // Will be updated
      };

      // Calculate hash asynchronously and update state
      generateBlockHash(blockDraft).then((calculatedHash) => {
        setAuditLogs((current) =>
          current.map((blk) => (blk.blockIndex === nextIndex ? { ...blk, currHash: calculatedHash } : blk))
        );
      });

      return [...prevLogs, blockDraft];
    });
  }, [sessionId, caseNumber, officer.id, officer.name]);

  // Allows toggling mock tampering for demonstration of cryptographic detection
  const simulateTamper = useCallback((targetBlockIndex) => {
    setAuditLogs((prev) =>
      prev.map((blk) => {
        if (blk.blockIndex === targetBlockIndex) {
          return {
            ...blk,
            action: `${blk.action}_TAMPERED`,
            metadata: 'UNAUTHORIZED_DATA_MODIFICATION_DETECTED'
          };
        }
        return blk;
      })
    );
    addToast(`Tamper simulated on Block #${targetBlockIndex}! Run integrity check to detect.`, 'warning');
  }, [addToast]);

  // Re-hash chain to restore integrity
  const restoreChainIntegrity = useCallback(async () => {
    const restored = [];
    for (let i = 0; i < auditLogs.length; i++) {
      const blk = { ...auditLogs[i] };
      if (i === 0) {
        blk.prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
      } else {
        blk.prevHash = restored[i - 1].currHash;
      }
      // Strip any tamper markers
      blk.action = blk.action.replace('_TAMPERED', '');
      blk.currHash = await generateBlockHash(blk);
      restored.push(blk);
    }
    setAuditLogs(restored);
    addToast('Cryptographic audit chain restored and re-hashed.', 'success');
  }, [auditLogs, addToast]);

  // Adds a newly generated or refined sketch to the session
  const addSessionSketch = useCallback((newSketch) => {
    setSessionImages((prev) => [newSketch, ...prev]);
    setFinalizedSketch(newSketch);
  }, []);

  // Adds multiple candidate sketches generated in stage 1
  const addSessionSketches = useCallback((newSketches, activeCandidateIndex = 0) => {
    if (!newSketches || newSketches.length === 0) return;
    setSessionImages((prev) => [...newSketches, ...prev]);
    if (newSketches[activeCandidateIndex]) {
      setFinalizedSketch(newSketches[activeCandidateIndex]);
    }
  }, []);

  // Finalizes the sketch for database search & PDF export and synchronizes node states
  const finalizeSketch = useCallback((sketch) => {
    setFinalizedSketch(sketch);
    setFlowNodes((prev) =>
      prev.map((n) => {
        if (n.type === 'candidateSketchNode') {
          return {
            ...n,
            data: {
              ...n.data,
              isFinalized: n.data?.sketch?.imageId === sketch.imageId
            }
          };
        }
        return n;
      })
    );
    recordAuditAction('FINALIZED_SKETCH_FOR_VERIFICATION', sketch.imageId, `Selected iteration #${sketch.iteration}`);
    addToast(`Sketch ${sketch.imageId} finalized for Law Enforcement DB verification.`, 'success');
  }, [recordAuditAction, addToast]);

  // Adds a candidate or branch sketch node to both sessionImages and persistent flow graph
  const addGraphCandidateNode = useCallback(({ sketch, parentSketchId = null }) => {
    setSessionImages((prev) => [sketch, ...prev]);
    setFinalizedSketch(sketch);

    const newNodeId = `node-sketch-${sketch.seed || sketch.imageId}`;

    setFlowNodes((prevNodes) => {
      const filtered = prevNodes.filter((n) => n.id !== newNodeId && n.data?.sketch?.imageId !== sketch.imageId);

      let position = { x: 780, y: 60 };
      if (parentSketchId) {
        const parentNode = prevNodes.find((n) => n.data?.sketch?.imageId === parentSketchId);
        if (parentNode) {
          const siblingCount = prevNodes.filter((n) => n.data?.sketch?.parentId === parentSketchId).length;
          position = {
            x: parentNode.position.x + 360,
            y: parentNode.position.y + siblingCount * 220 + 20
          };
        }
      } else {
        const rootCandidates = prevNodes.filter((n) => n.type === 'candidateSketchNode' && !n.data?.sketch?.parentId);
        position = {
          x: 780,
          y: rootCandidates.length * 360 + 60
        };
      }

      const newNode = {
        id: newNodeId,
        type: 'candidateSketchNode',
        position,
        data: {
          sketch,
          isFinalized: true
        }
      };

      const unfinalized = filtered.map((n) =>
        n.type === 'candidateSketchNode'
          ? { ...n, data: { ...n.data, isFinalized: false } }
          : n.id === 'node-extractor-root'
          ? { ...n, data: { ...n.data, features: sketch.features } }
          : n
      );

      return [...unfinalized, newNode];
    });

    setFlowEdges((prevEdges) => {
      let sourceId = 'node-extractor-root';
      let sourceHandle = 'feature-out';

      if (parentSketchId) {
        const parentNode = flowNodes.find((n) => n.data?.sketch?.imageId === parentSketchId);
        if (parentNode) {
          sourceId = parentNode.id;
          sourceHandle = 'sketch-out';
        }
      }

      const edgeId = `edge-${sourceId}-${newNodeId}`;
      if (prevEdges.some((e) => e.id === edgeId)) return prevEdges;

      const newEdge = {
        id: edgeId,
        source: sourceId,
        sourceHandle,
        target: newNodeId,
        targetHandle: 'sketch-in',
        animated: true,
        style: { stroke: parentSketchId ? '#10B981' : '#38BDF8', strokeWidth: 2 }
      };

      return [...prevEdges, newEdge];
    });
  }, [flowNodes]);

  return (
    <SessionContext.Provider
      value={{
        officer,
        sessionId,
        caseNumber,
        caseInfo,
        sessionImages,
        addSessionSketch,
        addSessionSketches,
        finalizedSketch,
        finalizeSketch,
        flowNodes,
        setFlowNodes,
        flowEdges,
        setFlowEdges,
        witnessPrompt,
        setWitnessPrompt,
        witnessLanguage,
        setWitnessLanguage,
        addGraphCandidateNode,
        auditLogs,
        recordAuditAction,
        simulateTamper,
        restoreChainIntegrity,
        toasts,
        addToast,
        removeToast,
        canvasNodes,
        setCanvasNodes,
        canvasEdges,
        setCanvasEdges,
        registryMode,
        setRegistryMode,
        customDbRecords,
        updateCustomDatabase,
        resetToDefaultRegistry
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);

