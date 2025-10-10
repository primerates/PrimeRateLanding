import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PropertyTab = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Property Information</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Property functionality will be implemented here.</p>
            </CardContent>
        </Card>
    );
};

export default PropertyTab;