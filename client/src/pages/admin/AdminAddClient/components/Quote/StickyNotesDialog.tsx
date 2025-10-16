import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StickyNote } from 'lucide-react';

interface StickyNotesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

const StickyNotesDialog = ({
  isOpen,
  onOpenChange,
  notes,
  onNotesChange
}: StickyNotesDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-yellow-100 border-yellow-300">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-yellow-900">
            <StickyNote className="h-5 w-5" />
            Quick Notes
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Type your quick notes here..."
            className="w-full min-h-[300px] p-4 bg-yellow-50 border border-yellow-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-800 placeholder:text-yellow-700/50"
            data-testid="textarea-sticky-notes"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StickyNotesDialog;
