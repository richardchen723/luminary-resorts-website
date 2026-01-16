/**
 * User management page (owner only)
 * Approve/reject admin users
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
import { Check, X } from "lucide-react"

interface PendingUser {
  id: string
  email: string
  name: string | null
  role: string
  approval_status: string
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/users/pending")
      if (!response.ok) {
        if (response.status === 403) {
          alert("Access denied. Owner access required.")
          return
        }
        throw new Error("Failed to load users")
      }
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("Error loading users:", error)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Approve or reject admin user access requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>
            {users.length} user{users.length !== 1 ? "s" : ""} awaiting approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending approvals
            </div>
          ) : (
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
                {users.map((user) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
