import { FC } from "react";
import ReactSelect, { SingleValue } from "react-select";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  id?: string;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
}

const Select: FC<SelectProps> = ({
  id,
  name,
  value,
  onChange,
  className = "",
  disabled = false,
  success = false,
  error = false,
  hint,
  options,
  placeholder = "Select...",
  searchable = false,
}) => {
  const handleChange = (selected: SingleValue<SelectOption>) => {
    if (onChange && selected) {
      onChange(selected.value);
    }
  };

  const selectedOption = options.find((opt) => opt.value === value) || null;

  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderRadius: "0.5rem",
      borderColor: error
        ? "#f87171"
        : success
          ? "#34d399"
          : state.isFocused
            ? "#3b82f6"
            : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(59,130,246,0.2)" : "none",
      backgroundColor: disabled ? "#f9fafb" : "white",
      opacity: disabled ? 0.6 : 1,
      minHeight: "44px",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#9ca3af",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "#111827",
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <ReactSelect
        id={id}
        name={name}
        value={selectedOption}
        onChange={handleChange}
        options={options}
        isDisabled={disabled}
        placeholder={placeholder}
        isSearchable={searchable}
        styles={customStyles}
      />

      {hint && (
        <p
          className={`text-xs ${error
              ? "text-error-500"
              : success
                ? "text-success-500"
                : "text-gray-500"
            }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Select;
