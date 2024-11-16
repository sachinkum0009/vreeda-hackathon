import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import UserContext from "@/models/UserContext";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from 'next-auth/next';
import { Session } from 'next-auth';

export async function DELETE(req: NextRequest) {
  const session: Session | null = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id; // Extract user ID
  if (!userId) {
    return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
  }
  
  try {
    await connectToDatabase();

    // Delete the user's context
    const result = await UserContext.deleteOne({ userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User context not found" }, { status: 404 });
    }

    // Trigger logout (if applicable, handle this client-side)
    return NextResponse.json({ message: "User revoked and logged out" }, { status: 200 });
  } catch (error) {
    console.error("Error revoking user:", error);
    return NextResponse.json({ error: "Failed to revoke user" }, { status: 500 });
  }
}
