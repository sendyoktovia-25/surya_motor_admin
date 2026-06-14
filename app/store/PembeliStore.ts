import { supabase } from "@/lib/supabase-client";

export type Pembeli = {
  id: string;
  nama: string;
  alamat: string;
  no_hp: string;
  no_ktp: string;
  foto_ktp: string | null;
};

export const usePembeliStore = () => {
  const get = async (): Promise<{ data: Pembeli[] | null; error: any }> => {
    const client = supabase().from("pembeli");
    return await client.select("*");
  };

  const create = async (payload: any) => {
    const client = supabase().from("pembeli");
    const storage = supabase().storage.from("images");
    const fotoKtpFile = payload.foto_ktp;
    const fileName = new Date().toISOString();

    await storage.upload(fileName, fotoKtpFile);

    const { data: imageData } = storage.getPublicUrl(fileName);

    return await client
      .insert({
        nama: payload.nama,
        alamat: payload.alamat,
        no_hp: payload.no_hp,
        no_ktp: payload.no_ktp,
        foto_ktp: imageData?.publicUrl,
      })
      .select()
      .single();
  };

  const update = async (payload: any) => {
    const client = supabase().from("pembeli");
    const storage = supabase().storage.from("images");

    const updateData: any = {
      nama: payload.nama,
      alamat: payload.alamat,
      no_hp: payload.no_hp,
      no_ktp: payload.no_ktp,
    };

    if (payload.foto_ktp instanceof File) {
      const fileName = new Date().toISOString();
      await storage.upload(fileName, payload.foto_ktp);
      const { data: imageData } = storage.getPublicUrl(fileName);
      updateData.foto_ktp = imageData?.publicUrl;
    } else if (payload.foto_ktp) {
      updateData.foto_ktp = payload.foto_ktp;
    }

    return await client.update(updateData).eq("id", payload.id);
  };

  const destroy = async ({ id }: { id: string }) => {
    const client = supabase().from("pembeli");
    return await client.delete().eq("id", id);
  };

  return { get, create, update, destroy };
};
