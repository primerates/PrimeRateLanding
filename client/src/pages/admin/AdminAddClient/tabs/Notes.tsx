import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NotesTab = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notes Information</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Notes functionality will be implemented here.</p>
            </CardContent>
        </Card>
    );
};

export default NotesTab;