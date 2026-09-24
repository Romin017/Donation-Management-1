import React from 'react'
import { HeartHandshake, HandCoins, ShieldCheck, Users } from 'lucide-react'

const variants = {
  landing: {
    icon: HeartHandshake,
    iconBg: 'bg-primary',
    iconText: 'text-primary-foreground',
    title: 'DonateHub',
    subtitle: 'Donation Management',
    titleClass: 'font-display text-lg font-bold text-foreground',
    subtitleClass: 'text-muted-foreground',
  },
  login: {
    icon: HeartHandshake,
    iconBg: 'bg-accent',
    iconText: 'text-accent-foreground',
    title: 'DonateHub',
    subtitle: 'Donation Management',
    titleClass: 'font-display text-lg font-bold text-white',
    subtitleClass: 'text-white/60',
  },
  register: {
    icon: ShieldCheck,
    iconBg: 'bg-primary',
    iconText: 'text-primary-foreground',
    title: 'DonateHub',
    subtitle: 'Secure Giving',
    titleClass: 'font-display text-xl font-bold text-foreground',
    subtitleClass: 'text-muted-foreground',
  },
  donor: {
    icon: HandCoins,
    iconBg: 'bg-primary',
    iconText: 'text-primary-foreground',
    title: 'DonateHub',
    subtitle: 'Donor Dashboard',
    titleClass: 'font-display text-lg font-bold text-foreground',
    subtitleClass: 'text-muted-foreground',
  },
  dashboard: {
    icon: HeartHandshake,
    iconBg: 'bg-accent',
    iconText: 'text-accent-foreground',
    title: 'DonateHub',
    subtitle: 'Donation Management',
    titleClass: 'font-display text-[15px] font-bold leading-none text-white',
    subtitleClass: 'text-sidebar-foreground/60',
  },
  default: {
    icon: HeartHandshake,
    iconBg: 'bg-primary',
    iconText: 'text-primary-foreground',
    title: 'DonateHub',
    subtitle: 'Donation Management',
    titleClass: 'font-display text-lg font-bold text-foreground',
    subtitleClass: 'text-muted-foreground',
  },
}

export function BrandLogo({ variant = 'default', compact = false, className = '' }) {
  const definition = variants[variant] || variants.default
  const Icon = definition.icon

  return (
    <div className={`flex items-center gap-2.5 ${className}`}> 
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${definition.iconBg} ${definition.iconText}`}> 
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <span className={definition.titleClass}>{definition.title}</span>
        {!compact && (
          <p className={`mt-1 text-[11px] ${definition.subtitleClass}`}>{definition.subtitle}</p>
        )}
      </div>
    </div>
  )
}
