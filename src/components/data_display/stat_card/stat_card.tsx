import { ReactNode } from 'react';

interface StatCardProps {
  value: string | number;
  label: string;
  color?: 'primary' | 'success' | 'warning' | 'secondary';
  id?: string;
  className?: string;
}

function StatCard({ 
  value, 
  label, 
  color = 'primary', 
  id, 
  className = '' 
}: StatCardProps): JSX.Element {
  const colorVar = `var(--${color})`;
  const cardClasses = ['card', className].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      <div className="card__content text-center">
        <div 
          style={{
            fontSize: '2rem', 
            fontWeight: '700', 
            color: colorVar, 
            marginBottom: '0.5rem'
          }} 
          id={id}
        >
          {value}
        </div>
        <div style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>
          {label}
        </div>
      </div>
    </div>
  );
}

interface StatCardsGridProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function StatCardsGrid({ children, className = '', style }: StatCardsGridProps): JSX.Element {
  const defaultStyle = {
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
    gap: '1.5rem', 
    marginBottom: '1.5rem'
  };

  const combinedStyle = { ...defaultStyle, ...style };

  return (
    <div className={className} style={combinedStyle}>
      {children}
    </div>
  );
}

StatCard.Grid = StatCardsGrid;

export default StatCard;