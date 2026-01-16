/**
 * Admin login page
 * Redirects to Google OAuth sign-in
 */

import { redirect } from "next/navigation"
import { auth, signIn } from "@/app/api/auth/[...nextauth]/route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminLoginPage() {
  // Don't check auth here - let the user click the button to sign in
  // Checking auth() can cause redirect loops if NextAuth isn't fully configured
  // The sign-in button will handle authentication

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Luminary Admin Portal</CardTitle>
          <CardDescription>
            Sign in with your Google account to access the admin portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/admin/dashboard" })
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              Sign in with Google
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Your account must be approved by an owner before you can access the portal.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
