import React from 'react';

const Modal = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent dark overlay
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000, // Ensure it sits on top
      backdropFilter: 'blur(2px)' // Nice blur effect
    }}>
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        animation: 'fadeIn 0.2s'
      }}>
        {title && (
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#111' }}>{title}</h3>
        )}
        
        <div style={{ marginBottom: '1.5rem', color: '#444', lineHeight: '1.5' }}>
          {children}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          {actions ? actions : (
            <button 
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ccc',
                background: 'white',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;