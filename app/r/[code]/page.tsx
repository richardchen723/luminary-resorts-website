/**
 * Referral redirect page
 * This page redirects to the API route handler which sets the cookie
 * We can't set cookies in Server Components, only in Route Handlers
 */

import { redirect } from "next/navigation"

export default async function ReferralRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }> | { code: string }
  searchParams: Promise<{ cabin?: string }> | { cabin?: string }
}) {
  // Handle params as Promise (Next.js 15+) or object (Next.js 14)
  const resolvedParams = params instanceof Promise ? await params : params
  const resolvedSearchParams = searchParams instanceof Promise ? await searchParams : searchParams
  
  const referralCode = resolvedParams.code

  // Validate referral code format
  if (!referralCode || !referralCode.startsWith("inf_") || referralCode.length < 16) {
    redirect("/")
  }

  // Redirect to API route handler which will set the cookie and redirect
  const cabin = resolvedSearchParams.cabin
  const apiUrl = cabin 
    ? `/api/referral/${referralCode}?cabin=${cabin}`
    : `/api/referral/${referralCode}`
  
  redirect(apiUrl)
}
