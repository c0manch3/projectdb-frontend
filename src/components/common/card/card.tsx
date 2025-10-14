import { ReactNode } from 'react';

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

function CardHeader({ children, className = '' }: CardHeaderProps): JSX.Element {
  return (
    <div className={`card__header ${className}`}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

function CardContent({ children, className = '' }: CardContentProps): JSX.Element {
  return (
    <div className={`card__content ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

function CardTitle({ children, className = '' }: CardTitleProps): JSX.Element {
  return (
    <h3 className={`card__title ${className}`}>
      {children}
    </h3>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
}

function Card({ children, className = '' }: CardProps): JSX.Element {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Title = CardTitle;

export default Card;