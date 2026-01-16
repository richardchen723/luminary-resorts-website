/**
 * Admin portal layout
 * Provides sidebar navigation and authentication context
 * Note: Login and pending pages are excluded via route groups
 */

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { getAdminUserByEmail, canAccessAdmin } from "@/lib/auth"
import Link from "next/link"
import { signOut } from "@/app/api/auth/[...nextauth]/route"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  UserCheck,
  Settings,
  LogOut
} from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""
  
  // Skip auth check for login and pending pages (they're in route group with own layout)
  // Route groups don't prevent parent layouts, so we need to check here
  const isLoginOrPending = pathname === "/admin/login" || pathname === "/admin/pending"
  
  if (isLoginOrPending) {
    return <>{children}</>
  }

  // For all other admin pages, check authentication
  let session = null
  try {
    session = await auth()
  } catch (error: any) {
    // If auth fails, redirect to login (but not if we're already on login)
    if (pathname !== "/admin/login") {
      redirect("/admin/login")
    }
    // If we're on login and auth fails, just return children
    return <>{children}</>
  }
  
  if (!session?.user?.email) {
    redirect("/admin/login")
  }

  const adminUser = await getAdminUserByEmail(session.user.email)
  
  if (!adminUser || !canAccessAdmin(adminUser)) {
    redirect("/admin/pending")
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/influencers", label: "Influencers", icon: Users },
    { href: "/admin/reports", label: "Reports", icon: FileText },
  ]

  // Admin and owner can access user management
  if (adminUser.role === "admin" || adminUser.role === "owner") {
    navItems.push({ href: "/admin/users", label: "Users", icon: UserCheck })
  }

  // Owner-only items
  if (adminUser.role === "owner") {
    navItems.push({ href: "/admin/settings", label: "Settings", icon: Settings })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card min-h-screen flex flex-col">
          <div className="p-6 flex-1">
            <div className="flex items-center justify-between mb-8">
              <Link href="/admin/dashboard" className="block">
                <h1 className="text-2xl font-bold text-foreground">Luminary Admin</h1>
                <p className="text-sm text-muted-foreground mt-1">Affiliate Portal</p>
              </Link>
            </div>
            
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-foreground">{adminUser.name || adminUser.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{adminUser.role}</p>
              </div>
              <form action={async () => {
                "use server"
                await signOut({ redirectTo: "/admin/login" })
              }}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
