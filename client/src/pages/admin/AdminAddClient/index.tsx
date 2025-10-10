import { TooltipProvider } from '@/components/ui/tooltip';
import AddClientHeader from './components/Header';
import { useToast } from '@/hooks/use-toast';

const AddClientPage = () => {

    const { toast } = useToast();

    return (
        <TooltipProvider delayDuration={300}>
            <div className="min-h-screen bg-background">
                <AddClientHeader toast={toast} />
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8">

            </div>

        </TooltipProvider>
    );
};

export default AddClientPage;