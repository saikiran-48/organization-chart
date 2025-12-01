/**
 * Avatar Component
 * 
 * Displays user avatar with fallback to initials
 */

import { useMemo } from 'react';
import './Avatar.css';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Generate consistent colors based on name
function getColorFromName(name: string): string {
  const colors = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#ec4899', // pink
  ];
  
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const backgroundColor = useMemo(() => getColorFromName(name), [name]);
  const initials = useMemo(() => getInitials(name), [name]);

  return (
    <div
      className={`avatar avatar--${size} ${className}`}
      style={{ backgroundColor: src ? undefined : backgroundColor }}
    >
      {src ? (
        <img src={src} alt={name} className="avatar__image" />
      ) : (
        <span className="avatar__initials">{initials}</span>
      )}
    </div>
  );
}