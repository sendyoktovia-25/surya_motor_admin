"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, DotsVertical, Plus, SearchSm } from "@untitledui/icons";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  addToast,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
  Accordion,
  AccordionItem,
  Pagination,
  Select,
  SelectItem,
} from "@heroui/react";
import { Transaksi, useTransaksiStore } from "@/app/store/TransaksiStore";
import { useMotorStore } from "@/app/store/MotorStore";

type FilterPeriod = "1month" | "3month" | "6month" | "1year" | "all";

const periodOptions: { key: FilterPeriod; label: string }[] = [
  { key: "1month", label: "1 Bulan Terakhir" },
  { key: "3month", label: "3 Bulan Terakhir" },
  { key: "6month", label: "6 Bulan Terakhir" },
  { key: "1year", label: "1 Tahun Terakhir" },
  { key: "all", label: "Semua Data" },
];

function getDateRange(period: FilterPeriod): [Date | null, Date | null] {
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
      return [null, null];
  }
  return [startDate, endDate];
}

export const columns = [
  { name: "No.", uid: "no", sortable: false },
  { name: "No. Polisi", uid: "motor" },
  { name: "Nama Pembeli", uid: "pembeli" },
  { name: "Tanggal Jual", uid: "tanggal_jual", sortable: true },
  { name: "Harga Jual", uid: "harga_jual", sortable: true },
  { name: "Laba", uid: "laba", sortable: true },
  { name: "Aksi", uid: "actions" },
];

export default function TransaksiContent({ page }: { page: number }) {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaksi[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("1month");
  const [selectedItem, setSelectedItem] = useState<Transaksi | null>(null);

  const itemsPerPage = 20;

  const { update: updateMotor } = useMotorStore();
  const { get, destroy } = useTransaksiStore();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();

  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onOpenChange: onDetailOpenChange,
  } = useDisclosure();

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const renderCell = useCallback(
    (transaction: Transaksi, columnKey: string, rowIndex?: number) => {
      switch (columnKey) {
        case "no":
          return <span className="text-sm text-default-500">{rowIndex}</span>;
        case "motor":
          return (
            <div className="font-medium">{transaction.motor?.no_polisi}</div>
          );
        case "pembeli":
          return <div className="font-medium">{transaction.pembeli?.nama}</div>;
        case "tanggal_jual":
          return transaction.tanggal_jual;
        case "harga_jual":
          return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(transaction.harga_jual ?? 0);
        case "laba":
          return (
            <span
              className={
                transaction.laba >= 0
                  ? "text-green-600 font-medium"
                  : "text-red-600 font-medium"
              }>
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(transaction.laba ?? 0)}
            </span>
          );
        case "actions":
          return (
            <Dropdown className="bg-background border-1 border-default-200">
              <DropdownTrigger>
                <Button isIconOnly radius="full" size="sm" variant="light">
                  <DotsVertical className="text-default-400" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  key="detail"
                  onClick={() => {
                    setSelectedItem(transaction);
                    onDetailOpen();
                  }}>
                  Detail
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  as={Link}
                  href={`/dashboard/transaksi/${transaction.id}/edit`}>
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  onClick={() => {
                    setSelectedItem(transaction);
                    onDeleteOpen();
                  }}>
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          );
        default:
          return "";
      }
    },
    [onDetailOpen, onDeleteOpen],
  );

  const onSearchChange = useCallback((value: string) => {
    if (value) {
      setFilterValue(value);
    } else {
      setFilterValue("");
    }
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            classNames={{
              base: "w-full sm:max-w-[44%]",
            }}
            placeholder="Kata kunci pencarian (No. Polisi, Nama Pembeli)"
            startContent={<SearchSm className="text-default-400" />}
            value={filterValue}
            onClear={() => setFilterValue("")}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3 items-center">
            <Select
              size="sm"
              label="Periode"
              className="min-w-[180px]"
              selectedKeys={new Set([filterPeriod])}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as FilterPeriod;
                if (selected) setFilterPeriod(selected);
              }}>
              {periodOptions.map((opt) => (
                <SelectItem key={opt.key}>{opt.label}</SelectItem>
              ))}
            </Select>
            <Button
              color="primary"
              startContent={<Plus />}
              as={Link}
              href="/dashboard/transaksi/create">
              Catat Penjualan
            </Button>
          </div>
        </div>
      </div>
    );
  }, [filterValue, filterPeriod, onSearchChange]);

  const fetchTransactions = async () => {
    setLoading(true);
    const [startDate, endDate] = getDateRange(filterPeriod);
    const { data, total, error } = await get(page, itemsPerPage, {
      dateFrom: startDate?.toISOString().split("T")[0] ?? undefined,
      dateTo: endDate?.toISOString().split("T")[0] ?? undefined,
    });

    if (error) {
      addToast({
        color: "danger",
        title: "Gagal memuat transaksi",
      });
      setTransactions([]);
      setTotalCount(0);
    } else {
      let filteredData = data || [];

      // Apply search filter client-side
      if (filterValue) {
        const searchTerm = filterValue.toLowerCase();
        filteredData = filteredData.filter(
          (transaction) =>
            transaction.motor.no_polisi.toLowerCase().includes(searchTerm) ||
            transaction.pembeli.nama.toLowerCase().includes(searchTerm),
        );
      }

      setTransactions(filteredData);
      setTotalCount(total);
    }
    setLoading(false);
  };

  const handleDelete = async (
    transaction: Transaksi,
  ): Promise<{ message: string; error: any | null }> => {
    const { error } = await destroy({ id: transaction.id });
    if (error) {
      return { message: "Gagal menghapus transaksi", error };
    }

    await updateMotor({
      id: transaction.motor_id,
      status: "tersedia",
    });

    return { message: "Transaksi berhasil dihapus", error: null };
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, filterValue, filterPeriod]);

  useEffect(() => {
    // Reset to first page when filters change
    const params = new URLSearchParams();
    params.set("page", "1");
    router.push(`/dashboard/transaksi?${params.toString()}`);
  }, [filterValue, filterPeriod, router]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Pencatatan Transaksi Penjualan</h1>
      </div>

      <Table
        isCompact
        removeWrapper
        topContent={topContent}
        topContentPlacement="inside">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={
            "Belum ada transaksi. Klik 'Catat Penjualan' untuk menambah."
          }
          items={transactions.map((item, idx) => ({
            ...item,
            __index: (page - 1) * itemsPerPage + idx + 1,
          }))}
          isLoading={loading}
          loadingContent={<Spinner />}>
          {(item: any) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  {renderCell(item, columnKey as string, item.__index)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={totalPages || 1}
          onChange={(newPage) => {
            const params = new URLSearchParams();
            params.set("page", newPage.toString());
            router.push(`/dashboard/transaksi?${params.toString()}`);
          }}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onOpenChange={onDetailOpenChange}
        size="lg"
        scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="pb-0 flex flex-col">
                Detail Transaksi
              </ModalHeader>
              <ModalBody>
                <Accordion
                  defaultExpandedKeys={["transaksi"]}
                  selectionMode="multiple"
                  className="p-0">
                  <AccordionItem key="transaksi" title="Ringkasan Transaksi">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          No. Polisi
                        </span>
                        <span className="font-medium">
                          {selectedItem?.motor?.no_polisi}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          Nama Pembeli
                        </span>
                        <span className="font-medium">
                          {selectedItem?.pembeli?.nama}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          Tanggal Jual
                        </span>
                        <span>{selectedItem?.tanggal_jual}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          Harga Jual
                        </span>
                        <span className="font-medium">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(selectedItem?.harga_jual ?? 0)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">Laba</span>
                        <span
                          className={
                            (selectedItem?.laba ?? 0) >= 0
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }>
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(selectedItem?.laba ?? 0)}
                        </span>
                      </div>
                    </div>
                  </AccordionItem>

                  <AccordionItem key="info_pembeli" title="Info Pembeli">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">Nama</span>
                        <span className="font-medium">
                          {selectedItem?.pembeli?.nama}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">Alamat</span>
                        <span className="font-medium">
                          {selectedItem?.pembeli?.alamat}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">No HP</span>
                        <span>{selectedItem?.pembeli?.no_hp}</span>
                      </div>
                      <div className="flex flex-col col-span-1 md:col-span-2">
                        <span className="text-sm text-slate-600 mb-2">
                          Foto KTP
                        </span>
                        <img
                          src={selectedItem?.pembeli?.foto_ktp ?? ""}
                          alt="Foto KTP"
                          className="max-w-sm h-auto border rounded"
                        />
                      </div>
                    </div>
                  </AccordionItem>

                  <AccordionItem key="info" title="Info Motor">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          No. Polisi
                        </span>
                        <span>{selectedItem?.motor?.no_polisi}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          Jenis Motor
                        </span>
                        <span>
                          {selectedItem?.motor?.jenis_motor.kode} -{" "}
                          {selectedItem?.motor?.jenis_motor.merk}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          Tanggal Masuk
                        </span>
                        <span>{selectedItem?.motor?.tanggal_masuk}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          Tanggal Berakhir Pajak
                        </span>
                        <span>
                          {selectedItem?.motor?.tanggal_berakhir_pajak}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">STNK</span>
                        <span>{selectedItem?.motor?.stnk}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">BPKP</span>
                        <span>{selectedItem?.motor?.bpkp}</span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          No. Rangka
                        </span>
                        <span>{selectedItem?.motor?.no_rangka}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          No. Mesin
                        </span>
                        <span>{selectedItem?.motor?.no_mesin}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          Harga Modal
                        </span>
                        <span>
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(selectedItem?.motor?.harga_modal ?? 0)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          Biaya Servis
                        </span>
                        <span>
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(selectedItem?.motor?.biaya_servis ?? 0)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">Warna</span>
                        <div className="flex items-center gap-2">
                          <span className="capitalize">
                            {selectedItem?.motor?.warna}
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionItem>
                </Accordion>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  OK
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Hapus Transaksi
              </ModalHeader>
              <ModalBody>
                <p>
                  Apakah Anda yakin ingin menghapus transaksi untuk{" "}
                  <strong>{selectedItem?.motor?.no_polisi}</strong>?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="danger"
                  onPress={async () => {
                    const { message, error } = await handleDelete(
                      selectedItem!,
                    );

                    if (error) {
                      addToast({
                        color: "danger",
                        title: error?.message || "Terjadi kesalahan",
                      });
                    } else {
                      onClose();
                      fetchTransactions();
                      addToast({
                        color: "success",
                        title: message,
                      });
                    }
                  }}>
                  Hapus
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
