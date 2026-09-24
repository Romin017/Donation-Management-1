import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Users,
  HandCoins,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Megaphone,
  Wallet,
  UserCog,
  User,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { initials } from '../../lib/utils'
import { BrandLogo } from '../ui/BrandLogo'

const nav = [
  {
    to: '/donors',
    label: 'Donors',
    icon: Users,
  },
  {
    to: '/campaigns',
    label: 'Campaigns',
    icon: Megaphone,
  },
  {
    to: '/donations',
    label: 'Donations',
    icon: HandCoins,
  },
  {
    to: '/expenses',
    label: 'Expenses',
    icon: Wallet,
  },
  {
    to: '/users',
    label: 'User Management',
    icon: UserCog,
  },
  {
    to: '/user-profile',
    label: 'User profile',
    icon: User,
  },
]

export function Sidebar({
  isCollapsed: propIsCollapsed,
  setIsCollapsed: propSetIsCollapsed,
  mobileOpen = false,
  setMobileOpen = () => {},
}) {
  const { user, logout } = useAuth()

  const [localCollapsed, setLocalCollapsed] =
    useState(false)

  const isCollapsed =
    propIsCollapsed !== undefined
      ? propIsCollapsed
      : localCollapsed

  const setIsCollapsed =
    propSetIsCollapsed || setLocalCollapsed

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev)
  }

  const closeMobile = () => {
    setMobileOpen(false)
  }

  const renderNavLinks = (isCompact = false) => (
    <nav className="mt-3 flex-1 space-y-1.5 px-3">
      {nav.map(
        ({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => {
              if (mobileOpen) {
                closeMobile()
              }
            }}
            title={
              isCompact
                ? label
                : undefined
            }
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-sidebar-accent text-white shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-white/5 hover:text-white'
              } ${
                isCompact
                  ? 'justify-center px-0'
                  : ''
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />

            {!isCompact && (
              <span>{label}</span>
            )}

            {isCompact && (
              <div className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity group-hover:block group-hover:opacity-100">
                {label}
              </div>
            )}
          </NavLink>
        ),
      )}
    </nav>
  )

  return (
    <>
      {/* ================= MOBILE BACKDROP ================= */}

      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* ================= MOBILE SIDEBAR ================= */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}

        <div className="flex items-center justify-between border-b border-sidebar-border/60 px-6 py-5">
          <BrandLogo variant="dashboard" />

          <button
            onClick={closeMobile}
            className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-white/10 hover:text-white"
            title="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Navigation */}

        {renderNavLinks(false)}

        {/* Mobile User */}

        <div className="flex items-center gap-3 border-t border-sidebar-border px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initials(user?.name)}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user?.name || 'User'}
            </p>

            <p className="truncate text-[11px] text-sidebar-foreground/50">
              {user?.role || 'Staff'}
            </p>
          </div>

          <button
            onClick={logout}
            title="Log out"
            className="rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* ================= DESKTOP SIDEBAR ================= */}

      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out lg:flex ${
          isCollapsed
            ? 'w-20'
            : 'w-64'
        }`}
      >
        {/* Header */}

        <div
          className={`flex items-center border-b border-sidebar-border/60 py-5 ${
            isCollapsed
              ? 'flex-col gap-3 px-2'
              : 'justify-between px-5'
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <BrandLogo variant="dashboard" compact={isCollapsed} className={isCollapsed ? 'flex-col items-center' : ''} />
          </div>

          <button
            onClick={toggleCollapse}
            title={
              isCollapsed
                ? 'Expand sidebar'
                : 'Collapse sidebar'
            }
            className="rounded-lg p-1.5 text-sidebar-foreground/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}

        {renderNavLinks(isCollapsed)}

        {/* User / Logout */}

        <div
          className={`flex items-center border-t border-sidebar-border py-4 transition-all ${
            isCollapsed
              ? 'flex-col justify-center gap-3 px-2'
              : 'gap-3 px-4'
          }`}
        >
          <div
            title={
              isCollapsed
                ? `${user?.name || 'User'} (${
                    user?.role || 'Staff'
                  })`
                : undefined
            }
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-xs"
          >
            {initials(user?.name)}
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.name || 'User'}
              </p>

              <p className="truncate text-[11px] text-sidebar-foreground/50">
                {user?.role || 'Staff'}
              </p>
            </div>
          )}

          <button
            onClick={logout}
            title="Log out"
            className="rounded-lg p-1.5 text-sidebar-foreground/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  )
}