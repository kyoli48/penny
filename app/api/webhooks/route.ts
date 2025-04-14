import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const evt = await verifyWebhook(req)

    // Create and await Supabase client
    const supabase = await createClient();

    // Do something with payload
    // For this guide, log payload to console
    const { id, created_at } = evt.data
    const eventType = evt.type

    const { error } = await supabase
        .from('users')
        .insert({ clerk_id: id, created_at: created_at, data: evt.data })
    
    if (error) {
      console.error('Error inserting user:', error)
      return new Response('Error processing webhook', { status: 500 })
    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}