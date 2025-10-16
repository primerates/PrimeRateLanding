import { Plus, Minus } from 'lucide-react';

interface DashboardCardProps {
  /**
   * Card title
   */
  title: string | React.ReactNode;
  
  /**
   * Card content (only shown when expanded)
   */
  children: React.ReactNode;
  
  /**
   * Whether the card is minimized
   */
  isMinimized: boolean;
  
  /**
   * Callback when minimize/expand button is clicked
   */
  onToggleMinimize: () => void;
  
  /**
   * Optional actions to display in the header (buttons, dropdowns, etc.)
   */
  headerActions?: React.ReactNode;
  
  /**
   * Optional icon to display next to the title
   */
  titleIcon?: React.ReactNode;
  
  /**
   * Optional className for the card wrapper
   */
  className?: string;
  
  /**
   * Optional className for the content wrapper
   */
  contentClassName?: string;
  
  /**
   * Test ID for the card
   */
  testId?: string;
  
  /**
   * Test ID for the toggle button
   */
  toggleTestId?: string;
}

/**
 * Reusable dashboard card component with minimize/expand functionality
 * Features:
 * - Consistent styling (purple theme)
 * - Smooth 500ms animation
 * - Header with title and optional actions
 * - Minimize/expand toggle button
 */
export function DashboardCard({
  title,
  children,
  isMinimized,
  onToggleMinimize,
  headerActions,
  titleIcon,
  className = '',
  contentClassName = '',
  testId,
  toggleTestId
}: DashboardCardProps) {
  return (
    <div 
      className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl ${className}`}
      data-testid={testId}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {titleIcon}
          {typeof title === 'string' ? (
            <h3 className="text-xl font-bold text-white">{title}</h3>
          ) : (
            title
          )}
        </div>
        <div className="flex items-center gap-2">
          {headerActions}
          <button
            onClick={onToggleMinimize}
            className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
            title={isMinimized ? "Expand" : "Minimize"}
            data-testid={toggleTestId}
          >
            {isMinimized ? (
              <Plus className="w-5 h-5 text-purple-300" />
            ) : (
              <Minus className="w-5 h-5 text-purple-300" />
            )}
          </button>
        </div>
      </div>

      {/* Card Content with Animation */}
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isMinimized ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
        } ${contentClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
