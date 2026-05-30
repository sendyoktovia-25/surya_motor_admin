"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, DotsVertical } from "@untitledui/icons";
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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
  Chip,
  addToast,
} from "@heroui/react";
import { User, getUserList, deleteUser } from "@/app/store/UserStore";
import { UserForm } from "./components/UserForm";

const columns = [
  { name: "Email", uid: "email" },
  { name: "Role", uid: "role" },
  { name: "Aksi", uid: "actions" },
];

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<User | null>(null);

  const {
    isOpen: isUserFormOpen,
    onOpen: onUserFormOpen,
    onOpenChange: onUserFormOpenChange,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await getUserList();
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to load users", err);
      addToast({
        title: "Error",
        description: "Gagal memuat data pengguna",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedItem) return;

      await deleteUser({ id: selectedItem.id });

      addToast({
        title: "Berhasil",
        description: "Pengguna berhasil dihapus",
        color: "success",
      });

      onDeleteOpenChange();
      loadData();
    } catch (err) {
      console.error("Failed to delete user", err);
      addToast({
        title: "Error",
        description: "Gagal menghapus pengguna",
        color: "danger",
      });
    }
  };

  const renderCell = useCallback((user: User, columnKey: string) => {
    switch (columnKey) {
      case "email":
        return <span className="font-medium">{user.email}</span>;
      case "role":
        return (
          <Chip
            size="sm"
            color={user.role === "pemilik" ? "primary" : "default"}
            variant="flat">
            {user.role === "pemilik" ? "Pemilik" : "Admin"}
          </Chip>
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
                key="edit"
                onClick={() => {
                  setSelectedItem(user);
                  onUserFormOpen();
                }}>
                Edit
              </DropdownItem>
              <DropdownItem
                key="delete"
                color="danger"
                onClick={() => {
                  setSelectedItem(user);
                  onDeleteOpen();
                }}>
                Hapus
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return "";
    }
  }, [onUserFormOpen, onDeleteOpen]);

  return (
    <section className="pb-6 flex flex-col gap-4">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner color="primary" />
        </div>
      ) : (
        <Table
          isCompact
          removeWrapper
          topContent={
            <div className="flex justify-between">
              <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
              <Button
                color="primary"
                variant="solid"
                size="md"
                onPress={onUserFormOpen}
                startContent={<Plus />}
                className="mt-2 w-fit">
                Tambah Pengguna
              </Button>
            </div>
          }
          topContentPlacement="outside">
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.uid}>{column.name}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={users} emptyContent="Tidak ada pengguna">
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey as string)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <UserForm
        user={selectedItem}
        isOpen={isUserFormOpen}
        onOpenChange={() => {
          setSelectedItem(null);
          onUserFormOpenChange();
        }}
        onSuccess={() => {
          loadData();
          setSelectedItem(null);
        }}
      />

      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Hapus Pengguna
              </ModalHeader>
              <ModalBody>
                <p>
                  Apakah Anda yakin ingin menghapus pengguna{" "}
                  <span className="font-semibold">{selectedItem?.email}</span>?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="danger" onPress={handleDelete}>
                  Hapus
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
}
