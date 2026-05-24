"use client";

import { use, useEffect, useState } from "react";
import { TransaksiForm } from "../../components/TransaksiForm";
import { Transaksi, useTransaksiStore } from "@/app/store/TransaksiStore";
import { addToast, Spinner } from "@heroui/react";

export default function EditTransaksi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [transaksi, setTransaksi] = useState<Transaksi | null>(null);
  const { getById } = useTransaksiStore();

  useEffect(() => {
    const fetchTransaksi = async () => {
      const { data, error } = await getById(id);
      if (error) {
        addToast({ color: "danger", title: "Gagal memuat data motor" });
      } else {
        setTransaksi(data);
      }
    };

    fetchTransaksi();
  }, [id]);

  return transaksi === null ? (
    <div className="h-full w-full flex items-center justify-center">
      <Spinner />
    </div>
  ) : (
    <TransaksiForm transaksi={transaksi} />
  );
}
