import { cn } from '@/lib/utils';

export interface TextareaProps {
  className?: string;
  placeholder?: string;
  value?: string;
  rows?: number;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function createTextarea(props: TextareaProps): HTMLTextAreaElement {
  const {
    className,
    placeholder,
    value,
    rows = 3,
    onChange,
    disabled = false
  } = props;

  const textarea = document.createElement('textarea');
  textarea.className = cn(
    'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    className
  );

  if (placeholder) textarea.placeholder = placeholder;
  if (value) textarea.value = value;
  if (rows) textarea.rows = rows;
  textarea.disabled = disabled;

  if (onChange) {
    textarea.addEventListener('input', (e) => {
      onChange((e.target as HTMLTextAreaElement).value);
    });
  }

  return textarea;
}
