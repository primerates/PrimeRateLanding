import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StatusTab = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Status Information</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Status functionality will be implemented here.</p>
            </CardContent>
        </Card>
    );
};

export default StatusTab;