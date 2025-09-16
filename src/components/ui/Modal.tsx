import React, { useEffect, useState } from 'react';
import Icon from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'glass' | 'centered';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  animate?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  animate = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsVisible(true);
      if (animate) {
        setTimeout(() => setIsAnimating(true), 10);
      } else {
        setIsAnimating(true);
      }
    } else {
      if (animate) {
        setIsAnimating(false);
        setTimeout(() => {
          setIsVisible(false);
          document.body.style.overflow = '';
        }, 300);
      } else {
        setIsVisible(false);
        document.body.style.overflow = '';
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, animate]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isVisible) return null;

  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl mx-4'
  };

  const overlayClasses = `
    fixed inset-0 z-50 flex items-center justify-center p-4
    transition-all duration-300 ease-out
    ${isAnimating ? 'opacity-100' : 'opacity-0'}
    ${variant === 'glass' 
      ? 'bg-black/20 backdrop-blur-sm' 
      : 'bg-black/50'
    }
  `.replace(/\s+/g, ' ').trim();

  const contentClasses = `
    relative w-full transform transition-all duration-300 ease-out
    ${isAnimating 
      ? 'opacity-100 scale-100 translate-y-0' 
      : 'opacity-0 scale-95 translate-y-4'
    }
    ${sizeClasses[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const modalBodyClasses = `
    ${variant === 'glass'
      ? `bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl 
         border border-white/20 dark:border-gray-700/20
         shadow-2xl`
      : `bg-white dark:bg-gray-800 
         border border-gray-200 dark:border-gray-700
         shadow-xl`
    }
    rounded-xl overflow-hidden
    relative
  `.replace(/\s+/g, ' ').trim();

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div className={overlayClasses} onClick={handleOverlayClick}>
      <div className={contentClasses}>
        <div className={modalBodyClasses}>
          {/* Glass effect overlay */}
          {variant === 'glass' && (
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
          )}
          
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="relative z-10 flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              {title && (
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
                           hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                           transition-all duration-200 transform hover:scale-110"
                  aria-label="Close modal"
                >
                  <Icon name="x" size={20} />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="relative z-10 p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
