import { ReactNode } from 'react';

interface ModalHeaderProps {
  children: ReactNode;
  onClose?: () => void;
}

function ModalHeader({ children, onClose }: ModalHeaderProps): JSX.Element {
  return (
    <div className="modal__header">
      <h3 className="modal__title">{children}</h3>
      <button className="modal__close" onClick={onClose}>×</button>
    </div>
  );
}

interface ModalContentProps {
  children: ReactNode;
}

function ModalContent({ children }: ModalContentProps): JSX.Element {
  return (
    <div className="modal__content">
      {children}
    </div>
  );
}

interface ModalFooterProps {
  children: ReactNode;
}

function ModalFooter({ children }: ModalFooterProps): JSX.Element {
  return (
    <div className="modal__footer">
      {children}
    </div>
  );
}

interface ModalProps {
  children: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  id?: string;
  className?: string;
  title?: string;
  size?: 'small' | 'medium' | 'large';
}

function Modal({ children, isOpen = false, onClose, id, className = '', title, size = 'medium' }: ModalProps): JSX.Element {
  const overlayClasses = [
    'modal-overlay',
    isOpen ? 'modal-overlay--open' : '',
    className
  ].filter(Boolean).join(' ');

  const modalClasses = [
    'modal',
    size ? `modal--${size}` : ''
  ].filter(Boolean).join(' ');

  // Don't render at all when closed (for better performance)
  if (!isOpen) return <></>;

  return (
    <div
      className={overlayClasses}
      id={id}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div className={modalClasses}>
        {title ? (
          <>
            <ModalHeader onClose={onClose}>{title}</ModalHeader>
            <div className="modal__content">{children}</div>
          </>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;

export default Modal;