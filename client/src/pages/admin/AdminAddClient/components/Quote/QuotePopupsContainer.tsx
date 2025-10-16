import PinReferencePopup from './PinReferencePopup';
import PageEditorPopup from './PageEditorPopup';
import StickyNotesDialog from './StickyNotesDialog';
import GuidelinesLibraryDialog from './GuidelinesLibraryDialog';
import CalculatorPopup from './CalculatorPopup';

interface QuotePopupsContainerProps {
    // Pin Reference
    showPinPopup: boolean;
    onPinPopupClose: () => void;
    pinPopupPosition: { x: number; y: number };
    onPinPopupPositionChange: (position: { x: number; y: number }) => void;
    pinPopupSize: { width: number; height: number };
    onPinPopupSizeChange: (size: { width: number; height: number }) => void;
    pinContent: { type: 'text' | 'image'; data: string } | null;
    onPinContentChange: (content: { type: 'text' | 'image'; data: string } | null) => void;

    // Page Editor
    showPagePopup: boolean;
    onPagePopupClose: () => void;
    pagePopupPosition: { x: number; y: number };
    onPagePopupPositionChange: (position: { x: number; y: number }) => void;
    pageContent: string;
    onPageContentChange: (content: string) => void;
    pageFontSize: string;
    onPageFontSizeChange: (size: string) => void;
    pageFontColor: string;
    onPageFontColorChange: (color: string) => void;

    // Sticky Notes
    isStickyNotesOpen: boolean;
    onStickyNotesOpenChange: (open: boolean) => void;
    stickyNotes: string;
    onStickyNotesChange: (notes: string) => void;

    // Guidelines Library
    showLibraryDialog: boolean;
    onLibraryDialogOpenChange: (open: boolean) => void;
    libraryConfigurations: Record<string, any>;
    onDeleteConfiguration: (key: string) => void;
    onLoadConfiguration: (config: any) => void;

    // Calculator
    showCalculator: boolean;
    onCalculatorClose: () => void;
    calculatorPosition: { x: number; y: number };
    onCalculatorPositionChange: (position: { x: number; y: number }) => void;
}

const QuotePopupsContainer = ({
    showPinPopup,
    onPinPopupClose,
    pinPopupPosition,
    onPinPopupPositionChange,
    pinPopupSize,
    onPinPopupSizeChange,
    pinContent,
    onPinContentChange,
    showPagePopup,
    onPagePopupClose,
    pagePopupPosition,
    onPagePopupPositionChange,
    pageContent,
    onPageContentChange,
    pageFontSize,
    onPageFontSizeChange,
    pageFontColor,
    onPageFontColorChange,
    isStickyNotesOpen,
    onStickyNotesOpenChange,
    stickyNotes,
    onStickyNotesChange,
    showLibraryDialog,
    onLibraryDialogOpenChange,
    libraryConfigurations,
    onDeleteConfiguration,
    onLoadConfiguration,
    showCalculator,
    onCalculatorClose,
    calculatorPosition,
    onCalculatorPositionChange,
}: QuotePopupsContainerProps) => {
    return (
        <>
            {/* Pin Reference Popup */}
            <PinReferencePopup
                isOpen={showPinPopup}
                onClose={onPinPopupClose}
                position={pinPopupPosition}
                onPositionChange={onPinPopupPositionChange}
                size={pinPopupSize}
                onSizeChange={onPinPopupSizeChange}
                content={pinContent}
                onContentChange={onPinContentChange}
            />

            {/* Page Editor Popup */}
            <PageEditorPopup
                isOpen={showPagePopup}
                onClose={onPagePopupClose}
                position={pagePopupPosition}
                onPositionChange={onPagePopupPositionChange}
                content={pageContent}
                onContentChange={onPageContentChange}
                fontSize={pageFontSize}
                onFontSizeChange={onPageFontSizeChange}
                fontColor={pageFontColor}
                onFontColorChange={onPageFontColorChange}
            />

            {/* Sticky Notes Dialog */}
            <StickyNotesDialog
                isOpen={isStickyNotesOpen}
                onOpenChange={onStickyNotesOpenChange}
                notes={stickyNotes}
                onNotesChange={onStickyNotesChange}
            />

            {/* Guidelines Library Dialog */}
            <GuidelinesLibraryDialog
                isOpen={showLibraryDialog}
                onOpenChange={onLibraryDialogOpenChange}
                libraryConfigurations={libraryConfigurations}
                onDeleteConfiguration={onDeleteConfiguration}
                onLoadConfiguration={onLoadConfiguration}
            />

            {/* Calculator Popup */}
            <CalculatorPopup
                isOpen={showCalculator}
                onClose={onCalculatorClose}
                position={calculatorPosition}
                onPositionChange={onCalculatorPositionChange}
            />
        </>
    );
};

export default QuotePopupsContainer;
