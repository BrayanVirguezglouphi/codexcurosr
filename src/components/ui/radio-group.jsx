import React from 'react';

const RadioGroupContext = React.createContext();

const RadioGroup = ({ value, onValueChange, className, children, ...props }) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div role="radiogroup" className={`space-y-2 ${className || ''}`} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

const RadioGroupItem = ({ value, id, className, ...props }) => {
  const context = React.useContext(RadioGroupContext);
  
  const handleChange = () => {
    if (context?.onValueChange) {
      context.onValueChange(value);
    }
  };

  const isChecked = context?.value === value;

  return (
    <input
      type="radio"
      id={id}
      name="radio-group"
      value={value}
      checked={isChecked}
      onChange={handleChange}
      className={`h-4 w-4 text-blue-600 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${className || ''}`}
      {...props}
    />
  );
};

export { RadioGroup, RadioGroupItem }; 