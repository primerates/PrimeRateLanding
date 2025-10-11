import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import AddSourceDialog from '../dialogs/addSource';
import RemoveSourceDialog from '../dialogs/removeSource';

interface OptionItem {
  value: string;
  label: string;
}

interface ManageableSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  builtInOptions: OptionItem[];
  testId?: string;
  className?: string;
  addDialogTitle?: string;
  removeDialogTitle?: string;
}

const ManageableSelect = ({
  label,
  value,
  onValueChange,
  builtInOptions,
  testId = 'select-item',
  className = 'space-y-2 max-w-[75%]',
  addDialogTitle = 'Add New Item',
  removeDialogTitle = 'Remove Item'
}: ManageableSelectProps) => {

  const [removedOptions, setRemovedOptions] = useState<string[]>([]);
  const [customOptions, setCustomOptions] = useState<{ id: string; name: string }[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const handleAddOption = (optionName: string) => {
    const optionId = optionName.toLowerCase().replace(/\s+/g, '-');
    setCustomOptions(prev => [...prev, { id: optionId, name: optionName }]);
  };

  const handleRemoveOption = (optionValue: string) => {
    setRemovedOptions(prev => [...prev, optionValue]);
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

      <AddSourceDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddOption}
        title={addDialogTitle}
      />

      <RemoveSourceDialog
        isOpen={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
        onRemove={handleRemoveOption}
        removedSources={removedOptions}
        title={removeDialogTitle}
      />
    </>
  );
};

export default ManageableSelect;