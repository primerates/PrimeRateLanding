import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LoanTab = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Loan Information</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Loan functionality will be implemented here.</p>
            </CardContent>
        </Card>
    );
};

export default LoanTab;