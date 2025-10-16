import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddCategoryDialog from '../../dialogs/AddCategoryDialog';
import AddProgramDialog from '../../dialogs/AddProgramDialog';
import RemoveCategoryDialog from '../../dialogs/RemoveCategoryDialog';
import RemoveProgramDialog from '../../dialogs/RemoveProgramDialog';

export interface LoanCategory {
  id: string;
  name: string;
  programs: LoanProgram[];
}

export interface LoanProgram {
  id: string;
  name: string;
}

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
  // State for custom categories and programs
  const [customCategories, setCustomCategories] = useState<LoanCategory[]>([]);
  const [removedBuiltInCategories, setRemovedBuiltInCategories] = useState<string[]>([]);
  const [removedBuiltInPrograms, setRemovedBuiltInPrograms] = useState<string[]>([]);

  // Dialog states
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [showAddProgramDialog, setShowAddProgramDialog] = useState(false);
  const [showRemoveCategoryDialog, setShowRemoveCategoryDialog] = useState(false);
  const [showRemoveProgramDialog, setShowRemoveProgramDialog] = useState(false);

  const handleAddCategory = (categoryName: string) => {
    const newCategory: LoanCategory = {
      id: categoryName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: categoryName,
      programs: []
    };
    setCustomCategories(prev => [...prev, newCategory]);
  };

  const handleAddProgram = (programName: string, categoryId: string) => {
    const newProgram: LoanProgram = {
      id: programName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: programName
    };

    // Check if it's a built-in category
    if (categoryId === 'fixed-rate' || categoryId === 'adjustable-rate') {
      // Add to custom categories as a copy
      const builtInCategory = BUILT_IN_CATEGORIES[categoryId];
      const existingCustomCopy = customCategories.find(cat => cat.id === categoryId);

      if (existingCustomCopy) {
        // Add program to existing custom copy
        setCustomCategories(prev =>
          prev.map(cat =>
            cat.id === categoryId
              ? { ...cat, programs: [...cat.programs, newProgram] }
              : cat
          )
        );
      } else {
        // Create custom copy of built-in category with new program
        setCustomCategories(prev => [
          ...prev,
          {
            id: categoryId,
            name: builtInCategory.name,
            programs: [newProgram]
          }
        ]);
      }
    } else {
      // Add to custom category
      setCustomCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? { ...cat, programs: [...cat.programs, newProgram] }
            : cat
        )
      );
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    // Check if it's a built-in category
    if (categoryId === 'fixed-rate' || categoryId === 'adjustable-rate') {
      setRemovedBuiltInCategories(prev => [...prev, categoryId]);
    } else {
      // Remove custom category
      setCustomCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
  };

  const handleRemoveProgram = (programId: string, categoryId: string) => {
    // Check if it's a built-in program
    const isBuiltInProgram = Object.values(BUILT_IN_CATEGORIES).some(cat =>
      cat.programs.some(prog => prog.id === programId)
    );

    if (isBuiltInProgram) {
      setRemovedBuiltInPrograms(prev => [...prev, programId]);
    } else {
      // Remove from custom category
      setCustomCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? { ...cat, programs: cat.programs.filter(prog => prog.id !== programId) }
            : cat
        )
      );
    }
  };

  // Get all available categories (built-in + custom, excluding removed)
  const getAvailableCategories = () => {
    const categories: LoanCategory[] = [];

    // Add built-in categories if not removed
    Object.values(BUILT_IN_CATEGORIES).forEach(cat => {
      if (!removedBuiltInCategories.includes(cat.id)) {
        categories.push(cat);
      }
    });

    // Add custom categories
    categories.push(...customCategories);

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
              // Get programs for this category
              const builtInPrograms =
                BUILT_IN_CATEGORIES[category.id as keyof typeof BUILT_IN_CATEGORIES]?.programs || [];
              const customPrograms =
                customCategories.find(cat => cat.id === category.id)?.programs || [];

              // Filter out removed built-in programs
              const availableBuiltInPrograms = builtInPrograms.filter(
                prog => !removedBuiltInPrograms.includes(prog.id)
              );

              const allPrograms = [...availableBuiltInPrograms, ...customPrograms];

              // Only show category if it has programs
              if (allPrograms.length === 0) return null;

              return (
                <div key={category.id}>
                  {/* Category header */}
                  <div className="px-2 py-1.5 text-sm font-bold text-green-700 cursor-default">
                    {category.name}
                  </div>
                  {/* Programs under this category */}
                  {allPrograms.map(program => (
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
