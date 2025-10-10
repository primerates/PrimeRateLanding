import { useEffect } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import AddClientHeader from './components/Header';
import { useToast } from '@/hooks/use-toast';
import UnSavedChangesDialog from './dialogs/unsavedChanges';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import TabItem from './components/TabItem';
import { TABS_DATA } from './data/tabsData';
import { useAnimations } from './hooks/useAnimations';

const AddClientPage = () => {

    const { toast } = useToast();
    const { animations, triggerTabAnimation, updateAnimation } = useAnimations();

    useEffect(() => {
        // Trigger entry animation on component mount
        updateAnimation('showEntry', true);
        setTimeout(() => updateAnimation('showEntry', false), 1000);
    }, [updateAnimation]);

    return (
        <TooltipProvider delayDuration={300}>
            <div className="min-h-screen bg-background">
                <AddClientHeader toast={toast} />

                {/* Main Content */}
                <div className="container mx-auto px-6 py-8">
                    <form>
                        <Tabs defaultValue="client" className="space-y-6" onValueChange={triggerTabAnimation}>
                            <TabsList className="grid w-full grid-cols-9 bg-transparent h-auto p-0 relative border-b border-gray-200 group">
                                {TABS_DATA.map((tab) => (
                                    <TabItem key={tab.value} tab={tab} />
                                ))}
                            </TabsList>

                            {TABS_DATA.map((tab) => {
                                const Component = tab.component;
                                return (
                                    <TabsContent key={tab.value} value={tab.value} className="space-y-6">
                                        <Component animations={animations} />
                                    </TabsContent>
                                );
                            })}
                        </Tabs>
                    </form>
                </div>
            </div>

            <UnSavedChangesDialog />
        </TooltipProvider>
    );
};

export default AddClientPage;