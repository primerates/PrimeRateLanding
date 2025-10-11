import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';
import FormSelect from './FormSelect';
import { STAGE_OPTIONS, getStageColor } from '../data/stageOptions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';
import DateInput from './DateInput';
import FormInput from './FormInput';
import ManageableSelect from './ManageableSelect';
import { BUILT_IN_SOURCES } from '../data/sourceOptions';

const BorrowerHeaderForm = () => {
    const form = useFormContext<InsertClient>();
    const { isShowingDMBatch, setIsShowingDMBatch } = useAdminAddClientStore();

    // Use form.watch for validation/conditional rendering
    const borrowerStage = form.watch('borrower.stage');

    return (
        <>
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

            <ManageableSelect
                label="Source"
                value={form.watch('borrower.source') || ''}
                builtInOptions={BUILT_IN_SOURCES}
                onValueChange={(value) => form.setValue('borrower.source', value as any)}
                testId="select-borrower-source"
                addDialogTitle='Add New Source'
                removeDialogTitle='Remove Source'
            />

            <DateInput
                label="Initial Call Date"
                value={form.watch('borrower.callDate') || ''}
                onChange={(value) => form.setValue('borrower.callDate', value)}
                id="borrower-callDate"
                testId="input-borrower-callDate"
            />

            <DateInput
                label="Loan Start Date"
                value={form.watch('borrower.startDate') || ''}
                onChange={(value) => form.setValue('borrower.startDate', value)}
                id="borrower-startDate"
                testId="input-borrower-startDate"
            />

            <FormInput
                label="Loan Duration"
                value={form.watch('borrower.loanDuration') || ''}
                onChange={(value) => form.setValue('borrower.loanDuration', value)}
                id="borrower-loanDuration"
                testId="input-borrower-loanDuration"
            />
        </>
    );
};

export default BorrowerHeaderForm;