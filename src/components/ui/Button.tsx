import { type ButtonHTMLAttributes, forwardRef } from 'react';
import Icon, { type IconName } from './Icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  loadingText?: string;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  animate?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    loadingText = 'Loading...',
    icon,
    iconPosition = 'left',
    fullWidth = false,
    animate = true,
    children, 
    className = '', 
    disabled, 
    ...props 
  }, ref) => {
    const baseClasses = `
      inline-flex items-center justify-center
      font-medium rounded-lg
      border transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${animate ? 'transform hover:scale-[1.02] active:scale-[0.98]' : ''}
      ${fullWidth ? 'w-full' : ''}
    `.replace(/\s+/g, ' ').trim();

    const variantClasses = {
      primary: `
        bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
        text-white border-transparent
        focus:ring-blue-500
        shadow-lg hover:shadow-xl
        relative overflow-hidden
        before:absolute before:inset-0 before:bg-white before:opacity-0 
        before:transition-opacity hover:before:opacity-10
      `,
      secondary: `
        bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
        text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600
        focus:ring-gray-500
        shadow-sm hover:shadow-md
      `,
      danger: `
        bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800
        text-white border-transparent
        focus:ring-red-500
        shadow-lg hover:shadow-xl
        relative overflow-hidden
        before:absolute before:inset-0 before:bg-white before:opacity-0 
        before:transition-opacity hover:before:opacity-10
      `,
      ghost: `
        bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800
        text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100
        border-transparent
        focus:ring-gray-500
      `,
      gradient: `
        bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600
        hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700
        text-white border-transparent
        focus:ring-purple-500
        shadow-lg hover:shadow-xl
        relative overflow-hidden
        before:absolute before:inset-0 before:bg-white before:opacity-0 
        before:transition-opacity hover:before:opacity-10
      `
    };

    const sizeClasses = {
      xs: 'px-2 py-1 text-xs gap-1',
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
      xl: 'px-8 py-4 text-lg gap-3'
    };

    const iconSizes = {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20
    };

    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    ].filter(Boolean).join(' ');

    const LoadingSpinner = () => (
      <div className="flex items-center gap-2">
        <div 
          className={`border-2 border-current border-t-transparent rounded-full animate-spin`}
          style={{ 
            width: iconSizes[size], 
            height: iconSizes[size] 
          }}
        />
        {loadingText}
      </div>
    );

    const renderContent = () => {
      if (isLoading) {
        return <LoadingSpinner />;
      }

      const iconElement = icon && (
        <Icon 
          name={icon} 
          size={iconSizes[size]} 
          className="flex-shrink-0" 
        />
      );

      if (iconPosition === 'right') {
        return (
          <>
            {children}
            {iconElement}
          </>
        );
      }

      return (
        <>
          {iconElement}
          {children}
        </>
      );
    };

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-inherit">
          {renderContent()}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
