import { NextResponse } from "next/server";
import { createAdminClient } from "../admin-client";
import { requireAuth } from "../auth-util";

type CreateUserPayload = {
  email: string;
  password: string;
  role: "admin" | "pemilik";
};

export async function GET() {
  try {
    // Check if user is authenticated
    const auth = await requireAuth();
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const supabase = createAdminClient();

    // Call admin API
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("[GET /api/admin/users] Error listing users:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch users",
          details: error.message,
        },
        { status: 400 },
      );
    }

    // Transform user data to remove sensitive fields
    const users = (data?.users || []).map((user) => ({
      id: user.id,
      email: user.email || "",
      role: (user.user_metadata?.role as "admin" | "pemilik") || "pemilik",
    }));

    return NextResponse.json(
      {
        data: users,
        error: null,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[GET /api/admin/users] Unexpected error:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          err instanceof Error ? err.message : "Missing Supabase configuration",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const auth = await requireAuth();
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const supabase = createAdminClient();
    const payload: CreateUserPayload = await request.json();

    // Validate payload
    if (!payload.email || !payload.password) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "email and password are required",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
      user_metadata: { role: payload.role },
    });

    console.log("[POST /api/admin/users] createUser response:", {
      error,
    });

    if (error) {
      console.error("[POST /api/admin/users] Error creating user:", error);
      return NextResponse.json(
        {
          error: "Failed to create user",
          details: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
          },
        },
        error: null,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/admin/users] Unexpected error:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          err instanceof Error ? err.message : "Missing Supabase configuration",
      },
      { status: 500 },
    );
  }
}
