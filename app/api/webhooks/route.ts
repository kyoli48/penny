import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/db";

// Clerk user.created webhook

export async function POST(req: Request) {
  try {
    if (process.env.NODE_ENV === "development") {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const contentType = req.headers.get("content-type");
    if (contentType !== "application/json") {
      return new NextResponse("Invalid content type", { status: 415 });
    }

    const payload = await req.json();
    if (payload === null) {
      console.error("Received null or invalid payload");
      return new NextResponse("Null Payload", { status: 200 });
    }

    const headerPayload = req.headers;

    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Missing headers:", {
        svix_id,
        svix_timestamp,
        svix_signature,
      });
      return new NextResponse("Error occurred - Missing svix headers", {
        status: 400,
      });
    }

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET is not configured");
      return new NextResponse("Server configuration error", { status: 500 });
    }

    const wh = new Webhook(webhookSecret);

    try {
      try {
        wh.verify(JSON.stringify(payload), {
          "svix-id": svix_id,
          "svix-timestamp": svix_timestamp,
          "svix-signature": svix_signature,
        });
      } catch (error) {
        console.error("Error verifying webhook:", error);
      }

      const { type, data } = payload;

      if (type === "user.created" && data) {
        const newUser = await db.user.create({
          data: {
            id: data.id,
            first_name: data.first_name ? data.first_name : "",
            last_name: data.last_name ? data.last_name : "",
          },
        })      
      }
      return new NextResponse("Success", { status: 200 });
    } catch (verifyError) {
      console.log(verifyError);
      return new NextResponse("Webhook verification failed", { status: 401 });
    }
  } catch (error) {
    console.log(error);
    return new NextResponse("Error occurred", { status: 500 });
  }
}