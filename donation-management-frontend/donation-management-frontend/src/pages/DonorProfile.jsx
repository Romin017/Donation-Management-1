import React, { useState } from 'react'
import { UserCircle, LockKeyhole } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { FeedbackToast } from '../components/ui/FeedbackToast'
import { useAuth } from '../context/AuthContext'
import { ProfileEdit } from './user-profile/ProfileEdit'
import { ChangePassword } from './user-profile/ChangePassword'

export default function DonorProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [feedback, setFeedback] = useState(null)

  return (
    <div className="min-h-screen bg-background">
      <FeedbackToast feedback={feedback} onClose={() => setFeedback(null)} />

      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <UserCircle className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">DonateHub</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/donor-dashboard', { replace: true })}>
            Back to dashboard
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Donor profile</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Account settings</h1>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <UserCircle className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-base">{user?.name || 'Donor profile'}</CardTitle>
                <p className="text-xs text-muted-foreground">{user?.email || 'donor@example.com'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === 'profile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('profile')}
              >
                <UserCircle className="h-4 w-4" /> Edit profile
              </Button>

              <Button
                variant={activeTab === 'password' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('password')}
              >
                <LockKeyhole className="h-4 w-4" /> Change password
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {activeTab === 'profile' ? (
              <ProfileEdit user={user} onFeedback={setFeedback} />
            ) : (
              <ChangePassword onFeedback={setFeedback} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
