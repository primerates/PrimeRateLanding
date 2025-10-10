import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';
import FormSelect from '../components/FormSelect';
import { STAGE_OPTIONS, getStageColor } from '../data/stageOptions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';

interface BorrowerTabProps {
    animations?: {
        showEntry: boolean;
        showBorrower: boolean;
    };
}

const BorrowerTab = ({ animations }: BorrowerTabProps) => {
    
    const form = useFormContext<InsertClient>();
    const { isShowingDMBatch, setIsShowingDMBatch } = useAdminAddClientStore();
    const [hasAnimated, setHasAnimated] = useState<boolean>(false);

    useEffect(() => {
        if (animations?.showEntry || animations?.showBorrower) {
            setHasAnimated(true);
        }
    }, [animations?.showEntry, animations?.showBorrower]);

    const getAnimationClasses = () => {
        if (animations?.showEntry) {
            return 'animate-roll-down-delayed opacity-100 transform translate-y-0';
        }
        if (animations?.showBorrower) {
            return 'animate-roll-down opacity-100 transform translate-y-0';
        }
        // Show if has been animated, otherwise hidden
        return hasAnimated ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4';
    };

    // Use form.watch for validation/conditional rendering
    const borrowerStage = form.watch('borrower.stage');

    return (
        <Card className={`transition-all duration-700 ${getAnimationClasses()}`}>
            <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-6">
                <FormSelect
                    label="Stage"
                    value={borrowerStage || 'Lead'}
                    onValueChange={(value) => form.setValue('borrower.stage', value as any)}
                    options={STAGE_OPTIONS}
                    placeholder="Lead"
                    testId="select-borrower-stage"
                    getOptionColor={getStageColor}
                />

                <div className="space-y-2 max-w-[75%]">
                    <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="borrower-leadRef" className="text-sm">
                            {isShowingDMBatch ? 'DM Batch' : 'Lead Reference'}
                        </Label>
                        <Switch
                            checked={isShowingDMBatch}
                            onCheckedChange={setIsShowingDMBatch}
                            data-testid="toggle-borrower-leadref"
                            className="scale-[0.8]"
                        />
                    </div>
                    <Input
                        id="borrower-leadRef"
                        {...form.register(isShowingDMBatch ? 'borrower.dmBatch' : 'borrower.leadRef')}
                        placeholder=""
                        data-testid="input-borrower-leadRef"
                    />
                </div>
            </CardContent>
        </Card>

    );
};

export default BorrowerTab;