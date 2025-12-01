import  { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import './EmployeeNodes.css';
import type { EmployeeTreeNode } from '../../types/employeeTypes';
import { Avatar } from '../../shared/Avatar/Avatar';
import { TeamBadge } from '../../shared/TeamBadge/TeamBadge';

interface EmployeeNodeProps {
  node: EmployeeTreeNode;
  isHighlighted?: boolean;
  onNodeClick?: (node: EmployeeTreeNode) => void;
}

type Line = { x1: number; y1: number; x2: number; y2: number };

export function EmployeeNode({ node, isHighlighted, onNodeClick }: EmployeeNodeProps) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const childrenRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [lines, setLines] = useState<Line[]>([]);

  // draggable
  const {
    attributes: dragAttributes,
    listeners: dragListeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: node.id,
    data: { employee: node },
  });

  // droppable
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${node.id}`,
    data: { employee: node },
  });

  // combine refs
  const setNodeRefCallback = useCallback((el: HTMLDivElement | null) => {
    setDragRef(el);
    setDropRef(el);
    nodeRef.current = el;
  }, [setDragRef, setDropRef]);

  // calculate connector lines
  const calculateLines = useCallback(() => {
    const parentEl = nodeRef.current;
    const containerEl = childrenRef.current;
    if (!parentEl || !containerEl) {
      setLines([]);
      return;
    }

    const parentRect = parentEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();

    const childNodes = containerEl.querySelectorAll(':scope > .employee-node-wrapper > .employee-node');
    if (!childNodes || childNodes.length === 0) {
      setLines([]);
      return;
    }

    const newLines: Line[] = [];

    // Parent bottom center relative to container coordinates
    const parentBottomX = parentRect.left + parentRect.width / 2 - containerRect.left;
    const parentBottomY = parentRect.bottom - containerRect.top;

    // midY is a small offset below parent; tweak if necessary
    const midY = parentBottomY + 36;

    // vertical parent -> mid
    newLines.push({
      x1: parentBottomX,
      y1: parentBottomY,
      x2: parentBottomX,
      y2: midY,
    });

    const childPositions: number[] = [];

    childNodes.forEach((childNode) => {
      const childRect = (childNode as HTMLElement).getBoundingClientRect();
      const childTopX = childRect.left + childRect.width / 2 - containerRect.left;
      const childTopY = childRect.top - containerRect.top;

      childPositions.push(childTopX);

      // vertical mid -> child
      newLines.push({
        x1: childTopX,
        y1: midY,
        x2: childTopX,
        y2: childTopY,
      });
    });

    // horizontal connecting line between children (if more than one)
    if (childPositions.length > 1) {
      const leftMost = Math.min(...childPositions);
      const rightMost = Math.max(...childPositions);

      // clamp horizontal to between leftMost and rightMost
      newLines.push({
        x1: leftMost,
        y1: midY,
        x2: rightMost,
        y2: midY,
      });
    } else {
      // single child: no horizontal line required (optional)
    }

    setLines(newLines);

    // update svg viewBox/size so coordinates map 1:1
    if (svgRef.current) {
      const w = Math.max(1, containerEl.clientWidth);
      const h = Math.max(1, containerEl.clientHeight);
      svgRef.current.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svgRef.current.setAttribute('width', `${w}`);
      svgRef.current.setAttribute('height', `${h}`);
    }
  }, [node.children]);

  // run once layout stable, keep responsive with ResizeObserver
  useLayoutEffect(() => {
    calculateLines(); // initial
  }, [calculateLines, isDragging, node.children.length]);

  useEffect(() => {
    const container = childrenRef.current;
    const parent = nodeRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      calculateLines();
    });

    ro.observe(container);
    if (parent) ro.observe(parent);

    window.addEventListener('resize', calculateLines);

    // cleanup
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', calculateLines);
    };
  }, [calculateLines]);

  // recompute when children change length (already in deps) or on drag end
  useEffect(() => {
    calculateLines();
  }, [node.children.length, isDragging, calculateLines]);

  const subordinateCount = (() => {
    // lightweight fallback: count subtree size (simple)
    const count = (n: EmployeeTreeNode | undefined): number => {
      if (!n || !n.children) return 0;
      return n.children.reduce((acc:any, c:any) => acc + 1 + count(c), 0);
    };
    return count(node);
  })();

  return (
    <div className="employee-node-wrapper">
      <div
        ref={setNodeRefCallback}
        className={`employee-node ${isDragging ? 'employee-node--dragging' : ''} ${
          isOver ? 'employee-node--drop-target' : ''
        } ${isHighlighted ? 'employee-node--highlighted' : ''}`}
        onClick={() => onNodeClick?.(node)}
        {...dragAttributes}
        {...dragListeners}
      >
        <div className="employee-node__header">
          <Avatar name={node.name} size="lg" />
          {subordinateCount > 0 && (
            <span className="employee-node__count" title={`${subordinateCount} direct/indirect reports`}>
              {subordinateCount}
            </span>
          )}
        </div>

        <div className="employee-node__content">
          <h3 className="employee-node__name">{node.name}</h3>
          <p className="employee-node__designation">{node.designation}</p>
          <TeamBadge team={node.team} size="sm" />
        </div>

        <div className="employee-node__drag-hint" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
        </div>
      </div>

      {node.children && node.children.length > 0 && (
        <div className="employee-node__children" ref={childrenRef}>
          <svg className="employee-node__connectors" ref={svgRef} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            {lines.map((line, i) => (
              <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#d1d5db" strokeWidth={2} />
            ))}
          </svg>

          {node.children.map((child:any) => (
            <EmployeeNode key={child.id} node={child} isHighlighted={isHighlighted} onNodeClick={onNodeClick} />
          ))}
        </div>
      )}
    </div>
  );
}

export default EmployeeNode;
