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
      style: { stroke: '#60A5FA', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#60A5FA',
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
        <Background color="#29374B" gap={24} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'promptNode') return '#60A5FA';
            if (node.type === 'featureExtractorNode') return '#2DD4BF';
            return '#3B82F6';
          }}
          maskColor="rgba(11, 17, 32, 0.85)"
          className="border border-[#29374B] rounded-lg"
        />
      </ReactFlow>
    </div>
  );
}

