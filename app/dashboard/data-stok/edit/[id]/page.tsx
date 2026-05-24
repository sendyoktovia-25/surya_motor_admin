"use client";

import { use, useEffect, useState } from "react";
import { Motor, useMotorStore } from "@/app/store/MotorStore";
import { addToast, Spinner } from "@heroui/react";
import { MotorForm } from "../../component/MotorForm";

export default function EditMotorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [motor, setMotor] = useState<Motor | null>(null);
  const { getById } = useMotorStore();

  useEffect(() => {
    const fetchMotor = async () => {
      const { data, error } = await getById({ id });
      if (error) {
        addToast({ color: "danger", title: "Gagal memuat data motor" });
      } else {
        setMotor(data);
      }
    };

    fetchMotor();
  }, [id]);

  return motor === null ? (
    <div className="h-full w-full flex items-center justify-center">
      <Spinner />
    </div>
  ) : (
    <MotorForm defaultValue={motor} />
  );
}
