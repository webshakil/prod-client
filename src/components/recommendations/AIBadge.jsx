// src/components/recommendations/AIBadge.jsx
// ✅ Visual AI Indicator Badge - Shows when content is powered by Shaped AI
import React from 'react';
import { Sparkles, Brain, Zap, Cpu } from 'lucide-react';

/**
 * 🤖 AI Badge Component
 * Clear visual indicator that content is powered by Shaped AI
 * 
 * Variants:
 * - 'full' - Large badge with text (for section headers)
 * - 'compact' - Small badge with icon only
 * - 'inline' - Inline text badge
 * - 'glow' - Animated glowing badge
 */
const AIBadge = ({ 
  variant = 'full', 
  source = 'Shaped AI',
  showTooltip = true,
  className = '',
}) => {
  
  // Full badge with text and animation
  if (variant === 'full') {
    return (
      <div 
        className={`
          inline-flex items-center gap-2 
          px-3 py-1.5 
          bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600
          text-white text-xs font-bold 
          rounded-full 
          shadow-lg shadow-purple-500/30
          animate-pulse
          ${className}
        `}
        title={showTooltip ? `Recommendations powered by ${source}` : undefined}
      >
        <Sparkles size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
        <span>🤖 AI Powered</span>
        <Brain size={14} />
      </div>
    );
  }

  // Compact icon-only badge
  if (variant === 'compact') {
    return (
      <div 
        className={`
          inline-flex items-center justify-center
          w-6 h-6
          bg-gradient-to-br from-violet-500 to-purple-600
          text-white
          rounded-full
          shadow-md shadow-purple-500/40
          ${className}
        `}
        title={showTooltip ? `AI Recommendation by ${source}` : undefined}
      >
        <Sparkles size={12} />
      </div>
    );
  }

  // Inline text badge
  if (variant === 'inline') {
    return (
      <span 
        className={`
          inline-flex items-center gap-1
          px-2 py-0.5
          bg-purple-100 text-purple-700
          text-[10px] font-semibold uppercase tracking-wide
          rounded
          ${className}
        `}
        title={showTooltip ? `Powered by ${source}` : undefined}
      >
        <Cpu size={10} />
        AI
      </span>
    );
  }

  // Glowing animated badge
  if (variant === 'glow') {
    return (
      <div 
        className={`
          relative inline-flex items-center gap-2
          px-4 py-2
          bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500
          text-white text-sm font-bold
          rounded-xl
          ${className}
        `}
        title={showTooltip ? `Smart recommendations by ${source}` : undefined}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 rounded-xl blur-lg opacity-50 animate-pulse" />
        
        {/* Content */}
        <div className="relative flex items-center gap-2">
          <Zap size={16} className="animate-bounce" />
          <span>Powered by {source}</span>
          <Sparkles size={16} />
        </div>
      </div>
    );
  }

  // Default
  return (
    <div 
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1
        bg-gradient-to-r from-purple-500 to-indigo-500
        text-white text-xs font-semibold
        rounded-lg
        ${className}
      `}
    >
      <Sparkles size={12} />
      <span>AI</span>
    </div>
  );
};

/**
 * 📊 Non-AI Badge Component
 * Shows when content is NOT AI-powered (standard/manual)
 */
export const NonAIBadge = ({ 
  variant = 'full',
  label = 'Standard',
  className = '',
}) => {
  if (variant === 'full') {
    return (
      <div 
        className={`
          inline-flex items-center gap-2
          px-3 py-1.5
          bg-gray-100 text-gray-600
          text-xs font-medium
          rounded-full
          border border-gray-200
          ${className}
        `}
      >
        <span>📋</span>
        <span>{label}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div 
        className={`
          inline-flex items-center justify-center
          w-6 h-6
          bg-gray-100 text-gray-500
          rounded-full
          border border-gray-200
          ${className}
        `}
        title="Standard listing"
      >
        <span className="text-xs">📋</span>
      </div>
    );
  }

  return (
    <span 
      className={`
        inline-flex items-center gap-1
        px-2 py-0.5
        bg-gray-100 text-gray-600
        text-[10px] font-medium uppercase
        rounded
        ${className}
      `}
    >
      {label}
    </span>
  );
};

/**
 * 🏷️ Source Badge - Shows the recommendation source
 */
export const SourceBadge = ({ isAIPowered, source }) => {
  if (isAIPowered) {
    return (
      <div className="flex items-center gap-2">
        <AIBadge variant="inline" source={source} />
        <span className="text-[10px] text-purple-600 font-medium">
          via {source || 'Shaped AI'}
        </span>
      </div>
    );
  }

  return (
    <NonAIBadge variant="inline" label="Manual" />
  );
};

export default AIBadge;