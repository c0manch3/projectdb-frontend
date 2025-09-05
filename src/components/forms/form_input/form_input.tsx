import { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

function FormInput({ className = '', ...props }: FormInputProps): JSX.Element {
  const classes = ['form__input', className].filter(Boolean).join(' ');

  return (
    <input className={classes} {...props} />
  );
}

export default FormInput;