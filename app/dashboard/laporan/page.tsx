"use client";

import { useEffect, useState, useMemo } from "react";
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
  Chip,
} from "@heroui/react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Transaksi, useTransaksiStore } from "@/app/store/TransaksiStore";
import {
  generatePdfWithHeader,
  downloadPdf,
  openPdfInNewTab,
} from "@/utils/pdf-generator";

type FilterPeriod = "1month" | "3month" | "6month" | "1year" | "all";

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getDateRange(period: FilterPeriod): [Date, Date] {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case "1month":
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case "3month":
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case "6month":
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    case "1year":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case "all":
      startDate.setFullYear(1900);
      break;
  }

  return [startDate, endDate];
}

export default function Laporan() {
  const { get: getTransaksi } = useTransaksiStore();
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("1month");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await getTransaksi();
        if (error) throw error;
        setTransaksi(data || []);
      } catch (err) {
        console.error("Failed to load transaksi", err);
        setTransaksi([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data based on period
  const filteredTransaksi = useMemo(() => {
    const [startDate, endDate] = getDateRange(filterPeriod);
    return transaksi.filter((t) => {
      const transDate = new Date(t.tanggal_jual);
      return transDate >= startDate && transDate <= endDate;
    });
  }, [transaksi, filterPeriod]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalPendapatan = filteredTransaksi.reduce(
      (sum, t) => sum + t.harga_jual,
      0,
    );
    const totalLaba = filteredTransaksi.reduce((sum, t) => sum + t.laba, 0);
    const totalTransaksi = filteredTransaksi.length;
    const rataRataHargaJual =
      totalTransaksi > 0 ? totalPendapatan / totalTransaksi : 0;
    const rataRataLaba = totalTransaksi > 0 ? totalLaba / totalTransaksi : 0;

    return {
      totalPendapatan,
      totalLaba,
      totalTransaksi,
      rataRataHargaJual,
      rataRataLaba,
    };
  }, [filteredTransaksi]);

  // Calculate monthly data for chart
  const monthlyData = useMemo(() => {
    const monthMap: Record<
      string,
      { revenue: number; profit: number; count: number }
    > = {};

    filteredTransaksi.forEach((t) => {
      const date = new Date(t.tanggal_jual);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { revenue: 0, profit: 0, count: 0 };
      }

      monthMap[monthKey].revenue += t.harga_jual;
      monthMap[monthKey].profit += t.laba;
      monthMap[monthKey].count += 1;
    });

    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        ...data,
      }));
  }, [filteredTransaksi]);

  const getDateRangeDisplay = () => {
    if (filterPeriod === "all") {
      return {
        from: "Semua Data",
        to: "",
      };
    }

    const [startDate, endDate] = getDateRange(filterPeriod);
    const formatDate = (date: Date) =>
      date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    return {
      from: formatDate(startDate),
      to: formatDate(endDate),
    };
  };

  const exportToPDF = async () => {
    try {
      const columns = [
        "No",
        "Tanggal Keluar",
        "Jenis Motor",
        "No. Polisi",
        "Total Modal",
        "Harga Jual",
        "Laba",
      ];

      const tableData: string[][] = filteredTransaksi.map((t, i) => [
        String(i + 1),
        String(t.tanggal_jual || ""),
        String(t.motor?.jenis_motor?.kode || ""),
        String(t.motor?.no_polisi || ""),
        formatRupiah(t.motor?.harga_modal + t.motor?.biaya_servis),
        formatRupiah(t.harga_jual || 0),
        formatRupiah(t.laba || 0),
      ]);

      // Load logo image
      let logoImageUrl: string | undefined;
      try {
        const response = await fetch("/sjm_logo.png");
        const blob = await response.blob();
        logoImageUrl = URL.createObjectURL(blob);
      } catch (err) {
        console.warn("Could not load logo image:", err);
      }

      const dateRange = getDateRangeDisplay();
      const doc = await generatePdfWithHeader(
        {
          subtitle: "Ringkasan Penjualan dan Keuntungan",
          dateRange: {
            from: filterPeriod === "all" ? "Semua Data" : dateRange.from,
            to: filterPeriod === "all" ? "" : dateRange.to,
          },
          logoImageUrl,
        },
        tableData,
        columns,
      );

      // Open PDF in new tab (falls back to download if popup blocked)
      openPdfInNewTab(
        doc,
        `laporan-keuangan-${new Date().toISOString().split("T")[0]}.pdf`,
      );

      // Clean up blob URL
      if (logoImageUrl) {
        URL.revokeObjectURL(logoImageUrl);
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Gagal mengunduh PDF. Silakan coba lagi.");
    }
  };

  return (
    <section className="pb-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Laporan Keuangan</h1>
        <p className="text-default-500">
          Ringkasan penjualan dan keuntungan motor
        </p>
      </div>

      {/* Filter Section */}
      <Card shadow="none" className="border border-slate-200">
        <CardBody className="p-4">
          <div className="flex gap-2 items-end">
            <Select
              label="Periode"
              selectedKeys={[filterPeriod]}
              onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
              className="max-w-xs">
              <SelectItem key="1month">1 Bulan Terakhir</SelectItem>
              <SelectItem key="3month">3 Bulan Terakhir</SelectItem>
              <SelectItem key="6month">6 Bulan Terakhir</SelectItem>
              <SelectItem key="1year">1 Tahun Terakhir</SelectItem>
              <SelectItem key="all">Semua Data</SelectItem>
            </Select>
            <Button color="primary" onClick={exportToPDF}>
              Export PDF
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Metrics Cards */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner color="primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card shadow="none" className="border border-slate-200">
              <CardBody className="gap-2">
                <p className="text-sm text-default-500">Total Pendapatan</p>
                <p className="text-2xl font-bold">
                  {formatRupiah(metrics.totalPendapatan)}
                </p>
              </CardBody>
            </Card>

            <Card shadow="none" className="border border-slate-200">
              <CardBody className="gap-2">
                <p className="text-sm text-default-500">Total Laba</p>
                <p
                  className={`text-2xl font-bold ${
                    metrics.totalLaba >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                  {formatRupiah(metrics.totalLaba)}
                </p>
              </CardBody>
            </Card>

            <Card shadow="none" className="border border-slate-200">
              <CardBody className="gap-2">
                <p className="text-sm text-default-500">Total Transaksi</p>
                <p className="text-2xl font-bold">{metrics.totalTransaksi}</p>
              </CardBody>
            </Card>
          </div>

          {/* Monthly Summary Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue and Profit Line Chart */}
            <Card shadow="none" className="border border-slate-200">
              <CardHeader className="flex gap-3 p-4">
                <div className="flex flex-col">
                  <p className="text-lg font-semibold">
                    Tren Pendapatan & Laba
                  </p>
                  <p className="text-small text-default-500">
                    Performa bulanan
                  </p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="gap-4 p-4">
                {monthlyData.length === 0 ? (
                  <div className="text-center py-8 text-default-500">
                    Tidak ada data untuk periode ini
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) =>
                          new Date(`${value}-01`).toLocaleDateString("id-ID", {
                            month: "short",
                            year: "2-digit",
                          })
                        }
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) =>
                          `Rp ${(value / 1000000).toFixed(0)}jt`
                        }
                      />
                      <Tooltip
                        formatter={(value) => [formatRupiah(value as number)]}
                        labelFormatter={(label) =>
                          new Date(`${label}-01`).toLocaleDateString("id-ID", {
                            month: "long",
                            year: "numeric",
                          })
                        }
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Pendapatan"
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: "#10b981", r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Laba"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardBody>
            </Card>

            {/* Transaction Count Bar Chart */}
            <Card shadow="none" className="border border-slate-200">
              <CardHeader className="flex gap-3 p-4">
                <div className="flex flex-col">
                  <p className="text-lg font-semibold">Jumlah Transaksi</p>
                  <p className="text-small text-default-500">
                    Penjualan per bulan
                  </p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="gap-4 p-4">
                {monthlyData.length === 0 ? (
                  <div className="text-center py-8 text-default-500">
                    Tidak ada data untuk periode ini
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) =>
                          new Date(`${value}-01`).toLocaleDateString("id-ID", {
                            month: "short",
                            year: "2-digit",
                          })
                        }
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        labelFormatter={(label) =>
                          new Date(`${label}-01`).toLocaleDateString("id-ID", {
                            month: "long",
                            year: "numeric",
                          })
                        }
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="count"
                        fill="#8b5cf6"
                        name="Jumlah Transaksi"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Summary Table */}
          <Card shadow="none" className="border border-slate-200">
            <CardHeader className="flex gap-3 p-4">
              <div className="flex flex-col">
                <p className="text-lg font-semibold">Ringkasan Bulanan</p>
                <p className="text-small text-default-500">
                  Detail performa penjualan per bulan
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="gap-4 p-4">
              {monthlyData.length === 0 ? (
                <div className="text-center py-8 text-default-500">
                  Tidak ada data untuk periode ini
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table aria-label="Ringkasan bulanan">
                    <TableHeader>
                      <TableColumn>Bulan</TableColumn>
                      <TableColumn align="end">Transaksi</TableColumn>
                      <TableColumn align="end">Total Pendapatan</TableColumn>
                      <TableColumn align="end">Total Laba</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {monthlyData.map((row) => (
                        <TableRow key={row.month}>
                          <TableCell>
                            {new Date(`${row.month}-01`).toLocaleDateString(
                              "id-ID",
                              {
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Chip color="primary" variant="flat">
                              {row.count}
                            </Chip>
                          </TableCell>
                          <TableCell align="right" className="font-semibold">
                            {formatRupiah(row.revenue)}
                          </TableCell>
                          <TableCell
                            align="right"
                            className={`font-semibold ${
                              row.profit >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}>
                            {formatRupiah(row.profit)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </section>
  );
}
