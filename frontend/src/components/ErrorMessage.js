import React from 'react';
import '../styles/ErrorMessage.css'; // Import your CSS for styling

function ErrorMessage({ message, onClose }) {
  return (
    <div className="error-message">
      <span>{message}</span>
      <button className='close-button' onClick={onClose}>X</button>
    </div>
  );
}

export default ErrorMessage;
