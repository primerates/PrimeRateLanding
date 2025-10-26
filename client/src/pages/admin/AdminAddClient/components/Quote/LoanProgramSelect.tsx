import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddCategoryDialog from '../../dialogs/AddCategoryDialog';
import AddProgramDialog from '../../dialogs/AddProgramDialog';
import RemoveCategoryDialog from '../../dialogs/RemoveCategoryDialog';
import RemoveProgramDialog from '../../dialogs/RemoveProgramDialog';
import { useAdminAddClientStore, type LoanCategory, type LoanProgram } from '@/stores/useAdminAddClientStore';

// Re-export types for backward compatibility with other components
export type { LoanCategory, LoanProgram };

interface LoanProgramSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  testId?: string;
  className?: string;
}

// Built-in categories with their programs
const BUILT_IN_CATEGORIES = {
  'fixed-rate': {
    id: 'fixed-rate',
    name: 'Fixed Rate',
    programs: [
      { id: '30-year-fixed', name: '30 Year Fixed' },
      { id: '25-year-fixed', name: '25 Year Fixed' },
      { id: '20-year-fixed', name: '20 Year Fixed' },
      { id: '15-year-fixed', name: '15 Year Fixed' },
      { id: '10-year-fixed', name: '10 Year Fixed' }
    ]
  },
  'adjustable-rate': {
    id: 'adjustable-rate',
    name: 'Adjustable Rate',
    programs: [
      { id: '10-1-arm', name: '10/1 ARM' },
      { id: '7-1-arm', name: '7/1 ARM' },
      { id: '5-1-arm', name: '5/1 ARM' },
      { id: '3-1-arm', name: '3/1 ARM' },
      { id: '1-1-arm', name: '1/1 ARM' }
    ]
  }
};

const LoanProgramSelect = ({
  value = 'select',
  onValueChange,
  testId = 'select-loan-program',
  className = 'space-y-2 max-w-[75%]'
}: LoanProgramSelectProps) => {
  // Get state and actions from Zustand store
  const customCategories = useAdminAddClientStore((state) => state.customLoanCategories);
  const removedBuiltInCategories = useAdminAddClientStore((state) => state.removedBuiltInCategories);
  const removedBuiltInPrograms = useAdminAddClientStore((state) => state.removedBuiltInPrograms);
  const addLoanCategory = useAdminAddClientStore((state) => state.addLoanCategory);
  const addLoanProgram = useAdminAddClientStore((state) => state.addLoanProgram);
  const removeLoanCategory = useAdminAddClientStore((state) => state.removeLoanCategory);
  const removeLoanProgram = useAdminAddClientStore((state) => state.removeLoanProgram);

  // Dialog states (kept local as they don't need persistence)
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [showAddProgramDialog, setShowAddProgramDialog] = useState(false);
  const [showRemoveCategoryDialog, setShowRemoveCategoryDialog] = useState(false);
  const [showRemoveProgramDialog, setShowRemoveProgramDialog] = useState(false);

  const handleAddCategory = (categoryName: string) => {
    addLoanCategory(categoryName);
  };

  const handleAddProgram = (programName: string, categoryId: string) => {
    addLoanProgram(programName, categoryId);
  };

  const handleRemoveCategory = (categoryId: string) => {
    removeLoanCategory(categoryId);
  };

  const handleRemoveProgram = (programId: string, categoryId: string) => {
    removeLoanProgram(programId, categoryId);
  };

  // Get all available categories (built-in + custom, excluding removed)
  // This merges built-in programs with custom programs for each category
  const getAvailableCategories = () => {
    const categories: LoanCategory[] = [];

    // Add built-in categories if not removed, with merged programs
    Object.values(BUILT_IN_CATEGORIES).forEach(cat => {
      if (!removedBuiltInCategories.includes(cat.id)) {
        // Get built-in programs for this category
        const builtInPrograms = cat.programs || [];

        // Get custom programs added to this built-in category
        const customProgramsForCategory = customCategories.find(c => c.id === cat.id)?.programs || [];

        // Merge both, filtering out removed built-in programs
        const availableBuiltInPrograms = builtInPrograms.filter(
          prog => !removedBuiltInPrograms.includes(prog.id)
        );

        const allPrograms = [...availableBuiltInPrograms, ...customProgramsForCategory];

        categories.push({
          ...cat,
          programs: allPrograms
        });
      }
    });

    // Add pure custom categories (not associated with built-in categories)
    const pureCustomCategories = customCategories.filter(
      cat => cat.id !== 'fixed-rate' && cat.id !== 'adjustable-rate'
    );
    categories.push(...pureCustomCategories);

    return categories;
  };

  return (
    <>
      <div className={className}>
        <Label htmlFor={testId}>Loan Program</Label>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger data-testid={testId}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="select" data-testid={`${testId}-select`}>
              Select
            </SelectItem>

            {/* Add Category and Add Program options */}
            <div
              className="px-2 py-1.5 text-sm font-semibold text-blue-600 cursor-pointer hover:bg-accent"
              onClick={(e) => {
                e.preventDefault();
                setShowAddCategoryDialog(true);
              }}
              data-testid="option-add-category"
            >
              + Add Category
            </div>
            <div
              className="px-2 py-1.5 text-sm font-semibold text-blue-600 cursor-pointer hover:bg-accent"
              onClick={(e) => {
                e.preventDefault();
                setShowAddProgramDialog(true);
              }}
              data-testid="option-add-program"
            >
              + Add Program
            </div>

            <div className="my-1 border-t border-border"></div>

            {/* Remove Category and Remove Program options */}
            <div
              className="px-2 py-1.5 text-sm font-semibold text-red-600 cursor-pointer hover:bg-accent"
              onClick={(e) => {
                e.preventDefault();
                setShowRemoveCategoryDialog(true);
              }}
              data-testid="option-remove-category"
            >
              - Remove Category
            </div>
            <div
              className="px-2 py-1.5 text-sm font-semibold text-red-600 cursor-pointer hover:bg-accent"
              onClick={(e) => {
                e.preventDefault();
                setShowRemoveProgramDialog(true);
              }}
              data-testid="option-remove-program"
            >
              - Remove Program
            </div>

            <div className="my-1 border-t border-border"></div>

            {/* Render categories and their programs */}
            {getAvailableCategories().map(category => {
              // Only show category if it has programs (already merged in getAvailableCategories)
              if (category.programs.length === 0) return null;

              return (
                <div key={category.id}>
                  {/* Category header */}
                  <div className="px-2 py-1.5 text-sm font-bold text-green-700 cursor-default">
                    {category.name}
                  </div>
                  {/* Programs under this category */}
                  {category.programs.map(program => (
                    <SelectItem
                      key={program.id}
                      value={program.id}
                      className="pl-6"
                      data-testid={`${testId}-${program.id}`}
                    >
                      {program.name}
                    </SelectItem>
                  ))}
                </div>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Dialogs */}
      <AddCategoryDialog
        isOpen={showAddCategoryDialog}
        onClose={() => setShowAddCategoryDialog(false)}
        onAdd={handleAddCategory}
      />

      <AddProgramDialog
        isOpen={showAddProgramDialog}
        onClose={() => setShowAddProgramDialog(false)}
        onAdd={handleAddProgram}
        availableCategories={getAvailableCategories()}
      />

      <RemoveCategoryDialog
        isOpen={showRemoveCategoryDialog}
        onClose={() => setShowRemoveCategoryDialog(false)}
        onRemove={handleRemoveCategory}
        availableCategories={getAvailableCategories()}
        removedBuiltInCategories={removedBuiltInCategories}
      />

      <RemoveProgramDialog
        isOpen={showRemoveProgramDialog}
        onClose={() => setShowRemoveProgramDialog(false)}
        onRemove={handleRemoveProgram}
        availableCategories={getAvailableCategories()}
        removedBuiltInPrograms={removedBuiltInPrograms}
      />
    </>
  );
};

export default LoanProgramSelect;
