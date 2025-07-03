import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const FormField = ({ 
  label, 
  name, 
  type = 'text', 
  placeholder = '', 
  value, 
  onChange, 
  required = false,
  options = [],
  className = '',
  error = null,
  children
}) => {
  const handleChange = (e) => {
    onChange({ target: { name, value: e.target ? e.target.value : e } });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name}>{label}{required && <span className="text-destructive ml-1">*</span>}</Label>
      
      {children ? children : type === 'select' ? (
        <Select name={name} value={value} onValueChange={(val) => handleChange(val)}>
          <SelectTrigger id={name}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
        />
      )}
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

