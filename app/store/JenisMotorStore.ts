import { supabase } from "@/lib/supabase-client";

export type JenisMotor = {
  id: string;
  kode?: string | null;
  merk: string;
};

export const useJenisMotorStore = () => {
  const get = async (): Promise<{ data: JenisMotor[] | null; error: any }> => {
    const client = supabase().from("jenis_motor");
    return await client.select("*");
  };

  const create = async ({ kode, merk }: { kode: string; merk: string }) => {
    const client = supabase().from("jenis_motor");
    return await client.insert([{ kode, merk }]);
  };

  const update = async ({
    id,
    kode,
    merk,
  }: {
    id: string;
    kode: string;
    merk: string;
  }) => {
    const client = supabase().from("jenis_motor");
    return await client.update({ kode, merk }).eq("id", id);
  };

  const destroy = async ({ id }: { id: string }) => {
    const client = supabase().from("jenis_motor");
    return await client.delete().eq("id", id);
  };

  return { get, create, update, destroy };
};
