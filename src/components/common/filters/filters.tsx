import { ReactNode } from 'react';

interface FilterGroupProps {
  children: ReactNode;
  className?: string;
}

function FilterGroup({ children, className = '' }: FilterGroupProps): JSX.Element {
  const classes = ['filters__group', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
}

interface FilterLabelProps {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

function FilterLabel({ children, htmlFor, className = '' }: FilterLabelProps): JSX.Element {
  const classes = ['filters__label', className].filter(Boolean).join(' ');

  return (
    <label className={classes} htmlFor={htmlFor}>
      {children}
    </label>
  );
}

interface FiltersProps {
  children: ReactNode;
  className?: string;
}

function Filters({ children, className = '' }: FiltersProps): JSX.Element {
  const classes = ['filters', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
}

Filters.Group = FilterGroup;
Filters.Label = FilterLabel;

export default Filters;