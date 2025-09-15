import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'large' | 'default';
  className?: string;
}

function Button({ 
  children, 
  variant = 'primary', 
  size = 'default', 
  className = '',
  ...props 
}: ButtonProps): JSX.Element {
  const baseClasses = 'button';
  const variantClass =
    variant === 'primary' ? 'button--primary' :
    variant === 'danger' ? 'button--danger' :
    variant === 'outline' ? 'button--outline' :
    'button--secondary';
  const sizeClass = size === 'small' ? 'button--small' : size === 'large' ? 'button--large' : '';
  
  const classes = [baseClasses, variantClass, sizeClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;