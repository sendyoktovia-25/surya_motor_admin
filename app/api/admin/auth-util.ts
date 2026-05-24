import { supabase } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function getAuthenticatedUser() {
  try {
    const client = await supabase();
    const {
      data: { user },
    } = await client.auth.getUser();

    return user;
  } catch (error) {
    console.error("[Auth] Error getting user:", error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      isAuthorized: false,
      response: NextResponse.json(
        {
          error: "Unauthorized",
          details: "You must be logged in to access this resource",
        },
        { status: 401 },
      ),
    };
  }

  return {
    isAuthorized: true,
    user,
  };
}
