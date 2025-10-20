import { ReactNode, ReactElement, cloneElement, isValidElement } from 'react';

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

  // Process children to inject onClose into Modal.Header
  const processChildren = (children: ReactNode): ReactNode => {
    return Array.isArray(children)
      ? children.map((child, index) => {
          if (isValidElement(child) && (child.type as any) === ModalHeader) {
            return cloneElement(child as ReactElement<ModalHeaderProps>, {
              key: index,
              onClose: child.props.onClose || onClose
            });
          }
          return child;
        })
      : isValidElement(children) && (children.type as any) === ModalHeader
      ? cloneElement(children as ReactElement<ModalHeaderProps>, {
          onClose: children.props.onClose || onClose
        })
      : children;
  };

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
          processChildren(children)
        )}
      </div>
    </div>
  );
}

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;

export default Modal;