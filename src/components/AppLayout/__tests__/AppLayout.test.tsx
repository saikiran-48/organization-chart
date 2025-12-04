// src/components/AppLayout/AppLayout.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppLayout } from '../AppLayout';

// Mock the child components - we're testing AppLayout, not its dependencies
vi.mock('../../../assets/headericon', () => ({
  default: () => <svg data-testid="header-icon" />,
}));

vi.mock('../../SidebarContainer/SideBar/Sidebar', () => ({
  Sidebar: () => <nav data-testid="sidebar">Sidebar</nav>,
}));

describe('AppLayout', () => {
  it('renders children correctly', () => {
    render(
      <AppLayout>
        <div data-testid="child-content">Hello World</div>
      </AppLayout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('displays the default company name when not provided', () => {
    render(<AppLayout><div /></AppLayout>);

    expect(screen.getByText('ABC Solutions')).toBeInTheDocument();
  });

  it('displays custom company name when provided', () => {
    render(<AppLayout companyName="My Company"><div /></AppLayout>);

    expect(screen.getByText('My Company')).toBeInTheDocument();
    expect(screen.queryByText('ABC Solutions')).not.toBeInTheDocument();
  });

  it('renders the header with logo icon', () => {
    render(<AppLayout><div /></AppLayout>);

    expect(screen.getByTestId('header-icon')).toBeInTheDocument();
  });

  it('renders the sidebar', () => {
    render(<AppLayout><div /></AppLayout>);

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });
});