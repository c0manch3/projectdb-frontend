import { TextareaHTMLAttributes, forwardRef } from 'react';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className = '', ...props }, ref) => {
    const classes = ['form__textarea', className].filter(Boolean).join(' ');

    return (
      <textarea ref={ref} className={classes} {...props} />
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

export default FormTextarea;