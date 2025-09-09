import { InputHTMLAttributes, forwardRef } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className = '', ...props }, ref) => {
    const classes = ['form__input', className].filter(Boolean).join(' ');

    return (
      <input ref={ref} className={classes} {...props} />
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;