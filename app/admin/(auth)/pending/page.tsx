/**
 * Pending approval page
 * Shown to users who have signed in but are not yet approved
 */

import { redirect } from "next/navigation"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { getAdminUserByEmail, canAccessAdmin } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/api/auth/[...nextauth]/route"
import { Clock } from "lucide-react"

export default async function PendingApprovalPage() {
  let session = null
  try {
    session = await auth()
  } catch (error) {
    redirect("/admin/login")
  }
  
  if (!session?.user?.email) {
    redirect("/admin/login")
  }

  const adminUser = await getAdminUserByEmail(session.user.email)
  
  // If approved, redirect to dashboard
  if (adminUser && canAccessAdmin(adminUser)) {
    redirect("/admin/dashboard")
  }

  const approvalStatus = adminUser?.approval_status || "pending"

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
          <CardDescription className="mt-2">
            {approvalStatus === "pending" && (
              <>Your account is awaiting approval from an owner. You'll be notified once your access is granted.</>
            )}
            {approvalStatus === "rejected" && (
              <>Your account access has been denied. Please contact an administrator if you believe this is an error.</>
            )}
            {approvalStatus === "suspended" && (
              <>Your account has been suspended. Please contact an administrator for assistance.</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>Status:</strong> <span className="capitalize">{approvalStatus}</span></p>
          </div>
          
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/admin/login" })
            }}
          >
            <Button type="submit" variant="outline" className="w-full">
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
