import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import AddOptionDialog from '../../dialogs/AddOptionDialog';
import RemoveOptionDialog from '../../dialogs/RemoveOptionDialog';

interface OptionItem {
  value: string;
  label: string;
}

interface LenderTitleSelectProps {
  label?: string;
  toggledLabel?: string;
  isToggled: boolean;
  onToggleChange: (value: boolean) => void;

  // For Select mode
  selectValue: string;
  onSelectChange: (value: string) => void;
  builtInOptions: OptionItem[];

  // For Input mode (Currency)
  inputValue: string;
  onInputChange: (value: string) => void;

  // Dialog customization
  addDialogTitle?: string;
  removeDialogTitle?: string;
  addDialogDescription?: string;
  removeDialogDescription?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  selectLabel?: string;

  testId?: string;
  className?: string;
}

const LenderTitleSelect = ({
  label = 'Field',
  toggledLabel = 'Alternate Field',
  isToggled,
  onToggleChange,
  selectValue,
  onSelectChange,
  builtInOptions,
  inputValue,
  onInputChange,
  addDialogTitle = 'Add New Item',
  removeDialogTitle = 'Remove Item',
  addDialogDescription = 'Enter a name for the new option.',
  removeDialogDescription = 'Select an option to remove from the list.',
  inputLabel = 'Option Name',
  inputPlaceholder = 'Enter option name',
  selectLabel = 'Option to Remove',
  testId = 'select-item',
  className = 'space-y-2'
}: LenderTitleSelectProps) => {
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

  const handleRemoveCustomOption = (optionId: string) => {
    setCustomOptions(prev => prev.filter(option => option.id !== optionId));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digit characters
    const value = e.target.value.replace(/[^\d]/g, '');
    onInputChange(value);
  };

  // Format currency with commas
  const formatCurrency = (value: string) => {
    if (!value) return '';
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <>
      <div className={className}>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor={isToggled ? `${testId}-input` : testId}>
            {isToggled ? toggledLabel : label}
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Switch
                  checked={isToggled}
                  onCheckedChange={onToggleChange}
                  data-testid={`switch-${testId}`}
                  className="scale-[0.8] hover:border-blue-600 hover:border-2"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isToggled ? label : toggledLabel}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {isToggled ? (
          /* Currency Input Mode */
          <div className="flex items-center border border-input bg-background px-3 rounded-md">
            <span className="text-muted-foreground text-sm">$</span>
            <Input
              id={`${testId}-input`}
              type="text"
              placeholder=""
              value={formatCurrency(inputValue)}
              onChange={handleInputChange}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              data-testid={`input-${testId}`}
            />
          </div>
        ) : (
          /* Select Mode with Add/Remove */
          <Select value={selectValue || 'select'} onValueChange={onSelectChange}>
            <SelectTrigger data-testid={testId}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="select" data-testid={`${testId}-select`}>
                Select
              </SelectItem>

              {/* Add and Remove options */}
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

              {/* Built-in options */}
              {builtInOptions
                .filter(option => !removedOptions.includes(option.value))
                .map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    data-testid={`${testId}-${option.value}`}
                  >
                    {option.label}
                  </SelectItem>
                ))}

              {/* Custom options */}
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
        )}
      </div>

      {/* Dialogs for Add/Remove (only shown in Select mode) */}
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

export default LenderTitleSelect;
