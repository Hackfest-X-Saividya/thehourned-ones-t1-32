import React, { useState, useCallback, useRef } from 'react';
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
import { generateSketch, refineSketch, extractFeatures } from '../services/api';
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

export default function ImageGenStudioPage() {
  const navigate = useNavigate();
  const {
    officer,
    sessionId,
    caseNumber,
    sessionImages,
    addSessionSketch,
    finalizedSketch,
    finalizeSketch,
    recordAuditAction,
    addToast
  } = useSession();

  const reactFlowInstance = useRef(null);

  // Prompt and Language state
  const [prompt, setPrompt] = useState(
    'Male early 30s, sharp square jawline, deep-set almond eyes, straight narrow nose, 3-day stubble, vertical scar above left eyebrow'
  );
  const [language, setLanguage] = useState('en-IN');
  const [isProcessing, setIsProcessing] = useState(false);

  // Modals and Drawers
  const [refinementTarget, setRefinementTarget] = useState(null);
  const [isRefining, setIsRefining] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [compareTarget, setCompareTarget] = useState(null);

  // Handlers passed into node data
  const handleFinalizeSketch = useCallback(
    (sketch) => {
      finalizeSketch(sketch);
      // Update nodes finalized status
      setNodes((nds) =>
        nds.map((n) => {
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
        })
      );
    },
    [finalizeSketch]
  );

  const handleOpenRefine = useCallback((sketch) => {
    setRefinementTarget(sketch);
  }, []);

  const handleOpenCompare = useCallback(
    (sketch) => {
      setCompareTarget(sketch);
      setIsCompareOpen(true);
    },
    []
  );

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

  // Initial Graph Nodes
  const initialNodes = [
    {
      id: 'node-prompt-root',
      type: 'promptNode',
      position: { x: 40, y: 100 },
      data: {
        prompt,
        onPromptChange: setPrompt,
        language,
        onLanguageChange: setLanguage,
        onTriggerExtraction: () => triggerInitialGeneration(),
        isProcessing
      }
    },
    {
      id: 'node-extractor-root',
      type: 'featureExtractorNode',
      position: { x: 410, y: 100 },
      data: {
        features: sessionImages[0]?.features || {},
        status: 'EXTRACTED',
        confidence: 94.8
      }
    },
    {
      id: 'node-sketch-1042',
      type: 'candidateSketchNode',
      position: { x: 780, y: 80 },
      data: {
        sketch: sessionImages[0],
        isFinalized: finalizedSketch?.imageId === sessionImages[0]?.imageId,
        onFinalize: handleFinalizeSketch,
        onRefine: handleOpenRefine,
        onCompare: handleOpenCompare,
        onDownloadPng: handleDownloadPng
      }
    }
  ];

  const initialEdges = [
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
      targetHandle: 'sketch-in-IMG-SKETCH-1042',
      animated: true,
      style: { stroke: '#10B981', strokeWidth: 2 }
    }
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Keep node callbacks fresh when prompt/state updates
  const triggerInitialGeneration = async () => {
    if (!prompt.trim() || isProcessing) return;
    setIsProcessing(true);

    try {
      const generated = await generateSketch({ prompt, language, iteration: 1 });
      addSessionSketch(generated);
      await recordAuditAction('SKETCH_NODE_GENERATED', generated.imageId, `Prompt: ${prompt.slice(0, 60)}`);

      const newNodeId = `node-sketch-${generated.seed}`;
      const newNode = {
        id: newNodeId,
        type: 'candidateSketchNode',
        position: { x: 780, y: (nodes.length - 2) * 220 + 80 },
        data: {
          sketch: generated,
          isFinalized: true,
          onFinalize: handleFinalizeSketch,
          onRefine: handleOpenRefine,
          onCompare: handleOpenCompare,
          onDownloadPng: handleDownloadPng
        }
      };

      // Update extractor node data
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === 'node-extractor-root') {
            return {
              ...n,
              data: {
                ...n.data,
                features: generated.features
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
        }).concat(newNode)
      );

      // Add edge from extractor to new node
      setEdges((eds) => [
        ...eds,
        {
          id: `edge-extractor-${newNodeId}`,
          source: 'node-extractor-root',
          sourceHandle: 'feature-out',
          target: newNodeId,
          targetHandle: `sketch-in-${generated.imageId}`,
          animated: true,
          style: { stroke: '#38BDF8', strokeWidth: 2 }
        }
      ]);

      addToast(`Generated forensic composite node ${generated.imageId}`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Generation failed. Please try again.', 'danger');
    } finally {
      setIsProcessing(false);
    }
  };

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

      const childNodeId = `node-sketch-${refined.seed}`;
      const childNode = {
        id: childNodeId,
        type: 'candidateSketchNode',
        position: {
          x: parentPos.x + 360,
          y: parentPos.y + 40
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

      // Add child node and edge from parent node
      setNodes((nds) =>
        nds.map((n) => {
          if (n.type === 'candidateSketchNode') {
            return {
              ...n,
              data: { ...n.data, isFinalized: false }
            };
          }
          return n;
        }).concat(childNode)
      );

      setEdges((eds) => [
        ...eds,
        {
          id: `edge-${parentNode ? parentNode.id : 'root'}-${childNodeId}`,
          source: parentNode ? parentNode.id : 'node-extractor-root',
          sourceHandle: parentNode ? `sketch-out-${parentSketch.imageId}` : 'feature-out',
          target: childNodeId,
          targetHandle: `sketch-in-${refined.imageId}`,
          animated: true,
          style: { stroke: '#10B981', strokeWidth: 2.5 }
        }
      ]);

      setRefinementTarget(null);
      addToast(`Branched refinement node v${refined.iteration} (${refined.imageId}) created!`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Refinement failed. Please try again.', 'danger');
    } finally {
      setIsRefining(false);
    }
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

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
          <span className="text-[11px] font-mono text-slate-400 bg-navy-900 border border-slate-850 px-2 py-0.5 rounded">
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
