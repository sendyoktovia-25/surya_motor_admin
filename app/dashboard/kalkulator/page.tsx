"use client";

import { useState, useMemo, useEffect } from "react";
import Papa from "papaparse";
import {
  Card,
  CardBody,
  CardHeader,
  Select,
  SelectItem,
  Button,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@heroui/react";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID").format(Math.round(value));
}

export default function Kalkulator() {
  const hargaJualAwal = 10000000;
  const [tabelAngsuran, setTabelAngsuran] = useState<Record<
    number,
    Record<number, number>
  > | null>(null);
  const [loadingTabel, setLoadingTabel] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoadingTabel(true);
      try {
        const res = await fetch("/tabel_angsuran.csv");
        if (!res.ok) throw new Error("Failed to fetch CSV");
        const txt = await res.text();

        const parsed = Papa.parse(txt, {
          header: true,
          skipEmptyLines: true,
          transform: (value: string) =>
            value.replace(/\./g, "").replace(/,/g, ""),
        });

        const rows = parsed.data as Record<string, string>[];
        if (!rows || rows.length === 0) {
          setTabelAngsuran({});
          return;
        }

        const map: Record<number, Record<number, number>> = {};
        for (const row of rows) {
          const pinjaman = Number(row["Pinjaman"]);
          map[pinjaman] = {};
          for (const key of Object.keys(row)) {
            if (key === "Pinjaman") continue;
            const tenor = Number(key);
            const val = Number(row[key]);
            map[pinjaman][tenor] = val;
          }
        }

        setTabelAngsuran(map);
      } catch (err) {
        console.error("Failed to load tabel angsuran", err);
        setTabelAngsuran({});
      } finally {
        setLoadingTabel(false);
      }
    };
    load();
  }, []);
  const [hargaJual, setHargaJual] = useState<number>(hargaJualAwal);
  const [dpNominal, setDpNominal] = useState<number>(1000000);
  const [angsuranPerBulan, setAngsuranPerBulan] = useState<
    Record<number, number | null>
  >({ 6: null, 9: null, 12: null, 15: null, 18: null, 21: null, 24: null });
  const [calculated, setCalculated] = useState<boolean>(false);

  const pencairan = useMemo(
    () => hargaJual - dpNominal,
    [hargaJual, dpNominal],
  );

  const minDP = Math.max(1000000, hargaJual - 25000000);
  const maxDP = Math.min(45000000, hargaJual - 5000000);

  const getAngsuranFromTable = (
    amount: number,
    tenorMonths: number,
  ): number => {
    if (!tabelAngsuran) return 0;
    const pinjamans = Object.keys(tabelAngsuran)
      .map(Number)
      .sort((a, b) => a - b);
    if (pinjamans.length === 0) return 0;
    if (amount <= pinjamans[0])
      return tabelAngsuran[pinjamans[0]][tenorMonths] ?? 0;
    if (amount >= pinjamans[pinjamans.length - 1])
      return tabelAngsuran[pinjamans[pinjamans.length - 1]][tenorMonths] ?? 0;
    for (let i = 0; i < pinjamans.length - 1; i++) {
      const lower = pinjamans[i];
      const upper = pinjamans[i + 1];
      if (amount >= lower && amount <= upper) {
        const lowerVal = tabelAngsuran[lower][tenorMonths] ?? 0;
        const upperVal = tabelAngsuran[upper][tenorMonths] ?? 0;
        const ratio = (amount - lower) / (upper - lower);
        return Math.round(lowerVal + (upperVal - lowerVal) * ratio);
      }
    }
    return 0;
  };

  const handleHitung = () => {
    const newMap: Record<number, number> = {
      6: 0,
      9: 0,
      12: 0,
      15: 0,
      18: 0,
      21: 0,
      24: 0,
    };
    [6, 9, 12, 15, 18, 21, 24].forEach((t) => {
      newMap[t] = getAngsuranFromTable(pencairan, t);
    });
    setAngsuranPerBulan(newMap);
    setCalculated(true);
  };

  return (
    <section className="pb-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Kalkulator Kredit</h1>
        <p className="text-default-500">
          Hitung cicilan bulanan untuk kredit motor
        </p>
      </div>

      {/* Input Section */}
      <Card shadow="none" className="border border-slate-200 w-full">
        <CardHeader className="flex gap-3 p-4">
          <div className="flex flex-col">
            <p className="text-lg font-semibold">Simulasi Kredit</p>
            <p className="text-small text-default-500">
              Masukkan harga dan DP untuk melihat besaran cicilan
            </p>
          </div>
        </CardHeader>
        <Divider />

        <CardBody className="gap-4 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Harga Jual */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-default-700">
                Harga Jual (Rp)
              </label>
              <Select
                selectedKeys={[String(hargaJual)]}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setHargaJual(value);
                  setCalculated(false);
                  setAngsuranPerBulan({
                    6: null,
                    9: null,
                    12: null,
                    15: null,
                    18: null,
                    21: null,
                    24: null,
                  });
                }}
                classNames={{
                  popoverContent: "w-full",
                }}>
                {Array.from({ length: 45 }, (_, i) => (i + 6) * 1000000).map(
                  (value) => (
                    <SelectItem key={value}>{formatRupiah(value)}</SelectItem>
                  ),
                )}
              </Select>
            </div>

            {/* DP (Uang Muka) */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-default-700">
                DP - Uang Muka (Rp)
              </label>
              <Select
                selectedKeys={[String(dpNominal)]}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setDpNominal(value);
                  setCalculated(false);
                  setAngsuranPerBulan({
                    6: null,
                    9: null,
                    12: null,
                    15: null,
                    18: null,
                    21: null,
                    24: null,
                  });
                }}
                classNames={{
                  popoverContent: "w-full",
                }}>
                {Array.from({ length: 45 }, (_, i) => (i + 1) * 1000000)
                  .filter((v) => v >= minDP && v <= maxDP)
                  .map((value) => (
                    <SelectItem key={value}>{formatRupiah(value)}</SelectItem>
                  ))}
              </Select>
            </div>

            {/* Pencairan */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-default-700">
                Pencairan (Rp)
              </label>
              <div className="bg-default-100 rounded-lg px-3 py-2 flex items-center h-10">
                <span className="text-sm font-semibold text-default-900">
                  {formatRupiah(pencairan)}
                </span>
              </div>
            </div>
          </div>

          <Button
            color="primary"
            onClick={() => handleHitung()}
            isDisabled={loadingTabel}
            isLoading={loadingTabel}
            size="lg"
            className="w-full md:w-auto md:self-end">
            {loadingTabel ? "Memuat tabel…" : "Hitung"}
          </Button>
        </CardBody>
      </Card>

      {/* Results Section */}
      <Card shadow="none" className="border border-slate-200 w-full">
        <CardHeader className="flex gap-3 p-4">
          <div className="flex flex-col">
            <p className="text-lg font-semibold">Tabel Angsuran Kredit</p>
            <p className="text-small text-default-500">
              Cicilan bulanan berdasarkan tenor yang dipilih
            </p>
          </div>
        </CardHeader>
        <Divider />

        <CardBody className="p-4">
          {loadingTabel ? (
            <div className="flex justify-center items-center py-8">
              <Spinner color="primary" label="Memuat data..." />
            </div>
          ) : !calculated ? (
            <div className="text-center py-8 text-default-500">
              <p>Klik tombol "Hitung" untuk melihat besaran cicilan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table aria-label="Tabel angsuran kredit">
                <TableHeader>
                  {[6, 9, 12, 15, 18, 21, 24].map((tenor) => (
                    <TableColumn key={tenor} align="center">
                      <span className="font-semibold">{tenor}x</span>
                    </TableColumn>
                  ))}
                </TableHeader>
                <TableBody>
                  <TableRow>
                    {[6, 9, 12, 15, 18, 21, 24].map((tenor) => {
                      const monthlyPayment = angsuranPerBulan[tenor] ?? null;
                      return (
                        <TableCell key={tenor} align="center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs text-default-500">
                              Per bulan
                            </span>
                            <span className="font-bold text-sm">
                              Rp{" "}
                              {monthlyPayment !== null
                                ? formatRupiah(monthlyPayment)
                                : ""}
                            </span>
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>
    </section>
  );
}
