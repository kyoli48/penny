import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

// TODO: Add GET, PUT, and DELETE methods

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { amount, name, description, paid } = await req.json();

        const expenseCreated = await db.expenses.create({
            data: {
                name: name,
                amount: amount,
                description: description,
                paid: paid
            }            
        })

        if (!expenseCreated) {
            return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
        }

        return NextResponse.json( expenseCreated, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
