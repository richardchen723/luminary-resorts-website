/**
 * Layout for auth pages (login, pending) - bypasses main admin layout
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-background">{children}</div>
}
