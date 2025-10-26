import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import AddOptionDialog from '../dialogs/AddOptionDialog';
import RemoveOptionDialog from '../dialogs/RemoveOptionDialog';
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';

interface OptionItem {
  value: string;
  label: string;
}

interface ManageableSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  builtInOptions: OptionItem[];
  optionType: 'propertyUse' | 'propertyType';
  testId?: string;
  className?: string;
  addDialogTitle?: string;
  removeDialogTitle?: string;
  addDialogDescription?: string;
  removeDialogDescription?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  selectLabel?: string;
}

const ManageableSelect = ({
  label,
  value,
  onValueChange,
  builtInOptions,
  optionType,
  testId = 'select-item',
  className = 'space-y-2 max-w-[75%]',
  addDialogTitle = 'Add New Item',
  removeDialogTitle = 'Remove Item',
  addDialogDescription = 'Enter a name for the new option.',
  removeDialogDescription = 'Select a built-in option to remove from the list.',
  inputLabel = 'Option Name',
  inputPlaceholder = 'Enter option name',
  selectLabel = 'Option to Remove'
}: ManageableSelectProps) => {

  // Get state and actions from Zustand store based on optionType
  const customOptions = useAdminAddClientStore((state) =>
    optionType === 'propertyUse' ? state.customPropertyUses : state.customPropertyTypes
  );
  const removedOptions = useAdminAddClientStore((state) =>
    optionType === 'propertyUse' ? state.removedBuiltInPropertyUses : state.removedBuiltInPropertyTypes
  );
  const addOption = useAdminAddClientStore((state) =>
    optionType === 'propertyUse' ? state.addPropertyUse : state.addPropertyType
  );
  const removeOption = useAdminAddClientStore((state) =>
    optionType === 'propertyUse' ? state.removePropertyUse : state.removePropertyType
  );

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const handleAddOption = (optionName: string) => {
    addOption(optionName);
  };

  const handleRemoveOption = (optionValue: string) => {
    removeOption(optionValue);
  };

  const handleRemoveCustomOption = (optionId: string) => {
    removeOption(optionId);
  };

  return (
    <>
      <div className={className}>
        <Label htmlFor="manageable-select">{label}</Label>
        <Select
          value={value || 'select'}
          onValueChange={onValueChange}
        >
          <SelectTrigger data-testid={testId}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="select" data-testid={`${testId}-select`}>Select</SelectItem>

            <div
              className="px-2 py-1.5 text-sm font-semibold text-blue-600 cursor-pointer hover:bg-accent"
              onClick={(e) => {
                e.preventDefault();
                setShowAddDialog(true);
              }}
              data-testid="option-add"
            >
              + Add
            </div>
            <div
              className="px-2 py-1.5 text-sm font-semibold text-red-600 cursor-pointer hover:bg-accent"
              onClick={(e) => {
                e.preventDefault();
                setShowRemoveDialog(true);
              }}
              data-testid="option-remove"
            >
              - Remove
            </div>

            <div className="my-1 border-t border-border"></div>

            {builtInOptions.filter(option => !removedOptions.includes(option.value)).map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                data-testid={`${testId}-${option.value}`}
              >
                {option.label}
              </SelectItem>
            ))}

            {customOptions.map((option) => (
              <SelectItem
                key={option.id}
                value={option.id}
                data-testid={`${testId}-${option.id}`}
              >
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AddOptionDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddOption}
        title={addDialogTitle}
        description={addDialogDescription}
        inputLabel={inputLabel}
        inputPlaceholder={inputPlaceholder}
      />

      <RemoveOptionDialog
        isOpen={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
        onRemove={handleRemoveOption}
        onRemoveCustom={handleRemoveCustomOption}
        removedOptions={removedOptions}
        builtInOptions={builtInOptions}
        customOptions={customOptions}
        title={removeDialogTitle}
        description={removeDialogDescription}
        selectLabel={selectLabel}
      />
    </>
  );
};

export default ManageableSelect;