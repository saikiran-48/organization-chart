import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DndContext } from '@dnd-kit/core';
import EmployeeNode from '../EmployeeNodes';
import type { EmployeeTreeNode } from '../../../types/employeeTypes';
import { describe, test, expect, vi } from 'vitest';

// Mock ResizeObserver for JSDOM
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-ignore
global.ResizeObserver = MockResizeObserver as any;

function renderWithDnd(ui: React.ReactElement) {
  return render(<DndContext>{ui}</DndContext>);
}

function buildNode(partial?: Partial<EmployeeTreeNode>): EmployeeTreeNode {
  return {
    id: partial?.id ?? '1',
    name: partial?.name ?? 'Alice Anderson',
    designation: partial?.designation ?? 'Engineering Manager',
    team: partial?.team ?? 'Engineering',
    children: partial?.children ?? [],
  } as EmployeeTreeNode;
}

describe('EmployeeNode', () => {
  test('renders basic info and no connectors when there are no children', () => {
    const node = buildNode();
    renderWithDnd(<EmployeeNode node={node} />);

    expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
    expect(screen.getByText('Engineering Manager')).toBeInTheDocument();

    // No subordinate badge
    expect(screen.queryByTitle(/direct\/indirect reports/i)).not.toBeInTheDocument();

    // No children -> no connectors SVG
    expect(document.querySelector('.employee-node__connectors')).not.toBeInTheDocument();
  });

  test('invokes onNodeClick when clicked', () => {
    const node = buildNode();
    const onNodeClick = vi.fn();
    renderWithDnd(<EmployeeNode node={node} onNodeClick={onNodeClick} />);

    const card = document.querySelector('.employee-node') as HTMLElement;
    fireEvent.click(card);
    expect(onNodeClick).toHaveBeenCalledTimes(1 );
    expect(onNodeClick).toHaveBeenCalledWith(node);
  });

  test('applies highlighted class when isHighlighted is true', () => {
    const node = buildNode();
    renderWithDnd(<EmployeeNode node={node} isHighlighted />);
    const card = document.querySelector('.employee-node') as HTMLElement;
    expect(card).toHaveClass('employee-node--highlighted');
  });

  test('shows subordinate count badge for one child and draws two lines (parent-mid, mid-child)', () => {
    const child: EmployeeTreeNode = buildNode({ id: 'c1', name: 'Bob', designation: 'Engineer' });
    const node = buildNode({ children: [child] });
    renderWithDnd(<EmployeeNode node={node} />);

    // Subordinate count is the full subtree size (1 here)
    const badge = screen.getByTitle(/direct\/indirect reports/i);
    expect(badge).toHaveTextContent('1');

    // Connectors SVG exists
    const svg = document.querySelector('.employee-node__connectors') as SVGSVGElement;
    expect(svg).toBeInTheDocument();

    // There should be: 1 vertical parent->mid + 1 vertical mid->child = 2 lines
    const lines = svg.querySelectorAll('line');
    expect(lines.length).toBe(2);
  });

  test('draws four lines for two children (parent-mid, two mid->child, one horizontal)', () => {
    const child1: EmployeeTreeNode = buildNode({ id: 'c1', name: 'Bob', designation: 'Engineer' });
    const child2: EmployeeTreeNode = buildNode({ id: 'c2', name: 'Carol', designation: 'Engineer' });
    const node = buildNode({ children: [child1, child2] });
    renderWithDnd(<EmployeeNode node={node} />);

    const svg = document.querySelector('.employee-node__connectors') as SVGSVGElement;
    expect(svg).toBeInTheDocument();

    const lines = svg.querySelectorAll('line');
    expect(lines.length).toBe(4);
  });

  test('renders Avatar and TeamBadge content', () => {
    const node = buildNode({ name: 'Dana', team: 'Design', designation: 'Lead Designer' });
    renderWithDnd(<EmployeeNode node={node} />);

    // Avatar renders name (indirectly via alt or text); presence is enough here
    const nameEl = screen.getByText('Dana');
    const designationEl = screen.getByText('Lead Designer');
    expect(nameEl).toBeInTheDocument();
    expect(designationEl).toBeInTheDocument();

    // TeamBadge presence via team label (there may be multiple matches; pick one)
    const teamEls = screen.getAllByText(/Design/i);
    expect(teamEls.length).toBeGreaterThan(0);
    expect(teamEls[0]).toBeInTheDocument();
  });
});
