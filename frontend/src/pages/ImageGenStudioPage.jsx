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
import { detectFacialLandmarks, generateFacialRegionMask } from '../utils/maskGenerator';
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
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
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
      imageType: promptState.imageType,
      onImageTypeChange: promptState.setImageType,
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
          imageType: n.data?.imageType ?? promptState.imageType,
          onImageTypeChange: promptState.setImageType,
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

  // Prompt, Language, Composite Style and Stage 1 Candidate Variations state
  const savedPromptNode = canvasNodes?.find((n) => n.id === 'node-prompt-root');
  const [prompt, setPrompt] = useState(
    savedPromptNode?.data?.prompt ||
    'Male early 30s, sharp square jawline, deep-set almond eyes, straight narrow nose, 3-day stubble, vertical scar above left eyebrow'
  );
  const [language, setLanguage] = useState(savedPromptNode?.data?.language || 'en-IN');
  const [numCandidates, setNumCandidates] = useState(savedPromptNode?.data?.numCandidates || 4);
  const [imageType, setImageType] = useState(savedPromptNode?.data?.imageType || 'sketch');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInspectorExpanded, setIsInspectorExpanded] = useState(true);
  const [activeInspectorRegion, setActiveInspectorRegion] = useState(null);
  const [apiFallbackActive, setApiFallbackActive] = useState(false);
  const [apiFallbackReason, setApiFallbackReason] = useState('');
  const [showMaskPreview, setShowMaskPreview] = useState(false);

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

  const handleImageTypeChange = useCallback((newType) => {
    setImageType(newType);
    if (setNodesRef.current) {
      setNodesRef.current((nds) =>
        nds.map((n) =>
          n.id === 'node-prompt-root'
            ? { ...n, data: { ...n.data, imageType: newType } }
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
      imageType,
      setImageType: handleImageTypeChange,
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
    const activeImageType = overrides?.imageType ?? imageType;

    if (!activePrompt || isProcessing) return;
    setIsProcessing(true);

    try {
      const candidates = await generateCandidates({
        prompt: activePrompt,
        language: activeLanguage,
        numCandidates: activeNumCandidates,
        imageType: activeImageType,
        caseId: caseNumber,
        iteration: 1
      });

      if (!candidates || candidates.length === 0) {
        throw new Error('No candidate sketches generated');
      }

      const hasMockFallback = candidates.some((c) => c.isMock);
      setApiFallbackActive(hasMockFallback);
      if (hasMockFallback) {
        setApiFallbackReason('Cloudflare Worker API was unreachable or offline. Generated offline mock candidate previews.');
        addToast('API Fallback Active: Generated offline mock candidate previews.', 'warning');
      } else {
        setApiFallbackReason('');
        addToast(`Successfully synthesized ${candidates.length} live Worker AI candidates.`, 'success');
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

  // Handle Feature-Specific Refinement with Accurate Image-Sized Mask Inpainting
  const handleRefinementSubmit = async (parentSketch, adjustments, additionalNote, targetedRegions) => {
    setIsRefining(true);
    try {
      const refined = await refineSketch({
        parentSketch,
        adjustments,
        promptAdditions: additionalNote,
        targetRegions: targetedRegions
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

      {/* API Fallback Notification Banner */}
      {apiFallbackActive && (
        <div className="bg-amber-950/90 border-b border-amber-500/50 px-4 py-2 flex items-center justify-between text-xs text-amber-200 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-400 shrink-0 animate-pulse" />
            <span>
              <strong>API Fallback Active:</strong> Cloudflare Worker API was unreachable or offline. Displaying <strong>simulated offline mock candidates</strong>.
            </span>
          </div>
          <span className="text-[10px] font-mono bg-amber-900/80 border border-amber-600/70 px-2 py-0.5 rounded text-amber-300 font-bold uppercase tracking-wider">
            MOCK DATA MODE
          </span>
        </div>
      )}

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

        {/* Prominent Selected Candidate Workspace Dock */}
        <div className="absolute top-4 right-4 z-20 flex flex-col pointer-events-none max-w-sm w-full">
          {finalizedSketch && (() => {
            const dynamicGeometry = detectFacialLandmarks(finalizedSketch);
            const dynamicLandmarks = [
              { id: 'hair', label: 'Hair', x: 50, y: Math.round(dynamicGeometry.landmarks.hair.box.minY * 100 + 8) },
              { id: 'eyebrows', label: 'Eyebrows', x: 50, y: Math.round(((dynamicGeometry.landmarks.eyebrows.box.minY + dynamicGeometry.landmarks.eyebrows.box.maxY) / 2) * 100) },
              { id: 'eyes', label: 'Eyes', x: 50, y: Math.round(dynamicGeometry.landmarks.eyes.leftEye.y * 100) },
              { id: 'nose', label: 'Nose', x: 50, y: Math.round(((dynamicGeometry.landmarks.nose.box.minY + dynamicGeometry.landmarks.nose.box.maxY) / 2) * 100) },
              { id: 'mouth', label: 'Mouth', x: 50, y: Math.round(((dynamicGeometry.landmarks.mouth.box.minY + dynamicGeometry.landmarks.mouth.box.maxY) / 2) * 100) },
              { id: 'jawline', label: 'Jawline', x: 50, y: Math.round(dynamicGeometry.landmarks.jawline.box.maxY * 100) }
            ];

            const activeDef = activeInspectorRegion ? dynamicGeometry.landmarks[activeInspectorRegion.toLowerCase()] : null;
            const maskDataUri = showMaskPreview ? generateFacialRegionMask({
              width: 512,
              height: 512,
              regions: activeInspectorRegion ? [activeInspectorRegion] : ['eyes', 'jawline', 'nose'],
              candidateMeta: finalizedSketch
            }) : null;

            return (
              <div className="bg-navy-900/95 border-2 border-emerald-500/70 rounded-xl shadow-2xl backdrop-blur-md pointer-events-auto overflow-hidden transition-all text-xs">
                {/* Dock Header */}
                <div className="bg-navy-950 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                      Active Selected Composite
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                      {finalizedSketch.label || finalizedSketch.imageId}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsInspectorExpanded(!isInspectorExpanded)}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                      title={isInspectorExpanded ? 'Collapse inspector' : 'Expand inspector'}
                    >
                      {isInspectorExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {isInspectorExpanded && (
                  <div className="p-3 space-y-3">
                    {/* Provenance Indicator: Live Worker AI vs Fallback Mock */}
                    <div className="flex items-center justify-between">
                      {finalizedSketch.isMock ? (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/70 text-amber-300 text-[10px] font-mono font-bold">
                          <AlertTriangle size={11} className="text-amber-400" />
                          <span>MOCK PREVIEW (API FALLBACK)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/70 text-emerald-300 text-[10px] font-mono font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>WORKER AI COMPOSITE</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowMaskPreview(!showMaskPreview)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1 cursor-pointer transition-colors ${
                          showMaskPreview
                            ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                            : 'bg-navy-950 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
                        }`}
                      >
                        {showMaskPreview ? <EyeOff size={11} /> : <Eye size={11} />}
                        <span>{showMaskPreview ? 'Hide Mask' : 'Inspect 512×512 Mask'}</span>
                      </button>
                    </div>

                    {/* Image Preview with Dynamic Facial Landmark Overlays */}
                    <div className="relative aspect-[4/5] max-h-56 bg-navy-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                      <img
                        src={finalizedSketch.imageUrl}
                        alt={finalizedSketch.imageId}
                        className="w-full h-full object-contain"
                      />

                      {/* Real-time Inpainting Mask Overlay */}
                      {showMaskPreview && maskDataUri && (
                        <img
                          src={maskDataUri}
                          alt="Inpainting Mask Overlay"
                          className="absolute inset-0 w-full h-full object-contain opacity-70 mix-blend-screen pointer-events-none"
                        />
                      )}

                      {/* Dynamic Landmark Overlay Anchors */}
                      {!showMaskPreview && dynamicLandmarks.map((landmark) => {
                        const isHighlighted = activeInspectorRegion === landmark.id;
                        return (
                          <button
                            key={landmark.id}
                            type="button"
                            onClick={() =>
                              setActiveInspectorRegion(activeInspectorRegion === landmark.id ? null : landmark.id)
                            }
                            className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all cursor-pointer ${
                              isHighlighted ? 'scale-125' : 'hover:scale-110 opacity-70 hover:opacity-100'
                            }`}
                            style={{ left: `${landmark.x}%`, top: `${landmark.y}%` }}
                            title={`Target region: ${landmark.label}`}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                isHighlighted
                                  ? 'bg-sky-500 border-white shadow-lg shadow-sky-500/50'
                                  : 'bg-navy-900 border-sky-400'
                              }`}
                            >
                              <div className="w-1 h-1 rounded-full bg-white" />
                            </div>
                          </button>
                        );
                      })}

                      {/* Style Badge Overlay */}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-navy-950/90 backdrop-blur-sm border border-slate-700 text-[10px] font-mono text-slate-300">
                        {finalizedSketch.imageType === 'normal' ? 'Realistic Portrait' : 'Forensic Pencil'}
                      </div>

                      {/* Active Region Target Watermark */}
                      {activeInspectorRegion && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-sky-950/90 border border-sky-500 text-sky-200 text-[9px] font-mono font-bold uppercase">
                          Targeting: {activeInspectorRegion}
                        </div>
                      )}
                    </div>

                    {/* Contour Alignment Feedback */}
                    <div className="bg-navy-950/80 p-2 rounded border border-slate-800 text-[10px] font-mono text-slate-300 space-y-1">
                      <div className="flex items-center justify-between text-sky-400 font-bold">
                        <span>Landmark Contour Segmentation:</span>
                        <span className="text-emerald-400">Adaptive</span>
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight">
                        {activeDef
                          ? `Region [${activeInspectorRegion.toUpperCase()}]: ${activeDef.detectedType} (Span: ${(activeDef.box.minX * 100).toFixed(0)}%-${(activeDef.box.maxX * 100).toFixed(0)}% X, ${(activeDef.box.minY * 100).toFixed(0)}%-${(activeDef.box.maxY * 100).toFixed(0)}% Y)`
                          : `Detected Face Bounds: [${(dynamicGeometry.faceBox.minX * 100).toFixed(0)}%-${(dynamicGeometry.faceBox.maxX * 100).toFixed(0)}% X] conforming to ${finalizedSketch.features?.jawline || 'Sharp Square'} morphology.`}
                      </div>
                    </div>

                    {/* Landmark Region Targeting Pills */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Target Anatomical Region:</span>
                        <span className="text-emerald-400">512×512 Mask Ready</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {['eyes', 'eyebrows', 'nose', 'mouth', 'jawline', 'hair'].map((region) => (
                          <button
                            key={region}
                            type="button"
                            onClick={() =>
                              setActiveInspectorRegion(activeInspectorRegion === region ? null : region)
                            }
                            className={`py-1 px-1.5 rounded text-[10px] font-mono uppercase tracking-tight border transition-all cursor-pointer truncate ${
                              activeInspectorRegion === region
                                ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-bold'
                                : 'bg-navy-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {region}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Anatomical Traits Summary */}
                    <div className="bg-navy-950/70 p-2 rounded-lg border border-slate-800 text-[11px] font-mono space-y-0.5 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Case FIR:</span>
                        <span className="text-slate-200 font-bold">{caseNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Seed / Hash:</span>
                        <span className="text-sky-300">{finalizedSketch.seed} • {finalizedSketch.imageHash ? finalizedSketch.imageHash.slice(0, 8) : 'SHA256'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Traits:</span>
                        <span className="text-slate-200 truncate max-w-[150px]">{finalizedSketch.features?.jawline}, {finalizedSketch.features?.eyes}</span>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => handleOpenRefine(finalizedSketch)}
                        icon={GitBranch}
                        className="font-bold text-[11px]"
                      >
                        Branch & Refine
                      </Button>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => handleDownloadPng(finalizedSketch)}
                        icon={FileDown}
                        className="text-[11px]"
                      >
                        Export PNG
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
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
