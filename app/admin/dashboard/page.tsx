/**
 * Admin dashboard
 * Overview of key metrics and quick actions
 */

import { auth } from "@/app/api/auth/[...nextauth]/route"
import { getAdminUserByEmail } from "@/lib/auth"
import { query } from "@/lib/db/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, FileText, UserCheck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminDashboardPage() {
  const session = await auth()
  
  if (!session?.user?.email) {
    return null
  }

  const adminUser = await getAdminUserByEmail(session.user.email)
  
  if (!adminUser) {
    return null
  }

  // Fetch stats
  let stats = {
    totalInfluencers: 0,
    activeInfluencers: 0,
    totalBookings: 0,
    totalCommissionOwed: 0,
    pendingApprovals: 0,
  }

  try {
    // Total influencers
    const influencersResult = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM influencers"
    )
    stats.totalInfluencers = parseInt(influencersResult.rows?.[0]?.count || "0", 10)

    // Active influencers
    const activeResult = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM influencers WHERE status = 'active'"
    )
    stats.activeInfluencers = parseInt(activeResult.rows?.[0]?.count || "0", 10)

    // Total bookings (attributed)
    const bookingsResult = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM booking_attributions"
    )
    stats.totalBookings = parseInt(bookingsResult.rows?.[0]?.count || "0", 10)

    // Total commission owed
    const commissionResult = await query<{ sum: string }>(
      "SELECT COALESCE(SUM(amount), 0) as sum FROM commission_ledger WHERE status = 'owed'"
    )
    stats.totalCommissionOwed = parseFloat(commissionResult.rows?.[0]?.sum || "0")

    // Pending approvals (owner only)
    if (adminUser.role === "owner") {
      const pendingResult = await query<{ count: string }>(
        "SELECT COUNT(*) as count FROM admin_users WHERE approval_status = 'pending'"
      )
      stats.pendingApprovals = parseInt(pendingResult.rows?.[0]?.count || "0", 10)
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {adminUser.name || adminUser.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Influencers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeInfluencers}</div>
            <p className="text-xs text-muted-foreground">
              of {stats.totalInfluencers} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attributed Bookings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              Total bookings from referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Owed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalCommissionOwed.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Outstanding commissions
            </p>
          </CardContent>
        </Card>

        {adminUser.role === "owner" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">
                Users awaiting approval
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/influencers/new">
                <Users className="mr-2 h-4 w-4" />
                Add New Influencer
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/reports">
                <FileText className="mr-2 h-4 w-4" />
                View Reports
              </Link>
            </Button>
            {adminUser.role === "owner" && (
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/users">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
