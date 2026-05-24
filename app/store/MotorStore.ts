import { supabase } from "@/lib/supabase-client";
import { JenisMotor } from "./JenisMotorStore";

export type Motor = {
  id: string;
  tanggal_masuk: string;
  warna: string;
  stnk: string;
  bpkp: string;
  tanggal_berakhir_pajak: string;
  no_polisi: string;
  jenis_motor: JenisMotor;
  jenis_motor_id: string;
  no_rangka: string;
  no_mesin: string;
  harga_modal: number;
  biaya_servis: number;
  status: "tersedia" | "negosiasi" | "terjual";
  durasi_pemakaian: number;
  tahun_produksi: number;
  jarak_tempuh_km: number;
  kondisi_mesin: string;
  tanggal_terakhir_ganti_oli: string;
  calon_no_hp?: string;
};

export type MotorFilters = {
  status?: "tersedia" | "negosiasi" | "terjual";
  searchTerm?: string;
};

export type MotorSort = {
  column: string;
  ascending: boolean;
};

export const useMotorStore = () => {
  const getAll = async (): Promise<{ data: Motor[] | null; error: any }> => {
    const client = supabase().from("motor");
    return await client.select("*, jenis_motor(*)").order("status", {
      ascending: true,
    });
  };

  const get = async (
    page: number = 1,
    limit: number = 20,
    filters?: MotorFilters,
    sortBy?: MotorSort,
  ): Promise<{ data: Motor[] | null; error: any }> => {
    let query = supabase().from("motor").select("*, jenis_motor(*)");

    // Apply filters
    if (filters?.status) {
      query = query.eq("status", filters.status);
    } else {
      // Default: exclude sold motors
      query = query.neq("status", "terjual");
    }

    // Apply search filter
    if (filters?.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      query = query.or(
        `no_polisi.ilike.%${term}%,stnk.ilike.%${term}%,bpkp.ilike.%${term}%`,
      );
    }

    // Apply sorting
    if (sortBy) {
      query = query.order(sortBy.column, { ascending: sortBy.ascending });
    } else {
      query = query.order("status", { ascending: true });
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    return await query;
  };

  const getById = async ({
    id,
  }: {
    id: string;
  }): Promise<{ data: Motor | null; error: any }> => {
    const client = supabase().from("motor");
    return await client.select("*, jenis_motor(*)").eq("id", id).single();
  };

  const create = async (payload: any) => {
    const client = supabase().from("motor");
    return await client.insert([payload]);
  };

  const update = async (payload: any) => {
    const client = supabase().from("motor");
    return await client.update({ ...payload }).eq("id", payload.id);
  };

  const destroy = async ({ id }: { id: string }) => {
    const client = supabase().from("motor");
    return await client.delete().eq("id", id);
  };

  return { get, getAll, getById, create, update, destroy };
};
