import React, { useEffect } from 'react'
import { CheckCircle2, X, XCircle } from 'lucide-react'

export function FeedbackToast({ feedback, onClose }) {
  useEffect(() => {
    if (!feedback) return undefined

    const timeout = window.setTimeout(onClose, 5000)
    return () => window.clearTimeout(timeout)
  }, [feedback, onClose])

  if (!feedback) return null

  const isSuccess = feedback.type === 'success'

  return (
    <div
      role="alert"
      className={`fixed bottom-6 left-1/2 z-[70] flex w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 items-start gap-3 rounded-lg border p-4 shadow-lg ${
        isSuccess
          ? 'border-success/30 bg-success/10 text-success'
          : 'border-destructive/30 bg-destructive/10 text-destructive'
      }`}
    >
      {isSuccess ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0" />}
      <p className="flex-1 text-sm font-medium">{feedback.message}</p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-md p-0.5 opacity-70 hover:opacity-100"
        aria-label="Close notification"
        title="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
