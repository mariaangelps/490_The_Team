import React from 'react';
import { Link } from 'react-router-dom';

/**
 * A versatile button component that can act as a standard button or a Link.
 */
export default function Button({ // <-- The key is 'export default'
  variant = 'primary', 
  to,                  
  className = '',
  children,
  ...props
}) {
  let baseClasses;
  
  if (variant === 'scroll') {
    // Uses .scroll-button from main.css
    baseClasses = `scroll-button ${className}`; 
  } else {
    // Uses .cta-button, .primary, or .secondary from main.css
    baseClasses = `cta-button ${variant} ${className}`; 
  }

  if (to) {
    // Renders as a react-router-dom Link if 'to' is provided
    return (
      <Link to={to} className={baseClasses} {...props}>
        {children}
      </Link>
    );
  }

  // Otherwise, renders as a standard button
  return (
    <button className={baseClasses} {...props}>
      {children}
    </button>
  );
}