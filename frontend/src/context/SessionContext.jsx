import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateBlockHash, calculateSha256 } from '../utils/hashUtils';
import { selectCandidateImage, fetchSavedCandidateSelection, createMockCandidatePreview } from '../services/api';

const SessionContext = createContext();

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
  const [activeCaseId, setActiveCaseId] = useState(() => {
    try {
      return localStorage.getItem('forensic_active_case_id') || null;
    } catch {
      return null;
    }
  });
  const [caseInfo] = useState({
    incidentType: 'Armed Commercial Robbery',
    policeStation: 'Hebbal Police Station, Bengaluru',
    witnessCode: 'WIT-BLR-099',
    interviewDate: '28 Oct 2026'
  });

  // Stored Session-wise image iterations with localStorage persistence across refreshes (empty until user generates)
  const [sessionImages, setSessionImages] = useState(() => {
    try {
      const saved = localStorage.getItem('forensic_session_images');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((img) => img.imageId && img.imageId !== 'IMG-SKETCH-1042');
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Selected Finalized Composite for DB verification and high-res export (null until candidate generated & selected)
  const [finalizedSketch, setFinalizedSketch] = useState(() => {
    try {
      const saved = localStorage.getItem('forensic_finalized_sketch');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.imageId && parsed.imageId !== 'IMG-SKETCH-1042') {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  // Persisted Graph Canvas Nodes & Edges across page navigations & refreshes (excluding legacy dummy nodes)
  const [canvasNodes, setCanvasNodes] = useState(() => {
    try {
      const saved = localStorage.getItem('forensic_canvas_nodes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((n) => n.id !== 'node-sketch-IMG-SKETCH-1042' && n.data?.sketch?.imageId !== 'IMG-SKETCH-1042');
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [canvasEdges, setCanvasEdges] = useState(() => {
    try {
      const saved = localStorage.getItem('forensic_canvas_edges');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((e) => !e.id?.includes('IMG-SKETCH-1042') && e.source !== 'node-sketch-IMG-SKETCH-1042' && e.target !== 'node-sketch-IMG-SKETCH-1042');
        }
      }
      return null;
    } catch {
      return null;
    }
  });

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
    }
  ]);

  // Synchronously compute Genesis block hash to ensure genuine cryptographic links
  useEffect(() => {
    async function initAuditHashes() {
      const b1 = auditLogs[0];
      if (b1) {
        const h1 = await generateBlockHash(b1);
        setAuditLogs([{ ...b1, currHash: h1 }]);
      }
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

  // Persist session images & finalized sketch to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('forensic_session_images', JSON.stringify(sessionImages));
    } catch {
      // Ignore quota
    }
  }, [sessionImages]);

  useEffect(() => {
    if (finalizedSketch) {
      try {
        localStorage.setItem('forensic_finalized_sketch', JSON.stringify(finalizedSketch));
      } catch {
        // Ignore quota
      }
    }
  }, [finalizedSketch]);

  // Sync canvas nodes & edges to localStorage
  const updateCanvasNodes = useCallback((nodes) => {
    setCanvasNodes(nodes);
    try {
      localStorage.setItem('forensic_canvas_nodes', JSON.stringify(nodes));
    } catch {}
  }, []);

  const updateCanvasEdges = useCallback((edges) => {
    setCanvasEdges(edges);
    try {
      localStorage.setItem('forensic_canvas_edges', JSON.stringify(edges));
    } catch {}
  }, []);

  // Sync saved candidate selection from backend on mount or when case changes
  useEffect(() => {
    let isSubscribed = true;
    async function syncBackendSelection() {
      try {
        const targetCase = activeCaseId || localStorage.getItem('forensic_active_case_id') || caseNumber;
        const savedId = await fetchSavedCandidateSelection({ caseId: targetCase });
        if (savedId && isSubscribed) {
          const match = sessionImages.find((img) => img.imageId === savedId);
          if (match && match.imageId !== finalizedSketch?.imageId) {
            setFinalizedSketch(match);
          }
        }
      } catch (err) {
        // Silent fallback
      }
    }
    syncBackendSelection();
    return () => {
      isSubscribed = false;
    };
  }, [activeCaseId, caseNumber, sessionImages]);

  // Adds a newly generated or refined sketch to the session
  const addSessionSketch = useCallback((newSketch) => {
    setSessionImages((prev) => [newSketch, ...prev]);
    setFinalizedSketch(newSketch);
  }, []);

  // Finalizes the sketch as active base image, persists to backend and logs audit event
  const finalizeSketch = useCallback((sketch) => {
    if (!sketch) return;
    setFinalizedSketch(sketch);
    recordAuditAction('SELECTED_AS_BASE_IMAGE', sketch.imageId, `Selected iteration #${sketch.iteration || 1} as active base composite for refinement`);
    addToast(`Sketch ${sketch.label || sketch.imageId} selected as Base Image for refinement.`, 'success');

    const targetCaseId = sketch.caseId || activeCaseId || localStorage.getItem('forensic_active_case_id') || caseNumber;

    // Persist selected candidate image through the backend service
    selectCandidateImage({ caseId: targetCaseId, imageId: sketch.imageId, isMock: sketch.isMock }).catch((err) => {
      console.warn('[SessionContext] Async candidate selection sync notice:', err.message);
    });
  }, [recordAuditAction, addToast, caseNumber, activeCaseId]);

  // Adds multiple candidate sketches generated in stage 1
  const addSessionSketches = useCallback((newSketches, activeCandidateIndex = 0) => {
    if (!newSketches || newSketches.length === 0) return;
    const firstSketch = newSketches[activeCandidateIndex] || newSketches[0];
    if (firstSketch?.caseId) {
      setActiveCaseId(firstSketch.caseId);
      try {
        localStorage.setItem('forensic_active_case_id', firstSketch.caseId);
      } catch {}
    }
    setSessionImages((prev) => [...newSketches, ...prev]);
    if (firstSketch) {
      finalizeSketch(firstSketch);
    }
  }, [finalizeSketch]);

  // Removes a candidate sketch node from the session
  const removeSessionSketch = useCallback((targetImageId) => {
    setSessionImages((prev) => {
      const remaining = prev.filter((img) => img.imageId !== targetImageId);
      try {
        localStorage.setItem('forensic_session_images', JSON.stringify(remaining));
      } catch {}

      setFinalizedSketch((currentFinalized) => {
        if (currentFinalized?.imageId === targetImageId) {
          const nextActive = remaining[0] || null;
          try {
            if (nextActive) {
              localStorage.setItem('forensic_finalized_sketch', JSON.stringify(nextActive));
            } else {
              localStorage.removeItem('forensic_finalized_sketch');
            }
          } catch {}
          return nextActive;
        }
        return currentFinalized;
      });

      return remaining;
    });
  }, []);

  return (
    <SessionContext.Provider
      value={{
        officer,
        sessionId,
        caseNumber,
        activeCaseId,
        setActiveCaseId,
        caseInfo,
        sessionImages,
        addSessionSketch,
        addSessionSketches,
        removeSessionSketch,
        finalizedSketch,
        finalizeSketch,
        auditLogs,
        recordAuditAction,
        simulateTamper,
        restoreChainIntegrity,
        toasts,
        addToast,
        removeToast,
        canvasNodes,
        setCanvasNodes: updateCanvasNodes,
        canvasEdges,
        setCanvasEdges: updateCanvasEdges,
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
