"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  SortDescriptor,
  Spinner,
  Accordion,
  AccordionItem,
  Pagination,
} from "@heroui/react";
import { Motor, useMotorStore } from "@/app/store/MotorStore";
import { StatusChip } from "./component/StatusChip";

export const columns = [
  { name: "No.", uid: "no", sortable: false },
  { name: "No. Polisi", uid: "no_polisi", sortable: true },
  { name: "Jenis Motor", uid: "kode", sortable: true },
  { name: "Tahun Produksi", uid: "tahun_produksi", sortable: true },
  { name: "Warna", uid: "warna", sortable: true },
  { name: "STNK", uid: "stnk", sortable: true },
  { name: "BPKP", uid: "bpkp", sortable: true },
  { name: "Status", uid: "status", sortable: true },
  { name: "Aksi", uid: "actions" },
];

export const statusOptions = [
  { name: "Tersedia", uid: "tersedia" },
  { name: "Negosiasi", uid: "negosiasi" },
];

export default function DataStokContent({ page }: { page: number }) {
  const router = useRouter();

  const [items, setItems] = useState<Motor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Motor | null>(null);

  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<string>>(
    new Set(["tersedia", "negosiasi"]),
  );
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "status",
    direction: "ascending",
  });

  const ITEMS_PER_PAGE = 20;

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();

  const {
    isOpen: isHistoriOpen,
    onOpen: onHistoriOpen,
    onOpenChange: onHistoriOpenChange,
  } = useDisclosure();

  const { get, destroy } = useMotorStore();

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filteredMotors = [...items];

    if (hasSearchFilter) {
      filteredMotors = filteredMotors.filter(
        (motor) =>
          motor.no_polisi.toLowerCase().includes(filterValue.toLowerCase()) ||
          motor.jenis_motor?.merk
            ?.toLowerCase()
            .includes(filterValue.toLowerCase()) ||
          motor.jenis_motor?.kode
            ?.toLowerCase()
            .includes(filterValue.toLowerCase()),
      );
    }

    if (statusFilter.size > 0 && statusFilter.size !== statusOptions.length) {
      filteredMotors = filteredMotors.filter((motor) =>
        statusFilter.has(motor.status),
      );
    }

    return filteredMotors;
  }, [items, filterValue, statusFilter]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let first, second;

      // Handle nested properties (e.g., "kode" maps to jenis_motor.kode)
      if (sortDescriptor.column === "kode") {
        first = a.jenis_motor?.kode?.toLowerCase() || "";
        second = b.jenis_motor?.kode?.toLowerCase() || "";
      } else {
        first = (a as any)[sortDescriptor.column];
        second = (b as any)[sortDescriptor.column];
      }

      if (first === null || first === undefined) first = "";
      if (second === null || second === undefined) second = "";

      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedItems.slice(start, end);
  }, [sortedItems, page, ITEMS_PER_PAGE]);

  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);

  const renderCell = useCallback(
    (motor: Motor, columnKey: string, rowIndex?: number) => {
      switch (columnKey) {
        case "no":
          return <span className="text-sm text-default-500">{rowIndex}</span>;
        case "no_polisi":
          return <span className="font-medium">{motor.no_polisi ?? "-"}</span>;
        case "kode":
          return (
            <div className="flex gap-2">
              <p>
                {motor.jenis_motor?.kode} - {motor.jenis_motor?.merk}
              </p>
            </div>
          );
        case "tahun_produksi":
          return motor.tahun_produksi ?? "-";
        case "warna":
          return <span className="capitalize">{motor.warna}</span>;
        case "stnk":
          return motor.stnk ?? "-";
        case "bpkp":
          return motor.bpkp ?? "-";
        case "status":
          return <StatusChip status={motor.status} />;
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
                    setSelectedItem(motor);
                    onHistoriOpen();
                  }}>
                  Detail
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  as={Link}
                  href={`/dashboard/data-stok/edit/${motor.id}`}>
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  onClick={() => {
                    setSelectedItem(motor);
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
    [],
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
            placeholder="Kata kunci pencarian (No. polisi, Jenis Motor, Kode)"
            startContent={<SearchSm className="text-default-400" />}
            value={filterValue}
            onClear={() => setFilterValue("")}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  endContent={<ChevronDown className="text-small" />}
                  variant="flat">
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter as any}>
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {status.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              color="primary"
              startContent={<Plus />}
              as={Link}
              href="/dashboard/data-stok/tambah">
              Tambah Motor
            </Button>
          </div>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    onSearchChange,
    items.length,
    hasSearchFilter,
  ]);

  const fetchItems = async () => {
    setLoading(true);

    const status =
      statusFilter.size === 1 ? Array.from(statusFilter)[0] : undefined;

    const { data, error } = await get(page, ITEMS_PER_PAGE, {
      status: status as any,
    });

    if (error) {
      addToast({
        color: "danger",
        title: "Gagal memuat data motor",
      });
    } else {
      setItems(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [page, filterValue, statusFilter]);

  useEffect(() => {
    // Reset to first page when filters change
    const params = new URLSearchParams();
    params.set("page", "1");
    router.push(`/dashboard/data-stok?${params.toString()}`);
  }, [filterValue, statusFilter, router]);

  const handleDelete = async (
    motor: Motor,
  ): Promise<{ message: string; error: any | null }> => {
    const { error } = await destroy({ id: motor.id });

    if (error) {
      return { message: "Gagal menghapus motor", error };
    } else {
      return { message: "Berhasil menghapus motor", error: null };
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Data Stok Motor</h1>
      </div>

      <Table
        isCompact
        removeWrapper
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="inside"
        onSortChange={setSortDescriptor}>
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
          emptyContent={"Data motor kosong"}
          items={paginatedItems.map((item, idx) => ({
            ...item,
            __index: (page - 1) * ITEMS_PER_PAGE + idx + 1,
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
            router.push(`/dashboard/data-stok?${params.toString()}`);
          }}
        />
      </div>

      {/* Histori Modal */}
      <Modal
        size="lg"
        scrollBehavior="inside"
        isOpen={isHistoriOpen}
        onOpenChange={onHistoriOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="pb-0 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Detail Motor</h2>
                <StatusChip status={selectedItem?.status ?? ""} />
              </ModalHeader>
              <ModalBody>
                <Accordion
                  defaultExpandedKeys={["history"]}
                  selectionMode="multiple"
                  className="p-0">
                  <AccordionItem key="history" title="Histori Motor">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          Tahun Produksi
                        </span>
                        <span>{selectedItem?.tahun_produksi ?? "-"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          Jarak Tempuh
                        </span>
                        <span>{selectedItem?.jarak_tempuh_km ?? "-"} km</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          Lama Pemakaian
                        </span>
                        <span>
                          {selectedItem?.durasi_pemakaian ?? "-"} bulan
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          Tanggal Terakhir Ganti Oli
                        </span>
                        <span>{selectedItem?.tanggal_terakhir_ganti_oli}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          Kondisi Mesin
                        </span>
                        <span>{selectedItem?.kondisi_mesin ?? "-"}</span>
                      </div>
                    </div>
                  </AccordionItem>

                  <AccordionItem key="info" title="Info Motor">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          No. Polisi
                        </span>
                        <span>{selectedItem?.no_polisi}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          Jenis Motor
                        </span>
                        <span>
                          {selectedItem?.jenis_motor.kode} -{" "}
                          {selectedItem?.jenis_motor.merk}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          Tanggal Masuk
                        </span>
                        <span>{selectedItem?.tanggal_masuk}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          Tanggal Berakhir Pajak
                        </span>
                        <span>{selectedItem?.tanggal_berakhir_pajak}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">STNK</span>
                        <span>{selectedItem?.stnk}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">BPKP</span>
                        <span>{selectedItem?.bpkp}</span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          No. Rangka
                        </span>
                        <span>{selectedItem?.no_rangka}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          No. Mesin
                        </span>
                        <span>{selectedItem?.no_mesin}</span>
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
                          }).format(selectedItem?.harga_modal ?? 0)}
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
                          }).format(selectedItem?.biaya_servis ?? 0)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">Warna</span>
                        <span className="capitalize">
                          {selectedItem?.warna}
                        </span>
                      </div>
                    </div>
                  </AccordionItem>
                </Accordion>
              </ModalBody>
              <ModalFooter>
                {selectedItem?.calon_no_hp && (
                  <Button
                    color="success"
                    onPress={() => {
                      const raw = selectedItem.calon_no_hp || "";
                      const digits = raw.replace(/\D/g, "");
                      const normalized = digits.startsWith("0")
                        ? "62" + digits.slice(1)
                        : digits;
                      window.open(`https://wa.me/${normalized}`, "_blank");
                    }}>
                    WhatsApp
                  </Button>
                )}
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
                Hapus Motor
              </ModalHeader>
              <ModalBody>
                <p>
                  Apakah Anda yakin ingin menghapus{" "}
                  <strong>{selectedItem?.no_polisi}</strong>?
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
                      fetchItems();
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
