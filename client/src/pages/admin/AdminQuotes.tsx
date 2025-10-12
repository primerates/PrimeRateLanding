import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Loader2, 
  Trash2,
  DollarSign,
  Home,
  Calendar,
  TrendingUp,
  Building2,
  CreditCard,
  User,
  MapPin,
  Briefcase
} from 'lucide-react';

interface PdfDocument {
  id: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  documentType: string;
  structuredData: any;
}

export default function AdminQuotes() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('paystub');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all documents
  const { data: documentsData, isLoading } = useQuery<{ success: boolean; data: PdfDocument[] }>({
    queryKey: ['/api/pdf/documents'],
  });

  const documents = documentsData?.data || [];

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, docType }: { file: File; docType: string }) => {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('documentType', docType);

      const response = await fetch('/api/pdf/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pdf/documents'] });
      setSelectedFile(null);
      setDocumentType('paystub');
      toast({
        title: 'Success',
        description: 'PDF processed and data extracted successfully',
      });
    },
    onError: (error: Error) => {
      // Clear selected file on error so UI doesn't show stale state
      setSelectedFile(null);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Could not process the PDF file. Please ensure it is a valid PDF document.',
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/pdf/documents/${id}`);
      return response;
    },
    onSuccess: async () => {
      // Invalidate and refetch to ensure UI updates
      await queryClient.invalidateQueries({ queryKey: ['/api/pdf/documents'] });
      await queryClient.refetchQueries({ queryKey: ['/api/pdf/documents'] });
      toast({
        title: 'Deleted',
        description: 'Document deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete document',
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid File',
        description: 'Please select a PDF file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select a file smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await uploadMutation.mutateAsync({ file: selectedFile, docType: documentType });
    } catch (error) {
      // Error is handled by mutation onError
    }
  };

  // Render structured data display
  const renderStructuredData = (data: any) => {
    if (!data) {
      return (
        <div className="text-sm text-muted-foreground italic">
          No structured data could be extracted from this document.
        </div>
      );
    }

    const dataItems = [];
    const displayedFields = new Set<string>();

    // Borrower Information
    if (data.borrowerName) {
      displayedFields.add('borrowerName');
      dataItems.push({
        icon: <User className="h-4 w-4" />,
        label: 'Borrower Name',
        value: data.borrowerName,
        color: 'text-blue-600'
      });
    }

    if (data.borrowerAddress) {
      displayedFields.add('borrowerAddress');
      dataItems.push({
        icon: <MapPin className="h-4 w-4" />,
        label: 'Address',
        value: data.borrowerAddress,
        color: 'text-green-600'
      });
    }

    // Income Information (Paystub)
    if (data.employerName) {
      displayedFields.add('employerName');
      dataItems.push({
        icon: <Briefcase className="h-4 w-4" />,
        label: 'Employer',
        value: data.employerName,
        color: 'text-purple-600'
      });
    }

    if (data.grossPay) {
      displayedFields.add('grossPay');
      dataItems.push({
        icon: <DollarSign className="h-4 w-4" />,
        label: 'Gross Pay',
        value: `$${data.grossPay.toLocaleString()}`,
        color: 'text-green-600'
      });
    }

    if (data.netPay) {
      displayedFields.add('netPay');
      dataItems.push({
        icon: <DollarSign className="h-4 w-4" />,
        label: 'Net Pay',
        value: `$${data.netPay.toLocaleString()}`,
        color: 'text-emerald-600'
      });
    }

    if (data.yearToDateGross) {
      displayedFields.add('yearToDateGross');
      dataItems.push({
        icon: <TrendingUp className="h-4 w-4" />,
        label: 'YTD Gross',
        value: `$${data.yearToDateGross.toLocaleString()}`,
        color: 'text-indigo-600'
      });
    }

    // Loan Information
    if (data.lenderName) {
      displayedFields.add('lenderName');
      dataItems.push({
        icon: <Building2 className="h-4 w-4" />,
        label: 'Lender',
        value: data.lenderName,
        color: 'text-blue-600'
      });
    }

    if (data.loanNumber) {
      displayedFields.add('loanNumber');
      dataItems.push({
        icon: <FileText className="h-4 w-4" />,
        label: 'Loan Number',
        value: data.loanNumber,
        color: 'text-gray-600'
      });
    }

    if (data.propertyAddress) {
      displayedFields.add('propertyAddress');
      dataItems.push({
        icon: <Home className="h-4 w-4" />,
        label: 'Property Address',
        value: data.propertyAddress,
        color: 'text-orange-600'
      });
    }

    if (data.currentBalance) {
      displayedFields.add('currentBalance');
      dataItems.push({
        icon: <DollarSign className="h-4 w-4" />,
        label: 'Current Balance',
        value: `$${data.currentBalance.toLocaleString()}`,
        color: 'text-red-600'
      });
    }

    if (data.monthlyPayment) {
      displayedFields.add('monthlyPayment');
      dataItems.push({
        icon: <CreditCard className="h-4 w-4" />,
        label: 'Monthly Payment',
        value: `$${data.monthlyPayment.toLocaleString()}`,
        color: 'text-pink-600'
      });
    }

    if (data.interestRate) {
      displayedFields.add('interestRate');
      dataItems.push({
        icon: <TrendingUp className="h-4 w-4" />,
        label: 'Interest Rate',
        value: `${data.interestRate}%`,
        color: 'text-yellow-600'
      });
    }

    // Bank Statement
    if (data.bankName) {
      displayedFields.add('bankName');
      dataItems.push({
        icon: <Building2 className="h-4 w-4" />,
        label: 'Bank',
        value: data.bankName,
        color: 'text-blue-600'
      });
    }

    if (data.endingBalance) {
      displayedFields.add('endingBalance');
      dataItems.push({
        icon: <DollarSign className="h-4 w-4" />,
        label: 'Ending Balance',
        value: `$${data.endingBalance.toLocaleString()}`,
        color: 'text-green-600'
      });
    }

    // Tax Return
    if (data.adjustedGrossIncome) {
      displayedFields.add('adjustedGrossIncome');
      dataItems.push({
        icon: <DollarSign className="h-4 w-4" />,
        label: 'Adjusted Gross Income',
        value: `$${data.adjustedGrossIncome.toLocaleString()}`,
        color: 'text-purple-600'
      });
    }

    if (data.statementDate) {
      displayedFields.add('statementDate');
      dataItems.push({
        icon: <Calendar className="h-4 w-4" />,
        label: 'Statement Date',
        value: data.statementDate,
        color: 'text-gray-600'
      });
    }

    // Add any other fields from the data that weren't explicitly handled above
    displayedFields.add('documentType'); // Don't show document type as a field
    displayedFields.add('additionalInfo'); // Handle additionalInfo separately if needed
    
    Object.keys(data).forEach(key => {
      if (!displayedFields.has(key) && data[key] !== null && data[key] !== undefined && data[key] !== '') {
        let displayValue = data[key];
        
        // Format value based on type
        if (typeof displayValue === 'object' && !Array.isArray(displayValue)) {
          displayValue = JSON.stringify(displayValue, null, 2);
        } else if (Array.isArray(displayValue)) {
          displayValue = displayValue.join(', ');
        }
        
        // Convert camelCase/snake_case to readable label
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/_/g, ' ')
          .replace(/^./, str => str.toUpperCase())
          .trim();
        
        dataItems.push({
          icon: <FileText className="h-4 w-4" />,
          label: label,
          value: String(displayValue),
          color: 'text-slate-600'
        });
      }
    });

    if (dataItems.length === 0) {
      return (
        <div className="text-sm text-muted-foreground italic">
          No structured data could be extracted from this document.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {dataItems.map((item, index) => (
          <div 
            key={index} 
            className="flex items-start space-x-2 p-3 rounded-md bg-muted/50 hover-elevate"
          >
            <div className={`mt-0.5 ${item.color}`}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-0.5">{item.label}</div>
              <div className="text-sm font-medium truncate">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg border-b transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/admin/dashboard')}
                className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
                data-testid="button-back-to-dashboard"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-black italic" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
                Quote - PDF Document Extraction
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload & Extract Document Data</CardTitle>
            <CardDescription>
              Upload mortgage documents (paystubs, bank statements, tax returns, loan statements) and automatically extract structured data using AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Document Type Selection */}
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger data-testid="select-document-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paystub">Paystub</SelectItem>
                  <SelectItem value="bank_statement">Bank Statement</SelectItem>
                  <SelectItem value="tax_return">Tax Return</SelectItem>
                  <SelectItem value="mortgage_statement">Mortgage Statement</SelectItem>
                  <SelectItem value="credit_report">Credit Report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Drag & Drop Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                data-testid="input-file-upload"
              />
              
              {selectedFile ? (
                <div className="space-y-3">
                  <FileText className="h-12 w-12 mx-auto text-primary" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                      data-testid="button-upload-pdf"
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Extract Data
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedFile(null)}
                      disabled={uploadMutation.isPending}
                      data-testid="button-cancel-upload"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">Drag & drop your PDF here</p>
                    <p className="text-sm text-muted-foreground">or</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="button-browse-files"
                  >
                    Browse Files
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 10MB
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Extracted Documents</CardTitle>
            <CardDescription>
              View all uploaded documents and their extracted data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No documents uploaded yet. Upload a PDF to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="hover-elevate" data-testid={`card-document-${doc.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {doc.fileName}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="capitalize">{doc.documentType.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{doc.fileSize}</span>
                            <span>•</span>
                            <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(doc.id)}
                          data-testid={`button-delete-${doc.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {renderStructuredData(doc.structuredData)}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
