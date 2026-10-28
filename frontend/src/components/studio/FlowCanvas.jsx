import React, { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import PromptNode from './PromptNode';
import FeatureExtractorNode from './FeatureExtractorNode';
import CandidateSketchNode from './CandidateSketchNode';

const nodeTypes = {
  promptNode: PromptNode,
  featureExtractorNode: FeatureExtractorNode,
  candidateSketchNode: CandidateSketchNode
};

export default function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onInit
}) {
  const defaultEdgeOptions = useMemo(
    () => ({
      animated: true,
      style: { stroke: '#38BDF8', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#38BDF8',
        width: 14,
        height: 14
      }
    }),
    []
  );

  return (
    <div className="w-full h-full relative forensic-grid">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1E293B" gap={24} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'promptNode') return '#38BDF8';
            if (node.type === 'featureExtractorNode') return '#10B981';
            return '#0284C7';
          }}
          maskColor="rgba(6, 10, 18, 0.85)"
          className="border border-slate-800 rounded-lg"
        />
      </ReactFlow>
    </div>
  );
}
