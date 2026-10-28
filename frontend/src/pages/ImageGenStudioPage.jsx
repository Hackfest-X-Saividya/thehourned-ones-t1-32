import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from '@xyflow/react';
import FlowCanvas from '../components/studio/FlowCanvas';
import RefinementDrawer from '../components/studio/RefinementDrawer';
import VersionComparisonModal from '../components/studio/VersionComparisonModal';
import SessionGalleryDrawer from '../components/studio/SessionGalleryDrawer';
import PdfExportModal from '../components/studio/PdfExportModal';
import { useSession } from '../context/SessionContext';
import { generateCandidates, generateSketch, refineSketch, extractFeatures } from '../services/api';
import {
  Sparkles,
  GitBranch,
  ArrowRightLeft,
  Images,
  FileDown,
  ShieldCheck,
  RotateCcw,
  Maximize2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

/**
 * Builds the initial graph canvas nodes and edges from all session sketches
 */
function buildGraphFromSession(images, activeFinalized, handlers, promptState) {
  const promptNode = {
    id: 'node-prompt-root',
    type: 'promptNode',
    position: { x: 40, y: 100 },
    data: {
      prompt: promptState.prompt,
      onPromptChange: promptState.setPrompt,
      language: promptState.language,
      onLanguageChange: promptState.setLanguage,
      numCandidates: promptState.numCandidates,
      onNumCandidatesChange: promptState.setNumCandidates,
      onTriggerExtraction: promptState.onTriggerExtraction,
      isProcessing: promptState.isProcessing
    }
  };

  const latestFeatures = activeFinalized?.features || images[0]?.features || {};
  const extractorNode = {
    id: 'node-extractor-root',
    type: 'featureExtractorNode',
    position: { x: 410, y: 100 },
    data: {
      features: latestFeatures,
      status: 'EXTRACTED',
      confidence: 94.8
    }
  };

  const nodes = [promptNode, extractorNode];
  const edges = [
    {
      id: 'edge-prompt-extractor',
      source: 'node-prompt-root',
      sourceHandle: 'prompt-out',
      target: 'node-extractor-root',
      targetHandle: 'feature-in',
      animated: true,
      style: { stroke: '#38BDF8', strokeWidth: 2 }
    }
  ];

  // Process images in chronological order (oldest to newest)
  const chronological = [...images].reverse();
  const positionMap = new Map();
  let rootIndex = 0;

  chronological.forEach((sketch) => {
    const nodeId = `node-sketch-${sketch.imageId}`;
    let pos;

    if (sketch.parentId && positionMap.has(sketch.parentId)) {
      const parentPos = positionMap.get(sketch.parentId);
      const siblingCount = Array.from(positionMap.values()).filter((p) => p.parentId === sketch.parentId).length;
      pos = { x: parentPos.x + 360, y: parentPos.y + siblingCount * 370 };
    } else {
      pos = { x: 780, y: 80 + rootIndex * 370 };
      rootIndex++;
    }

    positionMap.set(sketch.imageId, { ...pos, parentId: sketch.parentId });

    nodes.push({
      id: nodeId,
      type: 'candidateSketchNode',
      position: pos,
      data: {
        sketch,
        isFinalized: activeFinalized?.imageId === sketch.imageId,
        onFinalize: handlers.handleFinalizeSketch,
        onRefine: handlers.handleOpenRefine,
        onCompare: handlers.handleOpenCompare,
        onDownloadPng: handlers.handleDownloadPng
      }
    });

    if (sketch.parentId && positionMap.has(sketch.parentId)) {
      edges.push({
        id: `edge-${sketch.parentId}-${sketch.imageId}`,
        source: `node-sketch-${sketch.parentId}`,
        sourceHandle: `sketch-out-${sketch.parentId}`,
        target: nodeId,
        targetHandle: `sketch-in-${sketch.imageId}`,
        animated: true,
        style: { stroke: '#10B981', strokeWidth: 2.5 }
      });
    } else {
      edges.push({
        id: `edge-extractor-${nodeId}`,
        source: 'node-extractor-root',
        sourceHandle: 'feature-out',
        target: nodeId,
        targetHandle: `sketch-in-${sketch.imageId}`,
        animated: true,
        style: { stroke: '#38BDF8', strokeWidth: 2 }
      });
    }
  });

  return { nodes, edges };
}

/**
 * Re-hydrates existing canvas nodes with active closures and ensures no sketches are missing
 */
function rehydrateExistingGraph(existingNodes, existingEdges, images, activeFinalized, handlers, promptState) {
  const updatedNodes = existingNodes.map((n) => {
    if (n.type === 'candidateSketchNode') {
      const sketch = n.data?.sketch;
      return {
        ...n,
        data: {
          ...n.data,
          isFinalized: activeFinalized?.imageId === sketch?.imageId,
          onFinalize: handlers.handleFinalizeSketch,
          onRefine: handlers.handleOpenRefine,
          onCompare: handlers.handleOpenCompare,
          onDownloadPng: handlers.handleDownloadPng
        }
      };
    }
    if (n.type === 'promptNode') {
      return {
        ...n,
        data: {
          ...n.data,
          prompt: n.data?.prompt ?? promptState.prompt,
          onPromptChange: promptState.setPrompt,
          language: n.data?.language ?? promptState.language,
          onLanguageChange: promptState.setLanguage,
          numCandidates: n.data?.numCandidates ?? promptState.numCandidates,
          onNumCandidatesChange: promptState.setNumCandidates,
          onTriggerExtraction: promptState.onTriggerExtraction,
          isProcessing: promptState.isProcessing
        }
      };
    }
    if (n.type === 'featureExtractorNode') {
      return {
        ...n,
        data: {
          ...n.data,
          features: activeFinalized?.features || images[0]?.features || n.data?.features || {}
        }
      };
    }
    return n;
  });

  const updatedEdges = [...existingEdges];

  // Reconcile: Ensure any sketch in sessionImages is represented on canvas
  const existingSketchIds = new Set(
    updatedNodes
      .filter((n) => n.type === 'candidateSketchNode')
      .map((n) => n.data?.sketch?.imageId)
  );

  images.forEach((sketch) => {
    if (!existingSketchIds.has(sketch.imageId)) {
      const parentNode = updatedNodes.find((n) => n.data?.sketch?.imageId === sketch.parentId);
      const parentPos = parentNode ? parentNode.position : { x: 780, y: 80 };
      const siblingCount = updatedNodes.filter(
        (n) => n.type === 'candidateSketchNode' && n.data?.sketch?.parentId === sketch.parentId
      ).length;
      const rootCandidateCount = updatedNodes.filter(
        (n) => n.type === 'candidateSketchNode' && !n.data?.sketch?.parentId
      ).length;

      const pos = sketch.parentId
        ? { x: parentPos.x + 360, y: parentPos.y + siblingCount * 370 }
        : { x: 780, y: 80 + rootCandidateCount * 370 };

      const nodeId = `node-sketch-${sketch.imageId}`;
      updatedNodes.push({
        id: nodeId,
        type: 'candidateSketchNode',
        position: pos,
        data: {
          sketch,
          isFinalized: activeFinalized?.imageId === sketch.imageId,
          onFinalize: handlers.handleFinalizeSketch,
          onRefine: handlers.handleOpenRefine,
          onCompare: handlers.handleOpenCompare,
          onDownloadPng: handlers.handleDownloadPng
        }
      });

      if (parentNode) {
        updatedEdges.push({
          id: `edge-${parentNode.id}-${nodeId}`,
          source: parentNode.id,
          sourceHandle: `sketch-out-${sketch.parentId}`,
          target: nodeId,
          targetHandle: `sketch-in-${sketch.imageId}`,
          animated: true,
          style: { stroke: '#10B981', strokeWidth: 2.5 }
        });
      } else {
        updatedEdges.push({
          id: `edge-extractor-${nodeId}`,
          source: 'node-extractor-root',
          sourceHandle: 'feature-out',
          target: nodeId,
          targetHandle: `sketch-in-${sketch.imageId}`,
          animated: true,
          style: { stroke: '#38BDF8', strokeWidth: 2 }
        });
      }
    }
  });

  return { nodes: updatedNodes, edges: updatedEdges };
}

export default function ImageGenStudioPage() {
  const navigate = useNavigate();
  const {
    officer,
    sessionId,
    caseNumber,
    sessionImages,
    addSessionSketch,
    addSessionSketches,
    finalizedSketch,
    finalizeSketch,
    recordAuditAction,
    addToast,
    canvasNodes,
    setCanvasNodes,
    canvasEdges,
    setCanvasEdges
  } = useSession();

  const reactFlowInstance = useRef(null);

  // Prompt, Language and Stage 1 Candidate Variations state
  const savedPromptNode = canvasNodes?.find((n) => n.id === 'node-prompt-root');
  const [prompt, setPrompt] = useState(
    savedPromptNode?.data?.prompt ||
    'Male early 30s, sharp square jawline, deep-set almond eyes, straight narrow nose, 3-day stubble, vertical scar above left eyebrow'
  );
  const [language, setLanguage] = useState(savedPromptNode?.data?.language || 'en-IN');
  const [numCandidates, setNumCandidates] = useState(savedPromptNode?.data?.numCandidates || 3);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modals and Drawers
  const [refinementTarget, setRefinementTarget] = useState(null);
  const [isRefining, setIsRefining] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [compareTarget, setCompareTarget] = useState(null);

  // Ref to setNodes for stable callbacks
  const setNodesRef = useRef(null);

  const handlePromptChange = useCallback((newPrompt) => {
    setPrompt(newPrompt);
    if (setNodesRef.current) {
      setNodesRef.current((nds) =>
        nds.map((n) =>
          n.id === 'node-prompt-root'
            ? { ...n, data: { ...n.data, prompt: newPrompt } }
            : n
        )
      );
    }
  }, []);

  const handleLanguageChange = useCallback((newLang) => {
    setLanguage(newLang);
    if (setNodesRef.current) {
      setNodesRef.current((nds) =>
        nds.map((n) =>
          n.id === 'node-prompt-root'
            ? { ...n, data: { ...n.data, language: newLang } }
            : n
        )
      );
    }
  }, []);

  const handleNumCandidatesChange = useCallback((newCount) => {
    setNumCandidates(newCount);
    if (setNodesRef.current) {
      setNodesRef.current((nds) =>
        nds.map((n) =>
          n.id === 'node-prompt-root'
            ? { ...n, data: { ...n.data, numCandidates: newCount } }
            : n
        )
      );
    }
  }, []);

  // Handlers passed into node data
  const handleFinalizeSketch = useCallback(
    (sketch) => {
      finalizeSketch(sketch);
      if (setNodesRef.current) {
        setNodesRef.current((nds) => {
          const next = nds.map((n) => {
            if (n.type === 'candidateSketchNode') {
              return {
                ...n,
                data: {
                  ...n.data,
                  isFinalized: n.data.sketch?.imageId === sketch.imageId
                }
              };
            }
            return n;
          });
          if (setCanvasNodes) setCanvasNodes(next);
          return next;
        });
      }
    },
    [finalizeSketch, setCanvasNodes]
  );

  const handleOpenRefine = useCallback(
    (sketch) => {
      handleFinalizeSketch(sketch);
      setRefinementTarget(sketch);
    },
    [handleFinalizeSketch]
  );

  const handleOpenCompare = useCallback((sketch) => {
    setCompareTarget(sketch);
    setIsCompareOpen(true);
  }, []);

  const handleDownloadPng = useCallback(
    (sketch) => {
      const a = document.createElement('a');
      a.href = sketch.imageUrl;
      a.download = `Forensic_Composite_${sketch.imageId}_v${sketch.iteration}.png`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      recordAuditAction('DOWNLOADED_COMPOSITE_PNG', sketch.imageId);
      addToast(`Downloaded PNG composite for ${sketch.imageId}`, 'info');
    },
    [recordAuditAction, addToast]
  );

  // Pre-define generation trigger reference
  const triggerRef = useRef(null);

  // Compute graph on mount, persisting across route unmounts
  const initialGraph = useMemo(() => {
    const handlers = {
      handleFinalizeSketch,
      handleOpenRefine,
      handleOpenCompare,
      handleDownloadPng
    };
    const promptState = {
      prompt,
      setPrompt: handlePromptChange,
      language,
      setLanguage: handleLanguageChange,
      numCandidates,
      setNumCandidates: handleNumCandidatesChange,
      onTriggerExtraction: (overrides) => {
        if (triggerRef.current) triggerRef.current(overrides);
      },
      isProcessing
    };

    if (canvasNodes && canvasNodes.length > 0) {
      return rehydrateExistingGraph(
        canvasNodes,
        canvasEdges || [],
        sessionImages,
        finalizedSketch,
        handlers,
        promptState
      );
    }

    return buildGraphFromSession(sessionImages, finalizedSketch, handlers, promptState);
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraph.edges);

  setNodesRef.current = setNodes;

  // Keep node-prompt-root synchronized with isProcessing state
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === 'node-prompt-root'
          ? { ...n, data: { ...n.data, isProcessing } }
          : n
      )
    );
  }, [isProcessing, setNodes]);

  // Keep SessionContext synchronized so unmounting / route changes preserve all nodes
  useEffect(() => {
    if (nodes && nodes.length > 0 && setCanvasNodes) {
      setCanvasNodes(nodes);
    }
  }, [nodes, setCanvasNodes]);

  useEffect(() => {
    if (edges && edges.length > 0 && setCanvasEdges) {
      setCanvasEdges(edges);
    }
  }, [edges, setCanvasEdges]);

  // Initial Generation Handler with Multi-Candidate Variation Support
  const triggerInitialGeneration = async (overrides) => {
    const activePrompt = (overrides?.prompt ?? prompt).trim();
    const activeLanguage = overrides?.language ?? language;
    const activeNumCandidates = overrides?.numCandidates ?? numCandidates;

    if (!activePrompt || isProcessing) return;
    setIsProcessing(true);

    try {
      const candidates = await generateCandidates({
        prompt: activePrompt,
        language: activeLanguage,
        numCandidates: activeNumCandidates,
        iteration: 1
      });

      if (!candidates || candidates.length === 0) {
        throw new Error('No candidate sketches generated');
      }

      // Add all candidate variations into session state (first candidate active base by default)
      if (addSessionSketches) {
        addSessionSketches(candidates, 0);
      } else {
        candidates.forEach((cand) => addSessionSketch(cand));
      }

      await recordAuditAction(
        'CANDIDATES_GENERATED',
        candidates.map((c) => c.imageId).join(','),
        `Generated ${candidates.length} stage 1 candidate variations for prompt: "${activePrompt.slice(0, 50)}"`
      );

      const existingCandidateNodes = nodes.filter((n) => n.type === 'candidateSketchNode');
      const startY = 80 + existingCandidateNodes.length * 370;

      const newSketchNodes = candidates.map((cand, idx) => {
        const nodeId = `node-sketch-${cand.imageId}`;
        return {
          id: nodeId,
          type: 'candidateSketchNode',
          position: { x: 780, y: startY + idx * 370 },
          data: {
            sketch: cand,
            isFinalized: idx === 0, // First candidate selected as base image by default
            onFinalize: handleFinalizeSketch,
            onRefine: handleOpenRefine,
            onCompare: handleOpenCompare,
            onDownloadPng: handleDownloadPng
          }
        };
      });

      const newEdges = candidates.map((cand) => {
        const nodeId = `node-sketch-${cand.imageId}`;
        return {
          id: `edge-extractor-${nodeId}`,
          source: 'node-extractor-root',
          sourceHandle: 'feature-out',
          target: nodeId,
          targetHandle: `sketch-in-${cand.imageId}`,
          animated: true,
          style: { stroke: '#38BDF8', strokeWidth: 2 }
        };
      });

      const nextNodes = nodes
        .map((n) => {
          if (n.id === 'node-extractor-root') {
            return {
              ...n,
              data: {
                ...n.data,
                features: candidates[0].features
              }
            };
          }
          if (n.type === 'candidateSketchNode') {
            return {
              ...n,
              data: { ...n.data, isFinalized: false }
            };
          }
          return n;
        })
        .concat(newSketchNodes);

      const nextEdges = [...edges, ...newEdges];

      setNodes(nextNodes);
      setEdges(nextEdges);
      if (setCanvasNodes) setCanvasNodes(nextNodes);
      if (setCanvasEdges) setCanvasEdges(nextEdges);

      addToast(
        `Generated ${candidates.length} candidate variations! Select any as Base Image to refine traits.`,
        'success',
        5000
      );
    } catch (err) {
      console.error(err);
      addToast('Generation failed. Please try again.', 'danger');
    } finally {
      setIsProcessing(false);
    }
  };

  triggerRef.current = triggerInitialGeneration;

  // Handle Feature-Specific Refinement
  const handleRefinementSubmit = async (parentSketch, adjustments, additionalNote) => {
    setIsRefining(true);
    try {
      const refined = await refineSketch({
        parentSketch,
        adjustments,
        promptAdditions: additionalNote
      });

      addSessionSketch(refined);
      await recordAuditAction(
        'REFINED_SKETCH_NODE',
        refined.imageId,
        `Branch child from parent ${parentSketch.imageId} (v${refined.iteration})`
      );

      const parentNode = nodes.find((n) => n.data?.sketch?.imageId === parentSketch.imageId);
      const parentPos = parentNode ? parentNode.position : { x: 780, y: 80 };

      // Calculate vertical offset for sibling branches from this parent
      const existingChildren = nodes.filter(
        (n) => n.type === 'candidateSketchNode' && n.data?.sketch?.parentId === parentSketch.imageId
      );

      const childNodeId = `node-sketch-${refined.imageId}`;
      const childNode = {
        id: childNodeId,
        type: 'candidateSketchNode',
        position: {
          x: parentPos.x + 360,
          y: parentPos.y + existingChildren.length * 370
        },
        data: {
          sketch: refined,
          isFinalized: true,
          onFinalize: handleFinalizeSketch,
          onRefine: handleOpenRefine,
          onCompare: handleOpenCompare,
          onDownloadPng: handleDownloadPng
        }
      };

      const newEdge = {
        id: `edge-${parentNode ? parentNode.id : 'root'}-${childNodeId}`,
        source: parentNode ? parentNode.id : 'node-extractor-root',
        sourceHandle: parentNode ? `sketch-out-${parentSketch.imageId}` : 'feature-out',
        target: childNodeId,
        targetHandle: `sketch-in-${refined.imageId}`,
        animated: true,
        style: { stroke: '#10B981', strokeWidth: 2.5 }
      };

      const nextNodes = nodes
        .map((n) => {
          if (n.type === 'candidateSketchNode') {
            return {
              ...n,
              data: { ...n.data, isFinalized: false }
            };
          }
          return n;
        })
        .concat(childNode);

      const nextEdges = [...edges, newEdge];

      setNodes(nextNodes);
      setEdges(nextEdges);
      if (setCanvasNodes) setCanvasNodes(nextNodes);
      if (setCanvasEdges) setCanvasEdges(nextEdges);

      setRefinementTarget(null);
      addToast(`Branched refinement node v${refined.iteration} (${refined.imageId}) created!`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Refinement failed. Please try again.', 'danger');
    } finally {
      setIsRefining(false);
    }
  };

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)]">
      {/* Studio Header Action Bar */}
      <div className="bg-navy-950/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
            <h1 className="text-xs font-bold uppercase tracking-wider text-white">
              Forensic Graph Canvas
            </h1>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-navy-900 border border-slate-855 px-2 py-0.5 rounded">
            {nodes.filter((n) => n.type === 'candidateSketchNode').length} Composite Nodes Active
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Version Comparison Modal Trigger */}
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              setCompareTarget(finalizedSketch);
              setIsCompareOpen(true);
            }}
            icon={ArrowRightLeft}
          >
            Compare v1 vs v{finalizedSketch?.iteration || 1}
          </Button>

          {/* Session Gallery Drawer Trigger */}
          <Button
            variant="secondary"
            size="xs"
            onClick={() => setIsGalleryOpen(true)}
            icon={Images}
          >
            Archive Gallery ({sessionImages.length})
          </Button>

          {/* Export PDF Dossier */}
          <Button
            variant="secondary"
            size="xs"
            onClick={() => setIsPdfModalOpen(true)}
            icon={FileDown}
          >
            Export Dossier PDF
          </Button>

          {/* Proceed to DB Verification */}
          <Button
            variant="emerald"
            size="xs"
            onClick={() => {
              recordAuditAction('NAVIGATED_TO_DB_VERIFICATION', finalizedSketch?.imageId);
              navigate('/db-verification');
            }}
            icon={ShieldCheck}
          >
            Verify in Criminal DB →
          </Button>
        </div>
      </div>

      {/* Main Flow Canvas Viewport */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-navy-950">
        <FlowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={(instance) => {
            reactFlowInstance.current = instance;
          }}
        />

        {/* Floating Canvas Controls & Status Overlay */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 pointer-events-none">
          <div className="bg-navy-900/90 border border-slate-800 rounded-lg p-2.5 shadow-xl backdrop-blur-md pointer-events-auto text-xs font-mono space-y-1">
            <div className="text-[10px] uppercase text-slate-500 font-semibold">
              Selected Target Composite
            </div>
            <div className="text-sky-400 font-bold flex items-center gap-1.5">
              <span>{finalizedSketch?.imageId || 'None'}</span>
              <span className="text-[10px] text-emerald-400 font-normal">
                (v{finalizedSketch?.iteration || 1})
              </span>
            </div>
            <div className="text-[10px] text-slate-400 truncate max-w-[200px]" title={finalizedSketch?.prompt}>
              {finalizedSketch?.features?.jawline} • {finalizedSketch?.features?.eyes}
            </div>
          </div>
        </div>
      </div>

      {/* Refinement Drawer Modal */}
      <RefinementDrawer
        isOpen={Boolean(refinementTarget)}
        onClose={() => setRefinementTarget(null)}
        parentSketch={refinementTarget}
        onSubmitRefinement={handleRefinementSubmit}
        isSubmitting={isRefining}
        language={language}
      />

      {/* Version Evolution Comparison Modal */}
      <VersionComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        initialSketch={sessionImages[sessionImages.length - 1] || sessionImages[0]}
        currentSketch={compareTarget || finalizedSketch}
      />

      {/* Session Archive Gallery Drawer */}
      <SessionGalleryDrawer
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onDownloadPng={handleDownloadPng}
      />

      {/* Court Dossier PDF Export Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />
    </div>
  );
}
