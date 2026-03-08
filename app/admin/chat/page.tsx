import { auth } from "@/app/api/auth/[...nextauth]/route"
import { getAdminUserByEmail } from "@/lib/auth"
import { AdminChatInbox } from "@/components/admin-chat/admin-chat-inbox"

export default async function AdminChatPage({
  searchParams,
}: {
  searchParams: Promise<{ threadId?: string }> | { threadId?: string }
}) {
  const session = await auth()
  const resolvedSearchParams =
    searchParams instanceof Promise ? await searchParams : searchParams

  if (!session?.user?.email) {
    return null
  }

  const adminUser = await getAdminUserByEmail(session.user.email)
  if (!adminUser) {
    return null
  }

  return (
    <AdminChatInbox
      currentUserId={adminUser.id}
      currentUserName={adminUser.name || adminUser.email}
      initialThreadId={resolvedSearchParams.threadId || null}
    />
  )
}
