import { SelectHTMLAttributes, ReactNode, forwardRef } from 'react';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
  className?: string;
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ children, className = '', ...props }, ref) => {
    const classes = ['form__select', className].filter(Boolean).join(' ');

    return (
      <select ref={ref} className={classes} {...props}>
        {children}
      </select>
    );
  }
);

FormSelect.displayName = 'FormSelect';

export default FormSelect;