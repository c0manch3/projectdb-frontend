import { TextareaHTMLAttributes } from 'react';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

function FormTextarea({ className = '', ...props }: FormTextareaProps): JSX.Element {
  const classes = ['form__textarea', className].filter(Boolean).join(' ');

  return (
    <textarea className={classes} {...props} />
  );
}

export default FormTextarea;