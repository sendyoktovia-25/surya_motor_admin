"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
} from "@heroui/react";
import ExpiringModal from "./ExpiringModal";
import { Motor, useMotorStore } from "@/app/store/MotorStore";
import { Transaksi, useTransaksiStore } from "@/app/store/TransaksiStore";

function calculateDaysLeft(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - now.getTime();
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return daysLeft;
}

function getDaysLeftColor(daysLeft: number | null) {
  if (daysLeft === null) return "default";
  if (daysLeft <= 7) return "danger";
  if (daysLeft <= 30) return "warning";
  return "success";
}

const statusColorMap = {
  tersedia: "success",
  negosiasi: "warning",
  terjual: "danger",
} as const;

const statusLabelMap = {
  tersedia: "Tersedia",
  negosiasi: "Negosiasi",
  terjual: "Terjual",
} as const;

export default function HalamanUtama() {
  const { getAll: getMotors } = useMotorStore();
  const { get: getTransaksi } = useTransaksiStore();
  const [motors, setMotors] = useState<Motor[]>([]);
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpiringOpen, setIsExpiringOpen] = useState(false);
  const [expiringMotors, setExpiringMotors] = useState<Motor[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data: motorData, error: motorError } = await getMotors();
        const { data: transaksiData, error: transaksiError } =
          await getTransaksi();

        if (motorError) throw motorError;
        if (transaksiError) throw transaksiError;

        setMotors(motorData || []);
        setTransaksi(transaksiData || []);
      } catch (err) {
        console.error("Failed to load data", err);
        setMotors([]);
        setTransaksi([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const soon = motors.filter((motor) => {
      if (!motor.tanggal_berakhir_pajak) return false;
      if (motor.status === "terjual") return false;
      const daysLeft = calculateDaysLeft(motor.tanggal_berakhir_pajak);
      return daysLeft !== null && daysLeft <= 7;
    });

    setExpiringMotors(soon);
    setIsExpiringOpen(soon.length > 0);
  }, [motors]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalMotor = motors.length;
    const tersedia = motors.filter((m) => m.status === "tersedia").length;
    const negosiasi = motors.filter((m) => m.status === "negosiasi").length;
    const terjual = motors.filter((m) => m.status === "terjual").length;
    const totalPendapatan = transaksi.reduce((sum, t) => sum + t.harga_jual, 0);

    return { totalMotor, tersedia, negosiasi, terjual, totalPendapatan };
  }, [motors, transaksi]);

  const recentMotors = useMemo(() => {
    const now = new Date();
    const threeMonthsLater = new Date(
      now.getFullYear(),
      now.getMonth() + 3,
      now.getDate(),
    );

    return motors
      .filter((motor) => motor.status !== "terjual")
      .filter((motor) => {
        if (!motor.tanggal_berakhir_pajak) return false;
        const expiryDate = new Date(motor.tanggal_berakhir_pajak);
        return expiryDate >= now && expiryDate <= threeMonthsLater;
      })
      .sort((a, b) => {
        const dateA = new Date(a.tanggal_berakhir_pajak!).getTime();
        const dateB = new Date(b.tanggal_berakhir_pajak!).getTime();
        return dateA - dateB;
      })
      .slice(0, 5);
  }, [motors]);

  return (
    <section className="pb-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-default-500">
          Ringkasan data motor dan transaksi penjualan
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner color="primary" />
        </div>
      ) : (
        <>
          <ExpiringModal
            isOpen={isExpiringOpen}
            onOpenChange={setIsExpiringOpen}
            expiringMotors={expiringMotors}
          />
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card shadow="none" className="border border-slate-200">
              <CardBody className="gap-2">
                <p className="text-sm text-default-500">Total Motor</p>
                <p className="text-3xl font-bold">{metrics.totalMotor}</p>
              </CardBody>
            </Card>

            <Card shadow="none" className="border border-slate-200">
              <CardBody className="gap-2">
                <p className="text-sm text-default-500">Tersedia</p>
                <p className="text-3xl font-bold text-success">
                  {metrics.tersedia}
                </p>
              </CardBody>
            </Card>

            <Card shadow="none" className="border border-slate-200">
              <CardBody className="gap-2">
                <p className="text-sm text-default-500">Negosiasi</p>
                <p className="text-3xl font-bold text-warning">
                  {metrics.negosiasi}
                </p>
              </CardBody>
            </Card>

            <Card shadow="none" className="border border-slate-200">
              <CardBody className="gap-2">
                <p className="text-sm text-default-500">Terjual</p>
                <p className="text-3xl font-bold text-danger">
                  {metrics.terjual}
                </p>
              </CardBody>
            </Card>
          </div>
          <Card
            shadow="none"
            className="border border-slate-200 p-4 flex flex-col gap-4">
            <CardHeader className="flex justify-between items-center gap-3 p-0">
              <div className="flex flex-col">
                <p className="text-lg font-semibold">STNK</p>
                <p className="text-small text-default-500">
                  Daftar motor yang membutuhkan perpanjangan STNK dalam 3 bulan
                  ke depan
                </p>
              </div>
            </CardHeader>
            <Table aria-label="Tabel motor terbaru" removeWrapper>
              <TableHeader>
                <TableColumn>Jenis Motor</TableColumn>
                <TableColumn>No. Polisi</TableColumn>
                <TableColumn>Warna</TableColumn>
                <TableColumn>STNK</TableColumn>
                <TableColumn>Tanggal Berakhir Pajak</TableColumn>
                <TableColumn align="center">Hari Tersisa</TableColumn>
              </TableHeader>
              <TableBody
                emptyContent={
                  motors.length === 0 ? "Tidak ada data motor" : undefined
                }>
                {recentMotors.map((motor) => {
                  const daysLeft = calculateDaysLeft(
                    motor.tanggal_berakhir_pajak,
                  );
                  return (
                    <TableRow key={motor.id}>
                      <TableCell className="font-semibold">
                        {motor.jenis_motor.kode} - {motor.jenis_motor.merk}
                      </TableCell>
                      <TableCell>{motor.no_polisi}</TableCell>
                      <TableCell className="capitalize">
                        {motor.warna}
                      </TableCell>
                      <TableCell align="right" className="font-semibold">
                        {motor.stnk}
                      </TableCell>
                      <TableCell>
                        {motor.tanggal_berakhir_pajak
                          ? new Date(
                              motor.tanggal_berakhir_pajak,
                            ).toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "-"}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          color={getDaysLeftColor(daysLeft)}
                          variant="flat"
                          size="sm">
                          {daysLeft !== null ? `${daysLeft} hari` : "-"}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </section>
  );
}
