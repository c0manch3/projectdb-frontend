import { ReactNode } from 'react';

interface PaginationInfoProps {
  itemsShown: number;
  totalItems: number;
  itemName: string;
}

function PaginationInfo({ itemsShown, totalItems, itemName }: PaginationInfoProps): JSX.Element {
  return (
    <div className="pagination__info">
      Показано <span>{itemsShown}</span> из <span>{totalItems}</span> {itemName}
    </div>
  );
}

interface PaginationControlsProps {
  children: ReactNode;
}

function PaginationControls({ children }: PaginationControlsProps): JSX.Element {
  return (
    <div className="pagination__controls">
      {children}
    </div>
  );
}

interface PaginationButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  id?: string;
}

function PaginationButton({ children, onClick, disabled = false, id }: PaginationButtonProps): JSX.Element {
  return (
    <button 
      className="pagination__button" 
      onClick={onClick}
      disabled={disabled}
      id={id}
    >
      {children}
    </button>
  );
}

interface PaginationProps {
  children: ReactNode;
  className?: string;
}

function Pagination({ children, className = '' }: PaginationProps): JSX.Element {
  const classes = ['pagination', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
}

Pagination.Info = PaginationInfo;
Pagination.Controls = PaginationControls;
Pagination.Button = PaginationButton;

export default Pagination;