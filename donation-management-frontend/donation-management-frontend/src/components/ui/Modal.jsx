import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Modal({ open, onClose, title, description, children, className }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 pt-16 backdrop-blur-sm">
      <div
        className={cn(
          'w-full max-w-lg rounded-lg border border-border bg-card shadow-xl animate-in fade-in zoom-in-95',
          className,
        )}
      >
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description }) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} className="max-w-sm">
      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onClose}
          className="h-9 rounded-md border border-input px-4 text-sm font-medium hover:bg-secondary"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="h-9 rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground hover:opacity-90"
        >
          Delete
        </button>
      </div>
    </Modal>
  )
}
