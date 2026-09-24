import React from 'react'
import { cn } from '../../lib/utils'

const styles = {
  Online: 'bg-primary/10 text-primary',
  Cash: 'bg-success/10 text-success',
  Cheque: 'bg-accent/15 text-accent-foreground',
  default: 'bg-secondary text-secondary-foreground',
}

export function Badge({ className, tone, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles[tone] || styles.default,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
