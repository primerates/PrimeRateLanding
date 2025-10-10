import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { RotateCcw, Monitor } from 'lucide-react';
import { useState } from "react";
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';

interface AddClientHeaderProps {
    toast: (options: {
        title?: string;
        description?: string;
        variant?: 'default' | 'destructive';
    }) => void;
}

const AddClientHeader = ({ toast }: AddClientHeaderProps) => {

    const [showRevertAnimation, setShowRevertAnimation] = useState<boolean>(false);
    const [screenshareLoading, setScreenshareLoading] = useState<boolean>(false);

    const { setUnsavedChangesDialog } = useAdminAddClientStore();

    // Screenleap integration functionality
    const handleScreenshare = async () => {
        setScreenshareLoading(true);

        try {
            // Remove any existing screenleap script
            const existingScript = document.querySelector('script[src*="screenleap.js"]');
            if (existingScript) {
                existingScript.remove();
            }

            // Create and inject screenleap script for presenter role
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://integration.screenleap.com/screenleap.js';
            script.setAttribute('data-param', 'userId=438165&role=presenter');

            // Add script to document head
            document.head.appendChild(script);

            // Wait for script to load and initialize
            script.onload = () => {
                toast({
                    title: 'Screenshare Ready',
                    description: 'Screenleap presenter mode activated. You can now start screen sharing.',
                });
                setScreenshareLoading(false);
            };

            script.onerror = () => {
                toast({
                    title: 'Screenshare Error',
                    description: 'Failed to load screenleap integration',
                    variant: 'destructive',
                });
                setScreenshareLoading(false);
            };

        } catch (error: any) {
            toast({
                title: 'Screenshare Error',
                description: error.message || 'Failed to initialize screenleap',
                variant: 'destructive',
            });

            setScreenshareLoading(false);
        }
    };

    return (
        <header className="bg-primary text-primary-foreground shadow-lg border-b transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/20">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-black italic" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
                            Add New Client
                        </h1>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        // Trigger rotation animation
                                        setShowRevertAnimation(true);
                                        setTimeout(() => setShowRevertAnimation(false), 600);

                                        // Always show unsaved changes dialog when navigating away from Add Client page
                                        setUnsavedChangesDialog({ isOpen: true });
                                    }}
                                    className="text-primary-foreground hover:text-white hover:bg-green-600 p-2 transition-colors duration-200"
                                    data-testid="button-back-to-dashboard"
                                >
                                    <RotateCcw className={`h-6 w-6 ${showRevertAnimation ? 'animate-rotate-360' : ''}`} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" sideOffset={10} className="text-sm">
                                <p>Back to Dashboard</p>
                            </TooltipContent>
                        </Tooltip>
                        <Button
                            onClick={handleScreenshare}
                            disabled={screenshareLoading}
                            size="sm"
                            className="bg-primary-foreground text-primary hover:bg-green-600 hover:text-white"
                            data-testid="button-screenshare"
                        >
                            <Monitor className={`h-3 w-3 mr-2 transition-transform duration-500 ${screenshareLoading ? 'animate-spin' : ''}`} />
                            {screenshareLoading ? 'Starting...' : 'Screenshare'}
                        </Button>
                        <Button
                            // onClick={form.handleSubmit(onSubmit)}
                            // disabled={addClientMutation.isPending}
                            size="sm"
                            // className={`bg-white text-primary border hover:bg-green-600 hover:text-white transition-all duration-500 ${showEntryAnimation ? 'animate-roll-down' : ''
                            //     }`}
                            data-testid="button-save-client"
                        >
                            {/* <Save className={`h-3 w-3 mr-2 transition-transform duration-500 ${addClientMutation.isPending ? 'rotate-180' : ''}`} /> */}
                            {/* {addClientMutation.isPending ? 'Saving...' : 'Save'} */}
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AddClientHeader;