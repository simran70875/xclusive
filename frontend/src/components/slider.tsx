import React from 'react';

interface SliderProps {
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  onChange?: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({
  defaultValue = [0],
  min = 0,
  max = 100,
  step = 1,
  className = '',
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (onChange) onChange(value);
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      defaultValue={defaultValue[0]}
      onChange={handleChange}
      className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${className}`}
    />
  );
};

export { Slider };
