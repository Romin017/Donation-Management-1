import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Topbar } from '../components/layout/Topbar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { ConfirmDialog } from '../components/ui/Modal'
import { FeedbackToast } from '../components/ui/FeedbackToast'
import { UserFormModal } from '../components/users/UserFormModal'
import { useAuth } from '../context/AuthContext'
import { initials } from '../lib/utils'
import {
  getUsersService,
  createUserService,
  updateUserService,
  deleteUserService,
} from '../api/apiService'

const roleTone = { Admin: 'Cheque', Staff: 'Cash' }
const statusTone = { Active: 'Cash', Inactive: 'Cheque', Pending: 'Online' }

export default function Users() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)

  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    setError('')
    try {
      const { data } = await getUsersService()
      setUsers(data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = users
    .filter((u) => (roleFilter === 'All' ? true : u.role === roleFilter))
    .filter((u) => [u.name, u.email].join(' ').toLowerCase().includes(query.toLowerCase()))

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(user) {
    setEditing(user)
    setFormOpen(true)
  }

  async function handleSubmit(data) {
    setSubmitting(true)
    setError('')
    try {
      if (editing) {
        const { data: res } = await updateUserService(editing._id, data)
        setUsers((prev) => prev.map((u) => (u._id === editing._id ? res.data : u)))
        setFeedback({ type: 'success', message: res.message || 'User updated successfully.' })
        setFormOpen(false)
      } else {
        const { data: res } = await createUserService(data)
        setUsers((prev) => [res.data, ...prev])
        setFeedback({ type: 'success', message: res.message || 'User created and setup email sent.' })
        setFormOpen(false)
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to save user.' })
      setError(err.response?.data?.message || 'Failed to save user.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteUserService(deleteTarget._id)
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id))
      setFeedback({ type: 'success', message: 'User deleted successfully.' })
      setDeleteTarget(null)
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to delete user.' })
      setError(err.response?.data?.message || 'Failed to delete user.')
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <FeedbackToast feedback={feedback} onClose={() => setFeedback(null)} />
      <Topbar
        title="Users"
        subtitle={`${users.length} user${users.length === 1 ? '' : 's'}`}
        actions={isAdmin ? (
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add user
          </Button>
        ) : null}
      />

      <div className="p-6">
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
        )}
        <div className="mb-4 flex flex-wrap gap-3">
          <Input
            placeholder="Search users…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-xs"
          />
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="max-w-[160px]">
            <option>All</option>
            <option>Admin</option>
            <option>Staff</option>
          </Select>
        </div>

        {loading && <p className="py-10 text-center text-sm text-muted-foreground">Loading users…</p>}

        {!loading && (
          <Card className="overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-secondary text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    {isAdmin && <th className="px-5 py-3 font-medium text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((u) => (
                    <tr key={u._id} className="hover:bg-secondary/30">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {initials(u.name)}
                          </div>
                          <span className="font-medium text-foreground">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-3">
                        <Badge tone={roleTone[u.role]}>{u.role}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={statusTone[u.status]}>{u.status}</Badge>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => openEdit(u)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(u)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        user={editing}
        submitting={submitting}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete user?"
        description={`This will permanently remove ${deleteTarget?.name}'s account.`}
      />
    </div>
  )
} 