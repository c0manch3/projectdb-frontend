import { ReactNode } from 'react';

interface EmptyStateProps {
  message: string;
  actionButton?: ReactNode;
  show?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function EmptyState({ 
  message, 
  actionButton,
  show = true, 
  className = 'text-center',
  style = { padding: '2rem' }
}: EmptyStateProps): JSX.Element {
  const displayStyle = show ? style : { ...style, display: 'none' };

  return (
    <div className={className} style={displayStyle}>
      <p>{message}</p>
      {actionButton}
    </div>
  );
}

export default EmptyState;