    import React from 'react'
    import { HeartHandshake, ArrowRight, ShieldCheck, HandCoins, Users } from 'lucide-react'
    import { Link } from 'react-router-dom'
    import { Button } from '../components/ui/Button'
    import { Card } from '../components/ui/Card'

    export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HeartHandshake className="h-5 w-5" />
                </div>
                <span className="font-display text-lg font-bold text-foreground">DonateHub</span>
            </div>
            <div className="flex gap-3">
                <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                <Button size="sm">Register</Button>
                </Link>
            </div>
            </div>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-5xl items-center px-6 py-12">
            <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary">
                <HeartHandshake className="h-4 w-4" />
                Donation Management
                </div>
                <h1 className="mt-6 font-display text-5xl font-black leading-tight text-foreground">
                Every act of giving makes an impact.
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                A transparent donation experience for campaigns, donors, and community fundraising.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register">
                    <Button size="lg">
                    Register
                    <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
                <Link to="/login">
                    <Button variant="secondary" size="lg">
                    Login
                    </Button>
                </Link>
                </div>

                <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                    <Users className="mx-auto mb-2 h-5 w-5 text-primary" />
                    <p className="text-xs text-muted-foreground">Donor access</p>
                </Card>
                <Card className="p-4 text-center">
                    <ShieldCheck className="mx-auto mb-2 h-5 w-5 text-primary" />
                    <p className="text-xs text-muted-foreground">Secure giving</p>
                </Card>
                <Card className="p-4 text-center">
                    <HandCoins className="mx-auto mb-2 h-5 w-5 text-primary" />
                    <p className="text-xs text-muted-foreground">Campaigns</p>
                </Card>
                </div>
            </div>

            <div className="relative">
                <div className="rounded-[2rem] border border-border bg-card p-8 shadow-xl">
                <div className="rounded-2xl bg-secondary p-6">
                    <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Campaign</span>
                    <HeartHandshake className="h-5 w-5 text-primary" />
                    </div>
                    <div className="mt-8">
                    <p className="text-xs uppercase text-muted-foreground">Campaign spotlight</p>
                    <h2 className="mt-2 font-display text-3xl font-bold text-foreground">Community Giving</h2>
                    </div>
                    <div className="mt-8 rounded-xl bg-background p-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Purpose</span>
                        <span className="font-bold text-foreground">Education & Care</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Open</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Mode</span>
                        <span className="font-bold text-foreground">Online Donation</span>
                        </div>
                    </div>
                    </div>
                    <div className="mt-8">
                    <Link to="/register">
                        <Button className="w-full">
                        Start giving
                        <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                    </div>
                </div>
                </div>
            </div>
            </section>
        </main>
        </div>
    )
    }
