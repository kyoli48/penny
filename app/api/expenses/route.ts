import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

// POST, GET, PUT, DELETE endpoints

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
``
    try {
        const { amount, name, description, paid, participantIds =[] } = await req.json();

        // Ensure the creator is always included and no duplicates
        const allParticipantIds = Array.from(new Set([userId, ...participantIds]));


        const expenseCreated = await db.expenses.create({
            data: {
                name: name,
                amount: amount,
                description: description,
                paid: paid,
                users: {
                    create: allParticipantIds.map(uid => ({
                        user: { connect: { id: uid } }
                    }))
                }
            },      
            include: { users: true }      
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

export async function GET(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Find all UserExpenses for this user, including the related expense and participants
        const userExpenses = await db.userExpenses.findMany({
            where: { userId },
            include: {
                expense: {
                    include: {
                        users: true // includes all participants for each expense
                    }
                }
            }
        });

        // Map to just the expense objects, but include participants
        const expenses = userExpenses.map(ue => ({
            ...ue.expense,
            users: ue.expense.users // array of participant join records
        }));

        return NextResponse.json(expenses, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}