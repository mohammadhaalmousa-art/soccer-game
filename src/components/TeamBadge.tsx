import React from 'react';
import { Team } from '../types';

interface TeamBadgeProps {
  team?: Team | null;
  teamId?: string;
  badgeEmoji?: string;
  logoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showGlow?: boolean;
}

export const getTeamLogoUrl = (teamOrId?: Team | string | null, customLogo?: string): string => {
  if (customLogo !== undefined) return customLogo;
  if (!teamOrId) return '';
  if (typeof teamOrId !== 'string') {
    if (teamOrId.logoUrl) return teamOrId.logoUrl;
    return '';
  }
  return '';
};

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  team,
  teamId,
  badgeEmoji,
  logoUrl,
  size = 'md',
  className = '',
  showGlow = false,
}) => {
  const effectiveId = team?.id || teamId || '';
  const effectiveLogoUrl = logoUrl !== undefined ? logoUrl : (team?.logoUrl || '');
  const effectiveEmoji = badgeEmoji || team?.badgeEmoji || (effectiveId === 'team_red' ? '🔴' : '🔵');

  const sizeClasses = {
    xs: 'w-4 h-4 text-xs',
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-10 h-10 text-xl',
    xl: 'w-14 h-14 text-2xl',
    '2xl': 'w-20 h-20 text-4xl',
  };

  const isRed = effectiveId === 'team_red' || (typeof effectiveId === 'string' && effectiveId.toLowerCase().includes('red'));
  const glowColor = isRed ? 'rgba(239, 68, 68, 0.4)' : 'rgba(6, 182, 212, 0.4)';

  if (effectiveLogoUrl && effectiveLogoUrl.trim() !== '') {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 select-none ${sizeClasses[size]} ${className}`}
        style={showGlow ? { filter: `drop-shadow(0 0 10px ${glowColor})` } : undefined}
      >
        <img
          src={effectiveLogoUrl}
          alt={team?.name || 'Team Badge'}
          className="w-full h-full object-contain pointer-events-none"
          loading="eager"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            if (target.parentElement) {
              target.parentElement.innerText = effectiveEmoji;
            }
          }}
        />
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {effectiveEmoji}
    </span>
  );
};

