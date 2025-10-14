import React from 'react';

import Modal from '../common/modal/modal';
import Button from '../common/button/button';
import type { User } from '../../store/types';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: User | null;
  onConfirm: (employee: User) => void;
  isDeleting?: boolean;
}

function ConfirmDeleteModal({ 
  isOpen, 
  onClose, 
  employee, 
  onConfirm, 
  isDeleting = false 
}: ConfirmDeleteModalProps): JSX.Element {
  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Enter' && employee && !isDeleting) {
      onConfirm(employee);
    }
  };

  // Handle confirm action
  const handleConfirm = () => {
    if (employee && !isDeleting) {
      onConfirm(employee);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (user: User): string => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  // Get role display name
  const getRoleDisplayName = (role: string): string => {
    const roleMap: { [key: string]: string } = {
      'Admin': 'Администратор',
      'Manager': 'Менеджер',
      'Employee': 'Сотрудник',
      'Customer': 'Клиент'
    };
    return roleMap[role] || role;
  };

  if (!isOpen || !employee) return <></>;

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="confirmDeleteModal">
      <div onKeyDown={handleKeyDown}>
        {/* Custom Header with Red Accent */}
        <div 
          style={{
            background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
            borderBottom: '1px solid #FECACA',
            padding: 'var(--spacing-xl)',
            borderTopLeftRadius: 'var(--border-radius-lg)',
            borderTopRightRadius: 'var(--border-radius-lg)',
            position: 'relative'
          }}
        >
          {/* Decorative danger line */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #EF4444, #DC2626, #B91C1C)',
              borderTopLeftRadius: 'var(--border-radius-lg)',
              borderTopRightRadius: 'var(--border-radius-lg)'
            }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              {/* Danger Icon */}
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2.5"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              
              <div>
                <h3 
                  style={{ 
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#B91C1C',
                    lineHeight: '1.2'
                  }}
                >
                  Удаление сотрудника
                </h3>
                <p 
                  style={{ 
                    margin: '4px 0 0 0',
                    fontSize: '0.875rem',
                    color: '#991B1B',
                    fontWeight: '500'
                  }}
                >
                  Необратимое действие
                </p>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              style={{
                padding: 'var(--spacing-sm)',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                color: '#991B1B',
                cursor: 'pointer',
                borderRadius: 'var(--border-radius)',
                transition: 'var(--transition)',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(185, 28, 28, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              ×
            </button>
          </div>
        </div>

        <Modal.Content>
          <div 
            style={{
              textAlign: 'center',
              padding: 'var(--spacing-2xl) 0'
            }}
          >
            {/* Employee Information Card */}
            <div 
              style={{
                background: '#F8FAFC',
                border: '2px solid #E2E8F0',
                borderRadius: 'var(--border-radius-lg)',
                padding: 'var(--spacing-xl)',
                margin: '0 0 var(--spacing-2xl) 0',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-lg)',
                textAlign: 'left'
              }}
            >
              {/* Employee Avatar */}
              <div 
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}
              >
                {getUserInitials(employee)}
              </div>
              
              {/* Employee Details */}
              <div style={{ flex: 1 }}>
                <h4 
                  style={{ 
                    margin: '0 0 var(--spacing-xs) 0',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                  }}
                >
                  {employee.firstName} {employee.lastName}
                </h4>
                <div 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <span 
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        borderRadius: '9999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        background: 'rgba(37, 99, 235, 0.1)',
                        color: 'var(--primary)'
                      }}
                    >
                      {getRoleDisplayName(employee.role)}
                    </span>
                  </div>
                  <p 
                    style={{ 
                      margin: 0,
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {employee.email}
                  </p>
                  {employee.phone && (
                    <p 
                      style={{ 
                        margin: 0,
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      {employee.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Warning Message */}
            <div 
              style={{
                background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
                border: '1px solid #FECACA',
                borderRadius: 'var(--border-radius-lg)',
                padding: 'var(--spacing-xl)',
                marginBottom: 'var(--spacing-xl)'
              }}
            >
              <p 
                style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  marginBottom: 'var(--spacing-md)',
                  color: '#B91C1C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--spacing-sm)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Вы действительно хотите удалить этого сотрудника?
              </p>
            </div>

            <div 
              style={{
                background: '#FEF3C7',
                border: '1px solid #FCD34D',
                borderRadius: 'var(--border-radius)',
                padding: 'var(--spacing-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                fontSize: '0.875rem',
                color: '#92400E'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <strong>Это действие необратимо</strong> — все данные будут удалены безвозвратно
            </div>
          </div>
        </Modal.Content>

        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
            style={{ 
              marginRight: 'var(--spacing-md)',
              padding: '0.75rem 1.5rem',
              fontWeight: '500'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 'var(--spacing-xs)' }}>
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Отмена
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            disabled={isDeleting}
            style={{ 
              padding: '0.75rem 1.5rem',
              fontWeight: '600',
              background: isDeleting ? '#9CA3AF' : 'linear-gradient(135deg, #EF4444, #DC2626)',
              border: 'none',
              boxShadow: !isDeleting ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none',
              transform: !isDeleting ? 'none' : 'scale(0.98)'
            }}
          >
            {isDeleting ? (
              <>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{ 
                    marginRight: 'var(--spacing-xs)',
                    animation: 'spin 1s linear infinite'
                  }}
                >
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Удаление...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 'var(--spacing-xs)' }}>
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                Удалить навсегда
              </>
            )}
          </Button>
        </Modal.Footer>
      </div>

      {/* Add keyframe animation for spinner */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Modal>
  );
}

export default ConfirmDeleteModal;