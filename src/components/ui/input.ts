import { cn } from '@/lib/utils';

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function createInput(props: InputProps): HTMLInputElement {
  const {
    type = 'text',
    className,
    placeholder,
    value,
    onChange,
    disabled = false
  } = props;

  const input = document.createElement('input');
  input.type = type;
  input.className = cn(
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    className
  );

  if (placeholder) input.placeholder = placeholder;
  if (value) input.value = value;
  input.disabled = disabled;

  if (onChange) {
    input.addEventListener('input', (e) => {
      onChange((e.target as HTMLInputElement).value);
    });
  }

  return input;
}
