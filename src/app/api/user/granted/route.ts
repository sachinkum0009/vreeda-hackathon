import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import UserContext from "@/models/UserContext";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from 'next-auth/next';
import { Session } from 'next-auth';

export async function GET(req: NextRequest) {
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

    const userContext = await UserContext.findOne({ userId });
    if (!userContext) {
      return NextResponse.json({ granted: false, message: "User context not found" }, { status: 404 });
    }

    const { apiAccessTokens } = userContext;
    if (!apiAccessTokens?.accessToken || !apiAccessTokens?.refreshToken) {
      return NextResponse.json({ granted: false, message: "Tokens are missing" }, { status: 401 });
    }

    const now = new Date();
    const accessTokenExpired =
      apiAccessTokens.accessTokenExpiration && new Date(apiAccessTokens.accessTokenExpiration) <= now;
    const refreshTokenExpired =
      apiAccessTokens.refreshTokenExpiration && new Date(apiAccessTokens.refreshTokenExpiration) <= now;

    if (accessTokenExpired || refreshTokenExpired) {
      return NextResponse.json({ granted: false, message: "Tokens are expired" }, { status: 401 });
    }

    return NextResponse.json({ granted: true, message: "Access granted" }, { status: 200 });
  } catch (error) {
    console.error("Error checking user context:", error);
    return NextResponse.json({ error: "Failed to validate user context" }, { status: 500 });
  }
}
