"use client";

export type UserRole = "admin" | "pemilik";

export type User = {
  id: string;
  email: string;
  role: UserRole;
};

// Fetch all users from the API route
export const getUserList = async () => {
  try {
    const response = await fetch("/api/admin/users", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        data: null,
        error: new Error(errorData.details || "Failed to fetch users"),
      };
    }

    const { data } = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error fetching users"),
    };
  }
};

// Create a new user via the API route
export const createUser = async (payload: {
  email: string;
  password: string;
  role: UserRole;
}) => {
  try {
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        data: null,
        error: new Error(errorData.details || "Failed to create user"),
      };
    }

    const { data } = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error creating user"),
    };
  }
};

// Update an existing user via the API route
export const updateUser = async (payload: {
  id: string;
  email?: string;
  password?: string;
  role?: UserRole;
}) => {
  try {
    const { id, ...updateData } = payload;
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        data: null,
        error: new Error(errorData.details || "Failed to update user"),
      };
    }

    const { data } = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error updating user"),
    };
  }
};

// Delete a user via the API route
export const deleteUser = async ({ id }: { id: string }) => {
  try {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: new Error(errorData.details || "Failed to delete user"),
      };
    }

    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error deleting user"),
    };
  }
};
