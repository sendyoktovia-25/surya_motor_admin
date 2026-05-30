"use client";

import { useEffect, useState } from "react";
import { Plus, DotsVertical } from "@untitledui/icons";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  addToast,
  Form,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { JenisMotor, useJenisMotorStore } from "@/app/store/JenisMotorStore";

export default function JenisMotorPage() {
  const [items, setItems] = useState<JenisMotor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMotor, setSelectedMotor] = useState<JenisMotor | null>(null);

  const { get, create, update, destroy } = useJenisMotorStore();

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onOpenChange: onAddOpenChange,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();

  const fetchItems = async () => {
    setIsLoading(true);
    const { data, error } = await get();
    if (error) {
      addToast({ color: "danger", title: "Gagal memuat data jenis motor" });
    } else {
      setItems(data ?? []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreateOrUpdate = async (
    selectedMotor: JenisMotor,
    e: any,
  ): Promise<{ message: string; error: any | null }> => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.currentTarget));

    if (selectedMotor) {
      console.log("updating motor:", { id: selectedMotor.id, ...data });
      const { error } = await update({
        id: selectedMotor.id,
        ...(data as any),
      });
      return { message: "Berhasil memperbarui jenis motor", error };
    } else {
      const { error } = await create({ ...(data as any) });
      return { message: "Berhasil menambahkan jenis motor", error };
    }
  };

  const handleDelete = async (
    selectedMotor: JenisMotor,
  ): Promise<{
    message: string;
    error: any | null;
  }> => {
    const { error } = await destroy({ id: selectedMotor!.id });
    return { message: "Berhasil menghapus jenis motor", error };
  };

  return (
    <div>
      <Table
        isCompact
        removeWrapper
        topContent={
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Jenis Sepeda Motor</h1>
            <Button color="primary" onClick={onAddOpen} className="self-end">
              <Plus className="w-4 h-4" />
              <p>Tambah</p>
            </Button>
          </div>
        }>
        <TableHeader>
          <TableColumn>Kode</TableColumn>
          <TableColumn>Jenis Sepeda Motor</TableColumn>
          <TableColumn align="center">Aksi</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={<p>Belum ada jenis motor</p>}
          loadingContent={<Spinner />}
          isLoading={isLoading}>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <span className="font-medium">{item.kode ?? "-"}</span>
              </TableCell>
              <TableCell>{item.merk}</TableCell>
              <TableCell>
                <Dropdown className="bg-background border-1 border-default-200">
                  <DropdownTrigger>
                    <Button isIconOnly radius="full" size="sm" variant="light">
                      <DotsVertical className="text-default-400" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    <DropdownItem
                      key="edit"
                      onClick={() => {
                        setSelectedMotor(item);
                        onAddOpen();
                      }}>
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      color="danger"
                      onClick={() => {
                        setSelectedMotor(item);
                        onDeleteOpen();
                      }}>
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onOpenChange={onAddOpenChange}
        onClose={() => {
          setSelectedMotor(null);
        }}>
        <ModalContent>
          {(onClose) => (
            <Form
              className="w-full"
              onSubmit={async (e) => {
                const { message, error } = await handleCreateOrUpdate(
                  selectedMotor!,
                  e,
                );

                if (error) {
                  addToast({
                    color: "danger",
                    title: error?.message || "Terjadi kesalahan",
                  });
                } else {
                  addToast({
                    color: "success",
                    title: message,
                  });
                  onClose();
                  fetchItems();
                }
              }}>
              <ModalHeader className="flex flex-col gap-1">
                {selectedMotor ? "Edit Jenis Sepeda Motor" : "Tambah Jenis Sepeda Motor"}
              </ModalHeader>
              <ModalBody className="flex flex-col gap-4 w-full">
                <Input
                  isRequired
                  defaultValue={selectedMotor?.kode || ""}
                  name="kode"
                  label="Kode"
                  placeholder="Masukkan kode"
                />
                <Input
                  isRequired
                  defaultValue={selectedMotor?.merk || ""}
                  name="merk"
                  label="Jenis Sepeda Motor"
                  placeholder="Masukkan jenis sepeda motor"
                />
              </ModalBody>
              <ModalFooter className="w-full">
                <Button color="default" onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary" type="submit">
                  {selectedMotor ? "Simpan" : "Tambah"}
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Hapus Jenis Sepeda Motor
              </ModalHeader>
              <ModalBody>
                <p>
                  Apakah Anda yakin ingin menghapus{" "}
                  <strong>{selectedMotor?.merk}</strong>?
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
                      selectedMotor!,
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
