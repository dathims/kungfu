import { cn } from '@/lib/utils';

export interface ButtonProps {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children: string | HTMLElement | SVGSVGElement | (HTMLElement | SVGSVGElement | Text)[];
  onClick?: (e: Event) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function createButton(props: ButtonProps): HTMLButtonElement {
  const {
    variant = 'default',
    size = 'default',
    className,
    children,
    onClick,
    disabled = false,
    type = 'button'
  } = props;

  const button = document.createElement('button');
  button.type = type;
  button.disabled = disabled;

  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  };

  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10'
  };

  button.className = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if (typeof children === 'string') {
    button.textContent = children;
  } else if (Array.isArray(children)) {
    children.forEach(child => {
      if (child instanceof Element || child instanceof Text) {
        button.appendChild(child);
      }
    });
  } else {
    button.appendChild(children);
  }

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
}
