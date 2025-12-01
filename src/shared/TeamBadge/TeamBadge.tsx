import './TeamBadge.css';

interface TeamBadgeProps {
  team: string;
  size?: 'sm' | 'md';
}

const TEAM_COLORS: Record<string, string> = {
  Engineering: 'var(--team-engineering)',
  Product: 'var(--team-product)',
  Sales: 'var(--team-sales)',
  Marketing: 'var(--team-marketing)',
  Operations: 'var(--team-operations)',
  Finance: 'var(--team-finance)',
};

export function TeamBadge({ team, size = 'md' }: TeamBadgeProps) {
  const color = TEAM_COLORS[team] || 'var(--color-gray-500)';
  
  return (
    <span
      className={`team-badge team-badge--${size}`}
      style={{ '--team-color': color } as React.CSSProperties}
    >
      {team}
    </span>
  );
}