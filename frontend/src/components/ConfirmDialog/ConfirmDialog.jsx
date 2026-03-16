import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", isDestructive = false }) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay fade-in">
      <div className="dialog-box">
        <h3 className="dialog-title">{title}</h3>
        <p className="dialog-message">{message}</p>
        
        <div className="dialog-actions">
          <button className="dialog-btn dialog-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className={`dialog-btn ${isDestructive ? 'dialog-destructive' : 'dialog-confirm'}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
