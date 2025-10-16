import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pin, Minus, RotateCcw } from 'lucide-react';

interface PinReferencePopupProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  size: { width: number; height: number };
  onSizeChange: (size: { width: number; height: number }) => void;
  content: { type: 'text' | 'image'; data: string } | null;
  onContentChange: (content: { type: 'text' | 'image'; data: string } | null) => void;
}

const PinReferencePopup = ({
  isOpen,
  onClose,
  position,
  onPositionChange,
  size,
  onSizeChange,
  content,
  onContentChange
}: PinReferencePopupProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  if (!isOpen) return null;

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              onContentChange({ type: 'image', data: event.target?.result as string });
            };
            reader.readAsDataURL(blob);
          }
          return;
        }
      }
      const text = e.clipboardData.getData('text');
      if (text) {
        onContentChange({ type: 'text', data: text });
      }
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(300, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(200, startHeight + (moveEvent.clientY - startY));
      onSizeChange({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'default',
        overflow: 'hidden'
      }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest('.pin-body')) return;
        if ((e.target as HTMLElement).closest('.pin-resize-handle')) return;
        setIsDragging(true);
        setDragOffset({
          x: e.clientX - position.x,
          y: e.clientY - position.y
        });
      }}
      onMouseMove={(e) => {
        if (isDragging) {
          onPositionChange({
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y
          });
        }
      }}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      <Card className="w-full h-full shadow-lg flex flex-col">
        <CardHeader className="pb-3 bg-pink-600 text-white flex-shrink-0" style={{ cursor: 'grab' }}>
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm flex items-center gap-2">
              <Pin className="h-4 w-4" />
              Reference Viewer
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onContentChange(null)}
                className="h-6 w-6 p-0 text-white hover:bg-pink-700"
                title="Clear"
                data-testid="button-clear-pin-content"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 text-white hover:bg-pink-700"
                data-testid="button-close-pin-popup"
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pin-body flex-1 pt-4 overflow-auto">
          {!content ? (
            <div
              className="border-2 border-dashed border-pink-300 rounded-md p-6 h-full flex flex-col items-center justify-center gap-4 hover:border-pink-400 hover:bg-pink-50/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              onPaste={handlePaste}
              onClick={(e) => {
                (e.target as HTMLElement).focus();
              }}
              tabIndex={0}
              autoFocus
              data-testid="div-pin-paste-area"
            >
              <Pin className="h-12 w-12 text-pink-400" />
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground font-medium">
                  Click here, then paste your image or text
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Ctrl+V (Windows) or Cmd+V (Mac)
                </p>
                <p className="text-xs text-pink-500 font-medium">
                  Click this area to activate
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full w-full overflow-auto" data-testid="div-pin-content-display">
              {content.type === 'image' ? (
                <img
                  src={content.data}
                  alt="Reference"
                  className="max-w-full h-auto"
                  data-testid="img-pin-reference"
                />
              ) : (
                <div className="whitespace-pre-wrap break-words p-2" data-testid="text-pin-reference">
                  {content.data}
                </div>
              )}
            </div>
          )}
        </CardContent>
        {/* Resize Handle */}
        <div
          className="pin-resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeMouseDown}
          data-testid="div-pin-resize-handle"
        >
          <div className="absolute bottom-0 right-0 w-0 h-0 border-b-8 border-r-8 border-b-muted-foreground/30 border-r-transparent" />
        </div>
      </Card>
    </div>
  );
};

export default PinReferencePopup;
