/**
 * Layout for auth pages (login, pending) - bypasses main admin layout
 * This layout prevents the parent app/admin/layout.tsx from running
 */

export const dynamic = 'force-dynamic'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-background">{children}</div>
}
