# Hostaway Messaging API Investigation Results

## Date: January 15, 2026

## Problem
Inquiry messages were being stored in `comment` and `guestNote` fields of the reservation, but were not appearing in the Hostaway inbox/messaging system.

## Root Cause
The `comment` and `guestNote` fields are metadata fields on the reservation object. They do NOT create messages in the Hostaway inbox/conversation system. The inbox uses a separate messaging system with conversations and messages.

## Solution Discovered

### Key Findings

1. **Conversations are automatically created** for inquiries within 1-2 seconds after inquiry creation
2. **Messages can be added to conversations** using a separate API endpoint
3. **The correct flow** is:
   - Create inquiry via `POST /v1/reservations`
   - Wait 1-2 seconds for conversation to be auto-created
   - Query conversation using `GET /v1/conversations?reservationId={id}`
   - Add message using `POST /v1/conversations/{conversationId}/messages`

### API Endpoints

#### ✅ GET /v1/conversations
- **Purpose**: Retrieve conversations
- **Query Parameters**: 
  - `reservationId={id}` - Filter by reservation ID
  - `guestEmail={email}` - Filter by guest email
- **Response**: Array of conversation objects
- **Status**: ✅ Works

#### ✅ POST /v1/conversations/{conversationId}/messages
- **Purpose**: Create a message in a conversation
- **Required Fields**:
  - `body` (string) - The message content
- **Optional Fields**:
  - `isIncoming` (number) - `1` for messages from guest, `0` for messages from host (default: `0`)
  - `reservationId` (number) - Reservation ID (auto-populated from conversation)
  - `listingMapId` (number) - Listing map ID (auto-populated from conversation)
- **Response**: Message object with ID, status, date, etc.
- **Status**: ✅ Works

#### ❌ POST /v1/conversations
- **Purpose**: Create a new conversation
- **Status**: ❌ Resource not found - Conversations are auto-created, cannot be manually created

#### ❌ POST /v1/messages
- **Purpose**: Create messages (generic)
- **Status**: ❌ Resource not found

#### ❌ POST /v1/conversationMessages
- **Purpose**: Create conversation messages (alternative endpoint)
- **Status**: ❌ Resource not found

### Conversation Structure

```typescript
interface Conversation {
  id: number
  accountId: number
  listingMapId: number
  reservationId: number
  type: "host-guest-email" | string
  recipientEmail: string
  recipientName: string
  hostEmail: string
  guestEmail: string
  hasUnreadMessages: number // 0 or 1
  messageSentOn: string | null
  messageReceivedOn: string | null
  conversationMessages: ConversationMessage[]
}
```

### Message Structure

```typescript
interface ConversationMessage {
  id: number
  accountId: number
  listingMapId: number
  reservationId: number
  conversationId: number
  body: string
  isIncoming: number // 1 = from guest, 0 = from host
  status: "sent" | string
  date: string
  messageSource: "Email" | "API" | string
  communicationType: "email" | string
  originatedBy: "system" | "user" | string
  // ... many other fields
}
```

## Implementation Plan

### Step 1: Update `createInquiry` function
After creating the inquiry, add logic to:
1. Wait 1-2 seconds for conversation to be created
2. Query conversation by reservationId
3. Add message to conversation with `isIncoming: 1`

### Step 2: Add helper function
Create `addMessageToConversation` function in `lib/hostaway.ts`:
```typescript
export async function addMessageToConversation(
  reservationId: number,
  message: string
): Promise<{ messageId: number }>
```

### Step 3: Update inquiry creation flow
Modify `createInquiry` to:
1. Create inquiry (existing)
2. Call `addMessageToConversation` with the inquiry message
3. Return both inquiry ID and message ID

## Test Results

### ✅ Successful Tests

1. **Conversation Auto-Creation**: Conversations are automatically created within 1-2 seconds
2. **Message Creation**: Messages can be successfully added using `POST /conversations/{id}/messages`
3. **Message Direction**: Setting `isIncoming: 1` correctly marks messages as "from guest"
4. **Message Visibility**: Messages appear in Hostaway inbox after creation

### Test Scripts Created

1. `scripts/test-hostaway-messages.ts` - Initial endpoint discovery
2. `scripts/test-hostaway-conversations.ts` - Conversation structure investigation
3. `scripts/test-hostaway-create-message.ts` - Message creation testing
4. `scripts/test-hostaway-conversation-creation.ts` - Conversation creation attempts
5. `scripts/test-hostaway-inquiry-message-flow.ts` - Complete flow verification
6. `scripts/test-hostaway-message-direction.ts` - Message direction testing

## Key Code Changes Needed

### In `lib/hostaway.ts`:

1. Add `addMessageToConversation` function
2. Update `createInquiry` to call `addMessageToConversation` after inquiry creation
3. Handle retry logic for conversation lookup (may take 1-2 seconds)

### Example Implementation:

```typescript
export async function addMessageToConversation(
  reservationId: number,
  message: string,
  isIncoming: number = 1 // Default to guest message
): Promise<{ messageId: number }> {
  // Wait for conversation to be created
  let conversationId: number | null = null
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts && !conversationId) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    attempts++
    
    try {
      const conversations = await makeRequest<any[]>(
        `/conversations?reservationId=${reservationId}`,
        { method: "GET" }
      )
      
      if (conversations.length > 0) {
        conversationId = conversations[0].id
        break
      }
    } catch (error) {
      // Continue retrying
    }
  }
  
  if (!conversationId) {
    throw new Error(`No conversation found for reservation ${reservationId} after ${maxAttempts} attempts`)
  }
  
  // Add message to conversation
  const messageResult = await makeRequest<any>(
    `/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: message,
        isIncoming: isIncoming,
      }),
    }
  )
  
  return {
    messageId: messageResult.id,
  }
}
```

## Notes

- Conversations are automatically created by Hostaway for inquiries
- There is no endpoint to manually create conversations
- Messages must be added to existing conversations
- Setting `isIncoming: 1` is important to mark messages as coming from guests
- The conversation lookup may require retry logic (1-2 second delay)
