import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ServiceItem {
  id: string;
  serviceName: string;
  value: string;
}

interface CategoryItem {
  id: string;
  categoryName: string;
  services: ServiceItem[];
}

interface LibraryConfig {
  metadata?: {
    loanCategory?: string;
    loanPurpose?: string;
    state?: string;
    lender?: string;
    title?: string;
  };
  categories?: CategoryItem[];
}

interface GuidelinesLibraryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  libraryConfigurations: Record<string, LibraryConfig>;
  onDeleteConfiguration: (key: string) => void;
  onLoadConfiguration: (config: LibraryConfig) => void;
}

const GuidelinesLibraryDialog = ({
  isOpen,
  onOpenChange,
  libraryConfigurations,
  onDeleteConfiguration,
  onLoadConfiguration
}: GuidelinesLibraryDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto" data-testid="dialog-library">
        <DialogHeader className="bg-primary text-white -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
          <DialogTitle className="text-white">Closing Costs Library</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {Object.keys(libraryConfigurations).length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No saved configurations yet. Use "Save to Library" to save configurations.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(libraryConfigurations).map(([key, config]) => (
                <Card key={key} data-testid={`library-entry-${key}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-base">Configuration</CardTitle>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex gap-4 flex-wrap">
                            <span><strong>Loan Category:</strong> {config.metadata?.loanCategory?.toUpperCase() || 'N/A'}</span>
                            <span><strong>Purpose:</strong> {config.metadata?.loanPurpose?.replace(/-/g, ' ') || 'N/A'}</span>
                            <span><strong>State:</strong> {config.metadata?.state || 'N/A'}</span>
                            <span><strong>Lender:</strong> {config.metadata?.lender?.toUpperCase() || 'N/A'}</span>
                            <span><strong>Title:</strong> {config.metadata?.title?.replace(/-/g, ' ') || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteConfiguration(key)}
                        data-testid={`button-delete-${key}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {config.categories?.map((category) => (
                        <div key={category.id} className="border rounded-lg p-3">
                          <h4 className="font-medium text-sm mb-2">{category.categoryName}</h4>
                          <div className="space-y-1 text-sm">
                            {category.services.map((service) => (
                              <div key={service.id} className="flex justify-between text-muted-foreground">
                                <span>{service.serviceName}</span>
                                <span className="font-mono">{service.value || '$0'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          onLoadConfiguration(config);
                          onOpenChange(false);
                        }}
                        data-testid={`button-load-${key}`}
                      >
                        Load Configuration
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-close-library"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GuidelinesLibraryDialog;
