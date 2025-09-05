import { SelectHTMLAttributes, ReactNode } from 'react';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
  className?: string;
}

function FormSelect({ children, className = '', ...props }: FormSelectProps): JSX.Element {
  const classes = ['form__select', className].filter(Boolean).join(' ');

  return (
    <select className={classes} {...props}>
      {children}
    </select>
  );
}

export default FormSelect;