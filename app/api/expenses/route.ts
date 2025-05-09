import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { formatExpenseForClient } from '@/lib/types/expense';



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

        return NextResponse.json( formatExpenseForClient(expenseCreated), { status: 200 });
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
        const expenses = userExpenses.map(ue =>
            formatExpenseForClient(ue.expense)
          );

        return NextResponse.json(expenses, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, name, amount, description, paid, participantIds = [] } = await req.json();
    if (!id) return NextResponse.json({ error: "Expense ID required" }, { status: 400 });

    const link = await db.userExpenses.findFirst({ where: { userId, expenseId: id } });
    if (!link) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updatedExpense = await db.expenses.update({
        where: { id },
        data: {
            name,
            amount,
            description,
            paid,
            users: {
                deleteMany: {}, // Remove all existing participants
                create: Array.from(new Set([userId, ...participantIds])).map(uid => ({
                    user: { connect: { id: uid } }
                }))
            }
        },
        include: { users: true }
    });

    return NextResponse.json( formatExpenseForClient(updatedExpense), { status: 200 });
}

export async function DELETE(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Expense ID required" }, { status: 400 });

    // Remove the user from UserExpenses
    await db.userExpenses.deleteMany({ where: { userId, expenseId: id } });

    // If no users left, delete the expense
    const remaining = await db.userExpenses.count({ where: { expenseId: id } });
    if (remaining === 0) {
        await db.expenses.delete({ where: { id } });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}