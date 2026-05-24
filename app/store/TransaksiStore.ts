import { supabase } from "@/lib/supabase-client";
import { Pembeli } from "./PembeliStore";
import { Motor } from "./MotorStore";

export type Transaksi = {
  id: string;
  pembeli_id: string;
  motor_id: string;
  tanggal_jual: string;
  harga_jual: number;
  laba: number;
  pembeli: Pembeli;
  motor: Motor;
};

export type TransaksiFilters = {
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type TransaksiSort = {
  column: string;
  ascending: boolean;
};

export const useTransaksiStore = () => {
  const get = async (
    page: number = 1,
    limit: number = 20,
    filters?: TransaksiFilters,
    sortBy?: TransaksiSort,
  ): Promise<{ data: Transaksi[] | null; total: number; error: any }> => {
    let query = supabase()
      .from("transaksi")
      .select("*, pembeli(*), motor(*, jenis_motor(*))", { count: "exact" });

    console.log("Filters applied:", filters?.dateFrom);

    if (filters?.dateFrom) {
      query = query.gte("tanggal_jual", filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte("tanggal_jual", filters.dateTo);
    }

    // Apply sorting (default by tanggal_jual descending)
    if (sortBy) {
      query = query.order(sortBy.column, { ascending: sortBy.ascending });
    } else {
      query = query.order("tanggal_jual", { ascending: false });
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    return { data, total: count ?? 0, error };
  };

  const getById = async (id: string) => {
    const client = supabase().from("transaksi");
    return await client
      .select("*, pembeli(*), motor(*, jenis_motor(*))")
      .eq("id", id)
      .single();
  };

  const create = async (payload: any) => {
    const client = supabase().from("transaksi");
    return await client.insert([payload]);
  };

  const update = async (payload: any) => {
    const client = supabase().from("transaksi");
    return await client.update(payload).eq("id", payload.id);
  };

  const destroy = async ({ id }: { id: string }) => {
    const client = supabase().from("transaksi");
    return await client.delete().eq("id", id);
  };

  return { get, getById, create, update, destroy };
};
