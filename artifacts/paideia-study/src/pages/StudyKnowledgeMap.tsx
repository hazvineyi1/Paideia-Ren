import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  useStudyKnowledgeGraph,
  useStudyKnowledgeGenerate,
  type KnowledgeNode,
  type KnowledgeEdge,
} from "@/hooks/use-study-api";
import { useListStudyMaterials } from "@workspace/api-client-react";
import {
  ArrowLeft, Network, Brain, ZoomIn, ZoomOut, Maximize2,
  Target, BookOpen, ChevronRight, Filter, Search, Layers, Plus, Loader2,
} from "lucide-react";

// Assign deterministic positions based on node index
function getNodePosition(index: number, total: number) {
  const cols = Math.ceil(Math.sqrt(total));
  const col = index % cols;
  const row = Math.floor(index / cols);
  const spacing = 160;
  return {
    x: 150 + col * spacing + (row % 2) * (spacing / 2),
    y: 120 + row * spacing * 0.8,
  };
}

const COLORS: Record<string, string> = {
  Biology: "#3b82f6",
  Genetics: "#10b981",
  Biochemistry: "#f59e0b",
  Chemistry: "#8b5cf6",
  "Cell Biology": "#3b82f6",
  Physiology: "#10b981",
  General: "#666666",
};

function getMasteryColor(mastery: number) {
  if (mastery >= 80) return "#10b981";
  if (mastery >= 60) return "#3b82f6";
  if (mastery >= 40) return "#f59e0b";
  return "#ef4444";
}

function getMasteryFill(mastery: number) {
  return `${getMasteryColor(mastery)}20`;
}

export default function StudyKnowledgeMap() {
  const [, setLoc] = useLocation();
  const { data: kgraph, isLoading: graphLoading, refetch } = useStudyKnowledgeGraph();
  const generateMutation = useStudyKnowledgeGenerate();
  const { data: materials } = useListStudyMaterials();

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build positioned nodes from API data + fallback to sample data
  const nodes: Array<KnowledgeNode & { x: number; y: number }> = useMemo(() => {
    const apiNodes = kgraph?.nodes ?? [];
    if (apiNodes.length > 0) {
      return apiNodes.map((n, i) => ({
        ...n,
        ...getNodePosition(i, apiNodes.length),
      }));
    }
    return [];
  }, [kgraph]);

  const edges = kgraph?.edges ?? [];

  const categories = useMemo(() => [...new Set(nodes.map((n) => n.category || "General"))], [nodes]);

  const filteredNodes = nodes.filter((n) => {
    const matchesSearch = !searchQuery || n.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || (n.category || "General") === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => Math.max(0.3, Math.min(3, s * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as Element;
    if (target.tagName.toLowerCase() === "svg" || target.closest("svg") === svgRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleGenerate = async (materialId: string) => {
    setGeneratingFor(materialId);
    try {
      await generateMutation.mutateAsync({ materialId });
      await refetch();
    } catch (err) {
      alert("Failed to generate knowledge graph.");
    } finally {
      setGeneratingFor(null);
    }
  };

  const avgMastery = nodes.length > 0 ? Math.round(nodes.reduce((sum, n) => sum + (n.masteryLevel || 0) * 100, 0) / nodes.length) : 0;
  const masteredCount = nodes.filter((n) => (n.masteryLevel || 0) >= 0.8).length;
  const weakCount = nodes.filter((n) => (n.masteryLevel || 0) < 0.5).length;

  // Build edge lines
  const edgeLines = edges
    .map((e) => {
      const source = nodes.find((n) => n.id === e.sourceNodeId);
      const target = nodes.find((n) => n.id === e.targetNodeId);
      if (!source || !target) return null;
      return { source, target, relationType: e.relationType, strength: e.strength };
    })
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between bg-background/80 backdrop-blur-sm shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLoc("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            <h1 className="font-semibold text-sm">Knowledge Map</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {nodes.length === 0 && materials && materials.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">Generate from:</span>
              <select
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                onChange={(e) => { if (e.target.value) handleGenerate(e.target.value); }}
                value=""
              >
                <option value="">Select material...</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
              {generatingFor && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => { setScale(1); setPan({ x: 0, y: 0 }); }}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="shrink-0 border-b px-4 py-2 flex items-center gap-6 bg-muted/30">
        <div className="flex items-center gap-1.5">
          <Brain className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium">{nodes.length} concepts</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-xs font-medium">{masteredCount} mastered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-orange-500" />
          <span className="text-xs font-medium">{weakCount} weak areas</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground">Avg mastery</span>
          <Progress value={avgMastery} className="w-24 h-1.5" />
          <span className="text-xs font-medium">{avgMastery}%</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[260px] border-r bg-muted/10 flex flex-col shrink-0 overflow-y-auto">
          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-background pl-8 pr-3 text-sm"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="p-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Categories
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setCategoryFilter(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!categoryFilter ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5" />
                  All Categories
                  <span className="ml-auto text-xs text-muted-foreground">{nodes.length}</span>
                </div>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryFilter === cat ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[cat] || "#666" }} />
                    {cat}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {nodes.filter((n) => (n.category || "General") === cat).length}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Node Detail */}
          {selectedNode ? (
            <div className="p-3 mt-auto border-t">
              <Card className="border-primary/20">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 mb-1.5"
                        style={{ borderColor: COLORS[selectedNode.category || "General"] || "#666", color: COLORS[selectedNode.category || "General"] || "#666" }}
                      >
                        {selectedNode.category || "General"}
                      </Badge>
                      <h3 className="font-semibold text-sm">{selectedNode.label}</h3>
                    </div>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: getMasteryFill((selectedNode.masteryLevel || 0) * 100), color: getMasteryColor((selectedNode.masteryLevel || 0) * 100) }}
                    >
                      {Math.round((selectedNode.masteryLevel || 0) * 100)}%
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    {selectedNode.description || "No description available."}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium">{Math.round((selectedNode.confidenceScore || 0) * 100)}%</span>
                    </div>
                    <Progress value={(selectedNode.confidenceScore || 0) * 100} className="h-1" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Reviews</span>
                      <span className="font-medium">{selectedNode.reviewCount}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-3 text-xs"
                    onClick={() => setLoc("/practice")}
                  >
                    <Target className="h-3 w-3 mr-1.5" />
                    Practice This Concept
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </aside>

        {/* Graph Canvas */}
        <div className="flex-1 relative overflow-hidden" ref={containerRef}>
          {graphLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : nodes.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Network className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">No knowledge graph yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                Add a material and generate your knowledge graph to see how concepts connect.
              </p>
              {materials && materials.length > 0 ? (
                <div className="flex items-center gap-2">
                  <select
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    onChange={(e) => { if (e.target.value) handleGenerate(e.target.value); }}
                    value=""
                  >
                    <option value="">Select material...</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                  {generatingFor && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                </div>
              ) : (
                <Button size="sm" onClick={() => setLoc("/materials/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              )}
            </div>
          ) : (
            <svg
              ref={svgRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              viewBox="0 0 800 500"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <defs>
                <filter id="shadow">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1" />
                </filter>
              </defs>
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
                {/* Edges */}
                {edgeLines.map((edge, i) => {
                  if (!edge) return null;
                  const isHighlighted = selectedNode && (edge.source.id === selectedNode.id || edge.target.id === selectedNode.id);
                  return (
                    <line
                      key={i}
                      x1={edge.source.x}
                      y1={edge.source.y}
                      x2={edge.target.x}
                      y2={edge.target.y}
                      stroke={isHighlighted ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                      strokeWidth={isHighlighted ? 2 : 1}
                      opacity={isHighlighted ? 0.6 : 0.2}
                      strokeDasharray={edge.relationType === "prerequisite" ? "6 3" : edge.relationType === "extension" ? "3 3" : undefined}
                    />
                  );
                })}

                {/* Nodes */}
                {filteredNodes.map((node) => {
                  const radius = 12 + (node.masteryLevel || 0) * 18;
                  const isSelected = selectedNode?.id === node.id;
                  const color = COLORS[node.category || "General"] || "#666";
                  const fillOpacity = 0.12 + (node.masteryLevel || 0) * 0.28;

                  return (
                    <g
                      key={node.id}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNode(node);
                      }}
                      filter={isSelected ? "url(#shadow)" : undefined}
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius}
                        fill={color}
                        fillOpacity={fillOpacity}
                        stroke={isSelected ? "hsl(var(--primary))" : color}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        strokeOpacity={isSelected ? 1 : 0.6}
                      />
                      <text
                        x={node.x}
                        y={node.y + radius + 14}
                        textAnchor="middle"
                        className="text-[9px] fill-foreground font-medium select-none pointer-events-none"
                        style={{ fontSize: 9 }}
                      >
                        {node.label}
                      </text>
                      <text
                        x={node.x}
                        y={node.y + radius + 26}
                        textAnchor="middle"
                        className="text-[7px] fill-muted-foreground select-none pointer-events-none"
                        style={{ fontSize: 7 }}
                      >
                        {Math.round((node.masteryLevel || 0) * 100)}%
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          )}

          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-1">
            <Button variant="secondary" size="sm" className="h-8 w-8 p-0" onClick={() => setScale((s) => Math.min(3, s * 1.2))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm" className="h-8 w-8 p-0" onClick={() => setScale((s) => Math.max(0.3, s * 0.8))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
