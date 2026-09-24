import React, { useState } from 'react'
import { UserCircle, LockKeyhole } from 'lucide-react'

import { Topbar } from '../components/layout/Topbar'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { FeedbackToast } from '../components/ui/FeedbackToast'
import { useAuth } from '../context/AuthContext'
import { ProfileEdit } from './user-profile/ProfileEdit'
import { ChangePassword } from './user-profile/ChangePassword'

export default function UserProfile() {
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [feedback, setFeedback] = useState(null)

  return (
    <div>
      <FeedbackToast feedback={feedback} onClose={() => setFeedback(null)} />
      <Topbar
        title="User profile"
        subtitle="Manage your account details"
      />

      <div className="mx-auto max-w-4xl px-4 py-6">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <UserCircle className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-base">{user?.name || 'Profile'}</CardTitle>
                <p className="text-xs text-muted-foreground">{user?.role || 'User'} account</p>
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
              <ProfileEdit user={user} onUpdate={updateProfile} onFeedback={setFeedback} />
            ) : (
              <ChangePassword onFeedback={setFeedback} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
