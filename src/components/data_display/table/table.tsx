import { ReactNode, TableHTMLAttributes, ThHTMLAttributes } from 'react';

interface TableHeaderProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  sortable?: boolean;
  sortKey?: string;
  className?: string;
}

function TableHeader({ 
  children, 
  sortable = false, 
  sortKey, 
  className = '', 
  ...props 
}: TableHeaderProps): JSX.Element {
  const baseClasses = 'table__header';
  const sortableClass = sortable ? 'table__header--sortable' : '';
  const classes = [baseClasses, sortableClass, className].filter(Boolean).join(' ');
  
  const headerProps = {
    ...props,
    className: classes,
    ...(sortable && sortKey ? { 'data-sort': sortKey } : {})
  };

  return (
    <th {...headerProps}>
      {children}
    </th>
  );
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

function TableHead({ children, className = '' }: TableHeadProps): JSX.Element {
  const classes = ['table__head', className].filter(Boolean).join(' ');

  return (
    <thead className={classes}>
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

function TableBody({ children, className = '', id }: TableBodyProps): JSX.Element {
  const classes = ['table__body', className].filter(Boolean).join(' ');

  return (
    <tbody className={classes} id={id}>
      {children}
    </tbody>
  );
}

interface TableContainerProps {
  children: ReactNode;
  className?: string;
}

function TableContainer({ children, className = '' }: TableContainerProps): JSX.Element {
  const classes = ['table-container', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
}

interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  className?: string;
}

function Table({ children, className = '', ...props }: TableProps): JSX.Element {
  const classes = ['table', className].filter(Boolean).join(' ');

  return (
    <table className={classes} {...props}>
      {children}
    </table>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

function TableCell({ children, className = '' }: TableCellProps): JSX.Element {
  const classes = ['table__cell', className].filter(Boolean).join(' ');

  return (
    <td className={classes}>
      {children}
    </td>
  );
}

Table.Container = TableContainer;
Table.Head = TableHead;
Table.Body = TableBody;
Table.Header = TableHeader;
Table.Cell = TableCell;

export default Table;