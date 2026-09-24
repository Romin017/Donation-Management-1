import React from 'react'
import { Menu } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'

export function Topbar({ title, subtitle, actions }) {
  const outletCtx = useOutletContext() || {}
  const { setMobileOpen } = outletCtx

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-4 sm:px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:bg-secondary lg:hidden transition-colors"
            title="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        <div>
          <h1 className="font-display text-xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions}
      </div>
    </header>
  )
}
