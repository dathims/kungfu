import { cn } from '@/lib/utils';

export interface CardProps {
  className?: string;
  children?: HTMLElement | HTMLElement[];
}

export function createCard(props: CardProps): HTMLDivElement {
  const { className, children } = props;
  const card = document.createElement('div');
  card.className = cn(
    'rounded-lg border bg-card text-card-foreground shadow-sm',
    className
  );

  if (children) {
    if (Array.isArray(children)) {
      children.forEach(child => card.appendChild(child));
    } else {
      card.appendChild(children);
    }
  }

  return card;
}

export function createCardHeader(props: CardProps): HTMLDivElement {
  const { className, children } = props;
  const header = document.createElement('div');
  header.className = cn('flex flex-col space-y-1.5 p-6', className);

  if (children) {
    if (Array.isArray(children)) {
      children.forEach(child => header.appendChild(child));
    } else {
      header.appendChild(children);
    }
  }

  return header;
}

export function createCardTitle(text: string, className?: string): HTMLHeadingElement {
  const title = document.createElement('h3');
  title.className = cn(
    'text-2xl font-semibold leading-none tracking-tight',
    className
  );
  title.textContent = text;
  return title;
}

export function createCardDescription(text: string, className?: string): HTMLParagraphElement {
  const description = document.createElement('p');
  description.className = cn('text-sm text-muted-foreground', className);
  description.textContent = text;
  return description;
}

export function createCardContent(props: CardProps): HTMLDivElement {
  const { className, children } = props;
  const content = document.createElement('div');
  content.className = cn('p-6 pt-0', className);

  if (children) {
    if (Array.isArray(children)) {
      children.forEach(child => content.appendChild(child));
    } else {
      content.appendChild(children);
    }
  }

  return content;
}

export function createCardFooter(props: CardProps): HTMLDivElement {
  const { className, children } = props;
  const footer = document.createElement('div');
  footer.className = cn('flex items-center p-6 pt-0', className);

  if (children) {
    if (Array.isArray(children)) {
      children.forEach(child => footer.appendChild(child));
    } else {
      footer.appendChild(children);
    }
  }

  return footer;
}
