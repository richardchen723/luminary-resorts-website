/**
 * NextAuth.js API route handler
 * Handles Google OAuth authentication for admin portal
 */

import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { upsertAdminUser, getAdminUserByEmail } from "@/lib/auth"

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (!user.email) {
        return false
      }

      try {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/[...nextauth]/route.ts:18',message:'signIn callback',data:{email:user.email,name:user.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        // Upsert admin user in database
        const adminUser = await upsertAdminUser({
          email: user.email,
          name: user.name || null,
          google_id: account?.providerAccountId || null,
        })
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/[...nextauth]/route.ts:26',message:'upsertAdminUser completed',data:{email:adminUser.email,role:adminUser.role,approval_status:adminUser.approval_status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        return true
      } catch (error: any) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/[...nextauth]/route.ts:32',message:'signIn error',data:{error:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        console.error("Error in signIn callback:", error)
        return false
      }
    },
    async session({ session, token }: any) {
      if (session.user?.email) {
        // Add admin user data to session
        const adminUser = await getAdminUserByEmail(session.user.email)
        
        if (adminUser) {
          session.user = {
            ...session.user,
            id: adminUser.id,
            role: adminUser.role,
            approval_status: adminUser.approval_status,
          } as any
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)

export const { GET, POST } = handlers
