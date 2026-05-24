"use client";

import Link from "next/link";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { Motor } from "@/app/store/MotorStore";

function calculateDaysLeft(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - now.getTime();
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return daysLeft;
}

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  expiringMotors: Motor[];
};

export default function ExpiringModal({
  isOpen,
  onOpenChange,
  expiringMotors,
}: Props) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">Peringatan STNK</h3>
          <p className="text-sm text-default-500">
            Beberapa motor akan segera kadaluarsa dalam 7 hari.
          </p>
        </ModalHeader>

        <ModalBody className="flex flex-col gap-2">
          {expiringMotors.map((m) => {
            const daysLeft = calculateDaysLeft(m.tanggal_berakhir_pajak);
            return (
              <div key={m.id} className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">
                    {m.jenis_motor.kode} - {m.jenis_motor.merk}
                  </div>
                  <div className="text-sm text-default-500">
                    No. Polisi: {m.no_polisi}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{daysLeft} hari</div>
                  <div className="text-sm text-default-500">
                    {m.tanggal_berakhir_pajak
                      ? new Date(m.tanggal_berakhir_pajak).toLocaleDateString(
                          "id-ID",
                        )
                      : "-"}
                  </div>
                </div>
              </div>
            );
          })}
        </ModalBody>

        <ModalFooter className="w-full flex justify-end gap-2">
          <Button color="danger" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Link href="/dashboard/data-stok" className="no-underline">
            <Button color="primary">Lihat Data</Button>
          </Link>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
