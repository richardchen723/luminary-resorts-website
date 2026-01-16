/**
 * User management page (admin and owner only)
 * Approve/reject/admin users and manage roles
 */

"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Trash2, Edit } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
  approval_status: string
  created_at: string
  approved_at: string | null
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")

  useEffect(() => {
    loadUsers()
  }, [statusFilter])

  async function loadUsers() {
    setLoading(true)
    try {
      const url = statusFilter === "all" 
        ? "/api/admin/users" 
        : `/api/admin/users?status=${statusFilter}`
      const response = await fetch(url)
      if (!response.ok) {
        if (response.status === 403) {
          alert("Access denied. Admin or owner access required.")
          return
        }
        throw new Error("Failed to load users")
      }
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("Error loading users:", error)
      alert("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  async function approveUser(userId: string, role: "admin" | "member") {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to approve user")
      }

      alert("User approved successfully!")
      loadUsers()
    } catch (error: any) {
      alert(error.message || "Failed to approve user")
      console.error("Error approving user:", error)
    }
  }

  async function rejectUser(userId: string) {
    const confirmed = confirm("Reject this user? They will not be able to access the admin portal.")
    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to reject user")
      }

      alert("User rejected")
      loadUsers()
    } catch (error: any) {
      alert(error.message || "Failed to reject user")
      console.error("Error rejecting user:", error)
    }
  }

  async function updateUserRole(userId: string, newRole: "admin" | "member") {
    const confirmed = confirm(`Change this user's role to ${newRole}?`)
    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/users/${userId}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update user role")
      }

      alert("User role updated successfully!")
      loadUsers()
    } catch (error: any) {
      alert(error.message || "Failed to update user role")
      console.error("Error updating user role:", error)
    }
  }

  async function removeUser(userId: string, email: string) {
    const confirmed = confirm(`Are you sure you want to remove ${email}? This action cannot be undone.`)
    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/users/${userId}/remove`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to remove user")
      }

      alert("User removed successfully!")
      loadUsers()
    } catch (error: any) {
      alert(error.message || "Failed to remove user")
      console.error("Error removing user:", error)
    }
  }

  const pendingUsers = users.filter(u => u.approval_status === "pending")
  const approvedUsers = users.filter(u => u.approval_status === "approved")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage admin users, approve requests, and assign roles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter:</label>
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pending Approvals */}
      {statusFilter === "all" && pendingUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>
              {pendingUsers.length} user{pendingUsers.length !== 1 ? "s" : ""} awaiting approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Requested Role</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name || "N/A"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => approveUser(user.id, user.role as "admin" | "member")}
                          size="sm"
                          variant="outline"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Approve as {user.role}
                        </Button>
                        <Button
                          onClick={() => rejectUser(user.id)}
                          size="sm"
                          variant="outline"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Users / Approved Users */}
      <Card>
        <CardHeader>
          <CardTitle>
            {statusFilter === "all" ? "All Users" : statusFilter === "pending" ? "Pending Users" : statusFilter === "approved" ? "Approved Users" : "Rejected Users"}
          </CardTitle>
          <CardDescription>
            {users.length} user{users.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {statusFilter === "pending" ? "No pending approvals" : "No users found"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isOwner = user.email === "yunhang.chen@gmail.com"
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name || "N/A"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {isOwner ? (
                          <Badge variant="default">Owner</Badge>
                        ) : user.approval_status === "approved" ? (
                          <Select
                            value={user.role}
                            onValueChange={(newRole) => updateUserRole(user.id, newRole as "admin" | "member")}
                          >
                            <SelectTrigger className="w-[120px] h-7">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline">{user.role}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.approval_status === "approved"
                              ? "default"
                              : user.approval_status === "pending"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {user.approval_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.approval_status === "pending" ? (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => approveUser(user.id, user.role as "admin" | "member")}
                              size="sm"
                              variant="outline"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => rejectUser(user.id)}
                              size="sm"
                              variant="outline"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        ) : !isOwner ? (
                          <Button
                            onClick={() => removeUser(user.id, user.email)}
                            size="sm"
                            variant="outline"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Protected</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
