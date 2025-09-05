import { ReactNode } from 'react';

interface LoadingStateProps {
  message?: string;
  show?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function LoadingState({ 
  message = 'Загрузка...', 
  show = true, 
  className = 'text-center',
  style = { padding: '2rem' }
}: LoadingStateProps): JSX.Element {
  const displayStyle = show ? style : { ...style, display: 'none' };

  return (
    <div className={className} style={displayStyle}>
      <p>{message}</p>
    </div>
  );
}

export default LoadingState;