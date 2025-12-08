import * as React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const Checkbox: React.FC<CheckboxProps> = ({ checked, ...props }) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        className="sr-only peer"
        {...props}
      />
      <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:border-primary peer-checked:bg-transparent flex items-center justify-center">
        {/* Custom inner box or icon */}
        {checked ? <div className="w-3 h-3 bg-primary rounded-sm peer-checked:block" /> : <></>}

      </div>
    </label>
  );
};
