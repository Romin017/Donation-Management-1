import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { HandCoins, Users, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Topbar } from '../components/layout/Topbar'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useData } from '../context/DataContext'
import { formatCurrency, formatDate, initials } from '../lib/utils'

function StatCard({ icon: Icon, label, value, delta, tone = 'primary' }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1.5 font-display text-2xl font-bold text-foreground">{value}</p>
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              tone === 'accent' ? 'bg-accent/15 text-accent-foreground' : 'bg-primary/10 text-primary'
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {delta && (
          <p className="mt-3 flex items-center gap-1 text-xs font-medium text-success">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {delta}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { donors, donations } = useData()

  const totalAmount = donations.reduce((s, g) => s + Number(g.amount), 0)
  const monthKey = new Date().toISOString().slice(0, 7)
  const thisMonth = donations
    .filter((g) => g.date?.startsWith(monthKey))
    .reduce((s, g) => s + Number(g.amount), 0)
  const avgDonation = donations.length ? Math.round(totalAmount / donations.length) : 0

  const chartData = useMemo(() => {
    const byMonth = {}
    donations.forEach((g) => {
      const key = g.date?.slice(0, 7)
      if (!key) return
      byMonth[key] = (byMonth[key] || 0) + Number(g.amount)
    })
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short' }),
        amount,
      }))
  }, [donations])

  const recent = [...donations]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  function donorName(id) {
    return donors.find((d) => d.id === id)?.name || 'Unknown donor'
  }

  return (
    <div>
      <Topbar title="Dashboard" subtitle="Overview of donors and donations" />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Wallet} label="Total raised" value={formatCurrency(totalAmount)} delta="All-time" />
          <StatCard icon={TrendingUp} label="This month" value={formatCurrency(thisMonth)} tone="accent" delta="Aug 2026" />
          <StatCard icon={Users} label="Total donors" value={donors.length} delta={`${donors.length} active`} />
          <StatCard icon={HandCoins} label="Avg. donation" value={formatCurrency(avgDonation)} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Donations trend</CardTitle>
              <span className="text-xs text-muted-foreground">By month</span>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ left: -20, right: 10 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(162 72% 24%)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(162 72% 24%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214 20% 90%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={70} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="amount" stroke="hsl(162 72% 24%)" strokeWidth={2} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent donations</CardTitle>
              <Link to="/donations" className="text-xs font-medium text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {recent.map((g) => (
                <div key={g.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                    {initials(donorName(g.donorId))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{donorName(g.donorId)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(g.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(g.amount)}</p>
                    <Badge tone={g.paymentMode}>{g.paymentMode}</Badge>
                  </div>
                </div>
              ))}
              {recent.length === 0 && <p className="text-sm text-muted-foreground">No donations recorded yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
