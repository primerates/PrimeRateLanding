import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InsertClient } from '@shared/schema';
import FormInput from '../components/FormInput';

const VendorsTab = () => {
    const form = useFormContext<InsertClient>();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vendors Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormInput
                    label="Realtor"
                    value={form.watch('vendors.realtor') || ''}
                    onChange={(value) => form.setValue('vendors.realtor', value)}
                    id="vendors-realtor"
                    testId="input-vendors-realtor"
                />
                
                <FormInput
                    label="Appraiser"
                    value={form.watch('vendors.appraiser') || ''}
                    onChange={(value) => form.setValue('vendors.appraiser', value)}
                    id="vendors-appraiser"
                    testId="input-vendors-appraiser"
                />
                
                <FormInput
                    label="Title Company"
                    value={form.watch('vendors.titleCompany') || ''}
                    onChange={(value) => form.setValue('vendors.titleCompany', value)}
                    id="vendors-titleCompany"
                    testId="input-vendors-titleCompany"
                />
                
                <FormInput
                    label="Inspector"
                    value={form.watch('vendors.inspector') || ''}
                    onChange={(value) => form.setValue('vendors.inspector', value)}
                    id="vendors-inspector"
                    testId="input-vendors-inspector"
                />
                
                <FormInput
                    label="Insurance"
                    value={form.watch('vendors.insurance') || ''}
                    onChange={(value) => form.setValue('vendors.insurance', value)}
                    id="vendors-insurance"
                    testId="input-vendors-insurance"
                />
                
                <FormInput
                    label="Attorney"
                    value={form.watch('vendors.attorney') || ''}
                    onChange={(value) => form.setValue('vendors.attorney', value)}
                    id="vendors-attorney"
                    testId="input-vendors-attorney"
                />
            </CardContent>
        </Card>
    );
};

export default VendorsTab;