
import { useState } from 'react';

const Button = ({ 
  label, 
  onClick, 
  outline = false,
  disabled = false,
  className = '',
  variant = 'default'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles = {
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
    opacity: disabled ? 0.6 : 1
  };

  const animatedStyles = variant === 'animated' ? {
    transform: isHovered && !disabled ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: isHovered && !disabled ? '0 4px 12px rgba(20, 18, 129, 0.3)' : 'none'
  } : {};

  const outlineStyles = outline ? {
    backgroundColor: isHovered ? 'rgb(20, 18, 129)' : 'transparent',
    color: isHovered ? '#ffffff' : 'rgb(20, 18, 129)',
    border: '2px solid rgb(20, 18, 129)'
  } : {
    backgroundColor: 'rgb(20, 18, 129)',
    color: '#ffffff'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ ...baseStyles, ...animatedStyles, ...outlineStyles }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label}
    </button>
  );
};

export default Button;