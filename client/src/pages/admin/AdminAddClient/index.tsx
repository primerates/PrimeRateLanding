import { useEffect } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import AddClientHeader from './components/Header';
import { useToast } from '@/hooks/use-toast';
import UnSavedChangesDialog from './dialogs/unsavedChanges';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import TabItem from './components/TabItem';
import { TABS_DATA } from './data/tabsData';
import { useAnimations } from './hooks/useAnimations';
import { insertClientSchema, type InsertClient } from '@shared/schema';
import { useForm, useWatch, useFormContext, UseFormReturn, Controller, FormProvider, useController } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { defaultClientFormValues } from './data/defaultFormValues';

const AddClientPage = () => {

    const { toast } = useToast();
    const { animations, triggerTabAnimation, updateAnimation } = useAnimations();

    useEffect(() => {
        // Trigger entry animation on component mount
        updateAnimation('showEntry', true);
        setTimeout(() => updateAnimation('showEntry', false), 1000);
    }, [updateAnimation]);

    const form = useForm<InsertClient>({
        resolver: zodResolver(insertClientSchema),
        defaultValues: defaultClientFormValues,
    });

    const onSubmit = (data: InsertClient) => {
        console.log("Form submitted successfully!", data);
    };

    const onError = (errors: any) => {
        console.log("Form validation errors:", errors);
        toast({
            title: "Form Validation Error",
            description: "Please check the form for errors and try again.",
            variant: "destructive"
        });
    };

    return (
        <TooltipProvider delayDuration={300}>
            <div className="min-h-screen bg-background">
                <AddClientHeader 
                    toast={toast} 
                    onSave={form.handleSubmit(onSubmit, onError)}
                    isSaving={form.formState.isSubmitting}
                />

                {/* Main Content */}
                <div className="container mx-auto px-6 py-8">
                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                    </FormProvider>
                </div>
            </div>

            <UnSavedChangesDialog />
        </TooltipProvider>
    );
};

export default AddClientPage;