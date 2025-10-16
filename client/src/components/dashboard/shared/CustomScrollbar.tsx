import { useRef, useEffect } from 'react';

interface CustomScrollbarProps {
  /**
   * Unique ID for this scrollbar instance (used to target the indicator element)
   */
  scrollbarId: string;
  
  /**
   * Children to render inside the scrollable container
   */
  children: React.ReactNode;
  
  /**
   * Additional className for the scrollable container
   */
  className?: string;
  
  /**
   * Show help text below scrollbar
   */
  showHelpText?: boolean;
}

/**
 * Reusable custom scrollbar component with purple-pink gradient indicator
 * Features:
 * - Draggable indicator
 * - Click-to-jump on track
 * - Auto-sizing based on content width
 * - Syncs with container scroll
 */
export function CustomScrollbar({ 
  scrollbarId, 
  children, 
  className = '',
  showHelpText = true 
}: CustomScrollbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorId = `${scrollbarId}-indicator`;

  // Handle track click to jump
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const tableContainer = containerRef.current;
    if (!tableContainer) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    tableContainer.scrollLeft = percentage * (tableContainer.scrollWidth - tableContainer.clientWidth);
  };

  // Handle indicator drag
  const handleIndicatorMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const indicator = e.currentTarget;
    const track = indicator.parentElement as HTMLDivElement;
    const tableContainer = containerRef.current;
    
    if (!tableContainer) return;
    
    indicator.style.cursor = 'grabbing';
    const startX = e.clientX;
    const startScrollLeft = tableContainer.scrollLeft;
    const trackWidth = track.offsetWidth;
    const scrollWidth = tableContainer.scrollWidth - tableContainer.clientWidth;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const scrollDelta = (deltaX / trackWidth) * scrollWidth;
      tableContainer.scrollLeft = startScrollLeft + scrollDelta;
    };
    
    const handleMouseUp = () => {
      indicator.style.cursor = 'grab';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle container scroll to update indicator
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollPercentage = e.currentTarget.scrollLeft / (e.currentTarget.scrollWidth - e.currentTarget.clientWidth);
    const indicator = document.getElementById(indicatorId);
    if (indicator) {
      const thumbWidth = (e.currentTarget.clientWidth / e.currentTarget.scrollWidth) * 100;
      indicator.style.width = `${Math.max(thumbWidth, 10)}%`;
      indicator.style.transform = `translateX(${scrollPercentage * (100 / thumbWidth - 1)}%)`;
    }
  };

  return (
    <>
      {/* Custom Scrollbar Track */}
      <div className="mb-4">
        <div 
          className="h-2 rounded-full overflow-hidden cursor-pointer bg-slate-700/50"
          style={{ position: 'relative' }}
          onClick={handleTrackClick}
        >
          <div 
            id={indicatorId}
            className="h-full rounded-full transition-all bg-gradient-to-r from-purple-500 to-pink-500"
            style={{ width: '30%', cursor: 'grab' }}
            onMouseDown={handleIndicatorMouseDown}
          />
        </div>
        {showHelpText && (
          <p className="text-xs mt-1 text-slate-400">
            ← Drag or click the scrollbar to navigate →
          </p>
        )}
      </div>

      {/* Scrollable Container */}
      <div 
        ref={containerRef}
        className={`overflow-x-auto scrollbar-custom ${className}`}
        onScroll={handleScroll}
      >
        {children}
      </div>
    </>
  );
}
