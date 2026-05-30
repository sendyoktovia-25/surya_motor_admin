"use client";

import { useState } from "react";
import {
  Input,
  Button,
  Select,
  SelectItem,
  addToast,
  Form,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { User, UserRole, createUser, updateUser } from "@/app/store/UserStore";

const ROLE_OPTIONS: { key: UserRole; label: string }[] = [
  { key: "admin", label: "Admin" },
  { key: "pemilik", label: "Pemilik" },
];

export const UserForm = ({
  user,
  isOpen,
  onOpenChange,
  onSuccess,
}: {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) => {
  const editMode = user !== null;
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (editMode) {
      const { error } = await updateUser({
        id: user!.id,
        role: data.role as UserRole,
      });

      if (error) {
        return { error, message: undefined };
      }
      return { message: "Pengguna berhasil diperbaharui", error: null };
    } else {
      const { error } = await createUser({
        email: data.email as string,
        password: data.password as string,
        role: data.role as UserRole,
      });

      if (error) {
        return { error, message: undefined };
      }
      return { message: "Pengguna berhasil dibuat", error: null };
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
      }}>
      <ModalContent>
        {(onClose) => (
          <Form
            onSubmit={async (e) => {
              setIsLoading(true);

              const { message, error } = await handleSubmit(e);

              if (error) {
                addToast({
                  color: "danger",
                  title: "Gagal",
                  description: error.message,
                });
              } else {
                addToast({
                  color: "success",
                  title: "Berhasil",
                  description: message,
                });
                onSuccess();
                onOpenChange(false);
              }

              setIsLoading(false);
            }}>
            <>
              <ModalHeader className="flex flex-col gap-1">
                {editMode ? "Edit Pengguna" : "Tambah Pengguna Baru"}
              </ModalHeader>
              <ModalBody className="w-full">
                <Input
                  readOnly={editMode}
                  isRequired
                  label="Email"
                  placeholder="Masukkan email"
                  type="email"
                  name="email"
                  defaultValue={user?.email}
                />

                {!editMode && (
                  <Input
                    isRequired
                    label="Password"
                    placeholder="Masukkan password"
                    type="password"
                    name="password"
                  />
                )}

                <Select
                  isRequired
                  label="Role"
                  name="role"
                  defaultSelectedKeys={[user?.role ?? "admin"]}
                  items={ROLE_OPTIONS}>
                  {(item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  )}
                </Select>
              </ModalBody>
              <ModalFooter className="w-full">
                <Button
                  color="default"
                  variant="light"
                  onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary" type="submit" isLoading={isLoading}>
                  {editMode ? "Perbarui" : "Buat Pengguna"}
                </Button>
              </ModalFooter>
            </>
          </Form>
        )}
      </ModalContent>
    </Modal>
  );
};
