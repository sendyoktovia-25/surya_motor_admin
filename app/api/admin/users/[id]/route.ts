import { NextResponse } from "next/server";
import { createAdminClient } from "../../admin-client";
import { requireAuth } from "../../auth-util";

type UpdateUserPayload = {
  email?: string;
  password?: string;
  role?: "admin" | "pemilik";
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check if user is authenticated
    const auth = await requireAuth();
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const { id } = await params;
    const supabase = createAdminClient();
    const payload: UpdateUserPayload = await request.json();

    const updateData: any = {};
    if (payload.email) updateData.email = payload.email;
    if (payload.password) updateData.password = payload.password;
    if (payload.role) updateData.user_metadata = { role: payload.role };

    const { data, error } = await supabase.auth.admin.updateUserById(
      id,
      updateData,
    );

    if (error) {
      console.error("[PATCH /api/admin/users/:id] Error updating user:", error);
      return NextResponse.json(
        {
          error: "Failed to update user",
          details: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        data: {
          id: data.user.id,
          email: data.user.email,
          role: data.user.user_metadata?.role || "other",
        },
        error: null,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[PATCH /api/admin/users/:id] Unexpected error:", err);
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check if user is authenticated
    const auth = await requireAuth();
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const { id } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) {
      console.error(
        "[DELETE /api/admin/users/:id] Error deleting user:",
        error,
      );
      return NextResponse.json(
        {
          error: "Failed to delete user",
          details: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        data: null,
        error: null,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[DELETE /api/admin/users/:id] Unexpected error:", err);
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
