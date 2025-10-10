import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BorrowerTab = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Borrower Information</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Borrower functionality will be implemented here.</p>
            </CardContent>
        </Card>
    );
};

export default BorrowerTab;