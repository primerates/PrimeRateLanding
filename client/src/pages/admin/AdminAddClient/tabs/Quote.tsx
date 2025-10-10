import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const QuoteTab = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Quote Information</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Quote functionality will be implemented here.</p>
            </CardContent>
        </Card>
    );
};

export default QuoteTab;