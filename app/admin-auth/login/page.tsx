/**
 * Admin login page
 * Redirects to Google OAuth sign-in
 */

import { redirect } from "next/navigation"
import { auth, signIn } from "@/app/api/auth/[...nextauth]/route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminLoginPage() {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/(auth)/login/page.tsx:12',message:'LoginPage entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
  // Try to get session, but don't fail if there's an error
  let session = null
  try {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/(auth)/login/page.tsx:17',message:'Calling auth()',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    session = await auth()
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/(auth)/login/page.tsx:20',message:'Auth success',data:{hasSession:!!session,hasEmail:!!session?.user?.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/(auth)/login/page.tsx:23',message:'Auth error in login page',data:{error:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    // If auth fails, just continue to show login page
    console.log("Auth check failed (expected on login page):", error)
  }
  
  // If already authenticated, redirect to dashboard
  if (session?.user?.email) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/(auth)/login/page.tsx:30',message:'Already authenticated, redirecting to dashboard',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    redirect("/admin/dashboard")
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/(auth)/login/page.tsx:35',message:'Rendering login page',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion

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
