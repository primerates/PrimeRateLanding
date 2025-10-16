import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Minus } from 'lucide-react';

interface PageEditorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  content: string;
  onContentChange: (content: string) => void;
  fontSize: string;
  onFontSizeChange: (size: string) => void;
  fontColor: string;
  onFontColorChange: (color: string) => void;
}

const PageEditorPopup = ({
  isOpen,
  onClose,
  position,
  onPositionChange,
  content,
  onContentChange,
  fontSize,
  onFontSizeChange,
  fontColor,
  onFontColorChange
}: PageEditorPopupProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest('.page-body')) return;
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
      <Card className="w-96 shadow-lg">
        <CardHeader className="pb-3 bg-purple-600 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Page Editor
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-white hover:bg-purple-700"
              data-testid="button-close-page-popup"
            >
              <Minus className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="page-body pt-4 space-y-4">
          {/* Font Controls */}
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <Label htmlFor="page-font-size" className="text-xs mb-1 block">
                Font Size
              </Label>
              <Select value={fontSize} onValueChange={onFontSizeChange}>
                <SelectTrigger id="page-font-size" className="h-8" data-testid="select-page-font-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="12" data-testid="font-size-12">12px</SelectItem>
                  <SelectItem value="14" data-testid="font-size-14">14px</SelectItem>
                  <SelectItem value="16" data-testid="font-size-16">16px</SelectItem>
                  <SelectItem value="18" data-testid="font-size-18">18px</SelectItem>
                  <SelectItem value="20" data-testid="font-size-20">20px</SelectItem>
                  <SelectItem value="24" data-testid="font-size-24">24px</SelectItem>
                  <SelectItem value="28" data-testid="font-size-28">28px</SelectItem>
                  <SelectItem value="32" data-testid="font-size-32">32px</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="page-font-color" className="text-xs mb-1 block">
                Font Color
              </Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  id="page-font-color"
                  value={fontColor}
                  onChange={(e) => onFontColorChange(e.target.value)}
                  className="h-8 w-12 rounded border border-input cursor-pointer"
                  data-testid="input-page-font-color"
                />
                <Input
                  type="text"
                  value={fontColor}
                  onChange={(e) => onFontColorChange(e.target.value)}
                  className="h-8 flex-1 font-mono text-xs"
                  data-testid="input-page-font-color-text"
                />
              </div>
            </div>
          </div>

          {/* Text Display Area */}
          <div className="border rounded-md p-3 min-h-[200px] bg-background">
            <div
              style={{
                fontSize: `${fontSize}px`,
                color: fontColor,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
              data-testid="text-page-display"
            >
              {content || 'Start typing below...'}
            </div>
          </div>

          {/* Text Input Area */}
          <div>
            <Label htmlFor="page-content-input" className="text-xs mb-1 block">
              Type your content
            </Label>
            <textarea
              id="page-content-input"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Type your content here..."
              className="w-full min-h-[100px] p-3 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              data-testid="textarea-page-content"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageEditorPopup;
