import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  FileText,
  Building,
  ShieldAlert,
  Calendar,
  User,
  FolderOpen
} from 'lucide-react';
import { aiService } from '../services/aiService';
import type { GraphNode, GraphEdge } from '../types';
import { toast } from 'sonner';

export const KnowledgeGraph: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    aiService.getKnowledgeGraph().then((data) => {
      if (!data.nodes || data.nodes.length === 0) {
        setNodes([]);
        setEdges([]);
        return;
      }
      const radius = 180;
      const centerX = 350;
      const centerY = 240;

      const positionedNodes = data.nodes.map((node, idx) => {
        const angle = (idx / data.nodes.length) * 2 * Math.PI;
        return {
          ...node,
          x: idx === 0 ? centerX : centerX + radius * Math.cos(angle),
          y: idx === 0 ? centerY : centerY + radius * Math.sin(angle)
        };
      });

      setNodes(positionedNodes);
      setEdges(data.edges);
    });
  }, []);

  const getNodeIcon = (type: GraphNode['type']) => {
    switch (type) {
      case 'Document': return <FileText className="w-4 h-4 text-[#8B7355]" />;
      case 'Organization': return <Building className="w-4 h-4 text-[#5F4B35]" />;
      case 'Risk': return <ShieldAlert className="w-4 h-4 text-[#9A4F45]" />;
      case 'Deadline': return <Calendar className="w-4 h-4 text-[#A4773C]" />;
      case 'Person': return <User className="w-4 h-4 text-[#58745A]" />;
      default: return <Network className="w-4 h-4 text-[#8B7355]" />;
    }
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    toast.info(`Inspecting Node: ${node.label}`);
  };

  return (
    <div className="space-y-6 fade-in text-[#242321]">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#242321]">Enterprise Knowledge Graph</h1>
          <p className="text-xs text-[#6F6A62] mt-0.5">
            Semantic entity relationship mapping across documents, vendors, clauses, and risks.
          </p>
        </div>

        {/* CONTROLS */}
        {nodes.length > 0 && (
          <div className="flex items-center gap-2 bg-white border border-[#E4DED4] p-1.5 rounded-2xl shadow-warm-sm">
            <button
              onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.15))}
              className="p-1.5 rounded-xl hover:bg-[#FAF8F5] text-[#6F6A62]"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-[#6F6A62] px-1">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(Math.max(0.7, zoomLevel - 0.15))}
              className="p-1.5 rounded-xl hover:bg-[#FAF8F5] text-[#6F6A62]"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded-xl hover:bg-[#FAF8F5] text-[#6F6A62]"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {nodes.length === 0 ? (
        <div className="bg-white border border-[#E4DED4] rounded-2xl p-12 text-center shadow-warm-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F1EDE5] text-[#8B7355] flex items-center justify-center mx-auto">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading font-bold text-xl text-[#242321]">No entity graph data available yet.</h3>
            <p className="text-xs text-[#6F6A62]">
              Upload documents to extract entities and render semantic relationship graphs.
            </p>
          </div>
          <button
            onClick={() => navigate('/documents')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B7355] hover:bg-[#5F4B35] text-white font-semibold text-xs shadow-warm-sm transition"
          >
            Go to Document Library
          </button>
        </div>
      ) : (
        /* GRAPH CANVAS & NODE DRAWER CONTAINER */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* GRAPH SVG CANVAS */}
          <div className="lg:col-span-8 bg-white border border-[#E4DED4] rounded-2xl shadow-warm-sm p-4 overflow-hidden relative min-h-[520px] flex items-center justify-center">

            <div
              className="w-full h-full transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            >
              <svg className="w-full h-[480px]">
                {/* Render Edges */}
                {edges.map((edge) => {
                  const sourceNode = nodes.find((n) => n.id === edge.source);
                  const targetNode = nodes.find((n) => n.id === edge.target);

                  if (!sourceNode || !targetNode) return null;

                  const midX = ((sourceNode.x || 0) + (targetNode.x || 0)) / 2;
                  const midY = ((sourceNode.y || 0) + (targetNode.y || 0)) / 2;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={sourceNode.x}
                        y1={sourceNode.y}
                        x2={targetNode.x}
                        y2={targetNode.y}
                        stroke="#E4DED4"
                        strokeWidth="2"
                        strokeDasharray="4"
                      />
                      <text
                        x={midX}
                        y={midY - 4}
                        fill="#9A948A"
                        fontSize="9"
                        fontFamily="Inter"
                        textAnchor="middle"
                        className="bg-white font-medium"
                      >
                        {edge.label}
                      </text>
                    </g>
                  );
                })}

                {/* Render Nodes */}
                {nodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={() => handleNodeClick(node)}
                      className="cursor-pointer group"
                    >
                      <circle
                        r="22"
                        fill={isSelected ? '#E8E0D2' : '#FFFFFF'}
                        stroke={isSelected ? '#8B7355' : '#E4DED4'}
                        strokeWidth={isSelected ? '3' : '2'}
                        className="transition shadow-warm-sm group-hover:stroke-[#8B7355]"
                      />
                      <foreignObject x="-10" y="-10" width="20" height="20">
                        <div className="flex items-center justify-center w-full h-full">
                          {getNodeIcon(node.type)}
                        </div>
                      </foreignObject>
                      <text
                        y="34"
                        fill="#242321"
                        fontSize="10"
                        fontWeight="600"
                        fontFamily="Inter"
                        textAnchor="middle"
                      >
                        {node.label.length > 20 ? `${node.label.slice(0, 18)}...` : node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="absolute bottom-4 left-4 bg-[#FAF8F5] border border-[#E4DED4] p-2.5 rounded-xl text-[11px] text-[#6F6A62] space-y-1">
              <span className="font-bold text-[#242321] block">Legend</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#8B7355]"></span> Document</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#9A4F45]"></span> Risk</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#58745A]"></span> Person</span>
              </div>
            </div>
          </div>

          {/* NODE DETAIL PANEL */}
          <div className="lg:col-span-4 bg-white border border-[#E4DED4] rounded-2xl shadow-warm-sm p-5 min-h-[520px] flex flex-col justify-between">
            {selectedNode ? (
              <div className="space-y-4 fade-in">
                <div className="flex items-center justify-between border-b border-[#E4DED4] pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E8E0D2] text-[#8B7355] px-2 py-0.5 rounded-md">
                    {selectedNode.type} Node
                  </span>
                  <button onClick={() => setSelectedNode(null)} className="p-1 text-[#9A948A] hover:text-[#242321]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-lg text-[#242321]">{selectedNode.label}</h3>
                  <p className="text-xs text-[#6F6A62] mt-1">{selectedNode.details}</p>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E4DED4]/60 space-y-1">
                  <span className="text-[10px] font-bold text-[#9A948A] uppercase block">Connected Relationships</span>
                  <ul className="text-xs text-[#6F6A62] space-y-1">
                    {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).map(e => (
                      <li key={e.id} className="flex items-center justify-between p-1.5 rounded bg-white border border-[#E4DED4]">
                        <span>{e.label}</span>
                        <span className="font-semibold text-[#8B7355] text-[10px]">Active</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center space-y-2 text-[#9A948A]">
                <Network className="w-10 h-10 mx-auto text-[#E4DED4]" />
                <p className="text-xs">Click any node on the canvas to inspect entity connections and metadata.</p>
              </div>
            )}

            <div className="pt-4 border-t border-[#E4DED4] text-[11px] text-[#9A948A] text-center">
              DocuMind Graph RAG Engine
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
