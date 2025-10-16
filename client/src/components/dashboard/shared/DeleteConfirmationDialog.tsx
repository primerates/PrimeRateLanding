import { useState } from 'react';

interface DeleteConfirmationDialogProps {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean;
  
  /**
   * Type of item being deleted (expense, revenue, staff, batch)
   */
  itemType: 'expense' | 'revenue' | 'staff' | 'batch';
  
  /**
   * Callback when delete is confirmed with correct admin code
   */
  onConfirm: () => void;
  
  /**
   * Callback when dialog is cancelled
   */
  onCancel: () => void;
  
  /**
   * Test ID prefix for the dialog elements
   */
  testId?: string;
}

/**
 * Reusable delete confirmation dialog with admin code verification
 * Features:
 * - 4-digit admin code input
 * - Go Back and Delete buttons
 * - Purple theme styling
 */
export function DeleteConfirmationDialog({
  isOpen,
  itemType,
  onConfirm,
  onCancel,
  testId = 'delete-dialog'
}: DeleteConfirmationDialogProps) {
  const [adminCode, setAdminCode] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    // In a real app, validate the admin code here
    // For now, just confirm
    onConfirm();
    setAdminCode('');
  };

  const handleCancel = () => {
    onCancel();
    setAdminCode('');
  };

  const titles = {
    expense: 'Delete Expense',
    revenue: 'Delete Revenue',
    staff: 'Delete Staff Member',
    batch: 'Delete Batch'
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-slate-800 rounded-2xl border border-purple-500/30 shadow-2xl max-w-md w-full p-6 relative animate-in"
        data-testid={testId}
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          {titles[itemType]}
        </h2>
        
        <p className="text-purple-300 mb-6">Enter admin code to confirm deletion</p>
        
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Enter 4-digit Admin Code"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            maxLength={4}
            className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
            data-testid={`${testId}-input-admin-code`}
          />
          
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg border border-purple-500/30 transition-all"
              data-testid={`${testId}-button-cancel`}
            >
              Go Back
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-semibold rounded-lg border border-red-400/30 transition-all shadow-lg hover:shadow-red-500/50"
              data-testid={`${testId}-button-confirm`}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
