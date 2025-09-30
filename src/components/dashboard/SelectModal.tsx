import React, { Fragment } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  Transition,
} from "@headlessui/react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectModalProps {
  value?: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
  displayValue?: (value: string) => string;
  loading?: boolean;
  emptyMessage?: string;
  label?: string;
  error?: string;
}

export const SelectModal: React.FC<SelectModalProps> = ({
  value = "",
  onChange,
  options,
  placeholder = "Select an option...",
  disabled = false,
  className = "",
  searchable = false,
  displayValue,
  loading = false,
  emptyMessage = "No options found.",
  label,
  error,
}) => {
  const [query, setQuery] = React.useState("");

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = React.useMemo(() => {
    if (!searchable || query === "") {
      return options;
    }
    return options.filter((option) =>
      option.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [options, query, searchable]);

  const getDisplayValue = () => {
    if (loading) return "Loading...";
    if (displayValue && value) return displayValue(value);
    if (selectedOption) return selectedOption.label;
    return "";
  };

  return (
    <div className={cn("relative w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <Combobox
        value={value}
        onChange={(newValue) => {
          const selectedValue = newValue || "";
          onChange(selectedValue);
        }}
        onClose={() => setQuery("")}
        disabled={disabled}
      >
        {({ open }) => (
          <div className="relative">
            <div className="relative w-full">
              <ComboboxInput
                className={cn(
                  "w-full py-2 pl-3 pr-10 text-sm leading-5 bg-background border rounded-lg transition-colors duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand",
                  disabled
                    ? "cursor-not-allowed opacity-50 bg-gray-50"
                    : "cursor-default",
                  error
                    ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                    : "border-input hover:border-gray-400",
                  "placeholder:text-muted-foreground"
                )}
                displayValue={getDisplayValue}
                onChange={
                  searchable
                    ? (event) => setQuery(event.target.value)
                    : undefined
                }
                placeholder={placeholder}
                disabled={disabled || loading}
                readOnly={!searchable}
              />
              <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronsUpDown
                  className={cn(
                    "h-4 w-4 transition-colors duration-200",
                    disabled ? "text-gray-400" : "text-gray-500"
                  )}
                  aria-hidden="true"
                />
              </ComboboxButton>
            </div>

            <Transition
              as={Fragment}
              show={open}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 border border-input focus:outline-none sm:text-sm">
                {loading ? (
                  <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand"></div>
                      <span>Loading...</span>
                    </div>
                  </div>
                ) : filteredOptions.length === 0 ? (
                  <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                    {emptyMessage}
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <ComboboxOption
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      className={({ active }) =>
                        cn(
                          "relative cursor-default select-none py-2 pl-10 pr-4 transition-colors duration-150",
                          active
                            ? "bg-brand text-white"
                            : "text-foreground hover:bg-gray-100",
                          option.disabled && "opacity-50 cursor-not-allowed"
                        )
                      }
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={cn(
                              "block truncate",
                              selected ? "font-medium" : "font-normal"
                            )}
                          >
                            {option.label}
                          </span>
                          {selected && (
                            <span
                              className={cn(
                                "absolute inset-y-0 left-0 flex items-center pl-3",
                                active ? "text-white" : "text-brand"
                              )}
                            >
                              <Check className="h-4 w-4" aria-hidden="true" />
                            </span>
                          )}
                        </>
                      )}
                    </ComboboxOption>
                  ))
                )}
              </ComboboxOptions>
            </Transition>
          </div>
        )}
      </Combobox>

      {error && (
        <p className="mt-1 text-sm text-red-600" id="error">
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectModal;
