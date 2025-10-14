import { ReactNode, LabelHTMLAttributes } from 'react';

interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
  className?: string;
}

function FormLabel({ children, required = false, className = '', ...props }: FormLabelProps): JSX.Element {
  const baseClasses = 'form__label';
  const requiredClass = required ? 'form__label--required' : '';
  const classes = [baseClasses, requiredClass, className].filter(Boolean).join(' ');

  return (
    <label className={classes} {...props}>
      {children}
    </label>
  );
}

interface FormErrorProps {
  children?: ReactNode;
  show?: boolean;
  className?: string;
}

function FormError({ children, show = true, className = '' }: FormErrorProps): JSX.Element {
  const classes = ['form__error', className].filter(Boolean).join(' ');
  const style = show ? {} : { display: 'none' };

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}

interface FormHelpProps {
  children: ReactNode;
  className?: string;
}

function FormHelp({ children, className = '' }: FormHelpProps): JSX.Element {
  const classes = ['form__help', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
}

interface FormGroupProps {
  children: ReactNode;
  className?: string;
}

function FormGroup({ children, className = '' }: FormGroupProps): JSX.Element {
  const classes = ['form__group', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
}

FormGroup.Label = FormLabel;
FormGroup.Error = FormError;
FormGroup.Help = FormHelp;

export default FormGroup;