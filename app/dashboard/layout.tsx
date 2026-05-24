"use client";

import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { Button, Link, Listbox, ListboxItem } from "@heroui/react";
import { supabase } from "@/lib/supabase-client";
import { nav } from "framer-motion/client";
import {
  Home02,
  ShoppingCart02,
  Settings02,
  Calculator,
  File02,
  BarChart02,
  User02,
  Users03,
} from "@untitledui/icons";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<any | null>(null);
  const auth = supabase().auth;

  const isActive = (path: string) => pathname === path;
  const hideNavbar = pathname === "/dashboard/login";

  const navItems = [
    {
      href: "/dashboard/halaman-utama",
      label: "Halaman Utama",
      icon: Home02,
    },
    {
      href: "/dashboard/jenis-motor",
      label: "Jenis Motor",
      icon: Settings02,
    },
    {
      href: "/dashboard/data-stok",
      label: "Data Stok Motor",
      icon: ShoppingCart02,
    },
    {
      href: "/dashboard/kalkulator",
      label: "Kalkulator Kredit",
      icon: Calculator,
    },
    {
      href: "/dashboard/transaksi",
      label: "Pencatatan Transaksi",
      icon: File02,
    },
    {
      href: "/dashboard/laporan",
      label: "Laporan Keuangan",
      icon: BarChart02,
    },
    {
      href: "/dashboard/user",
      label: "Manajemen Pengguna",
      icon: Users03,
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await auth.getUser();
      if (user) {
        setUser(user);
      } else {
        router.replace("/dashboard/login");
      }
    };

    fetchUser();
  }, [auth, router]);

  const handleLogout = async () => {
    const response = await auth.signOut();
    if (!response.error) {
      router.replace("/dashboard/login");
    }
  };

  return (
    <div className="h-screen flex">
      {!hideNavbar && (
        <div className=" flex flex-col border-r border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h1 className="text-2xl font-bold">Surya Jaya Motor</h1>
            <p className="text-sm mt-1">{user?.email ?? "-"}</p>
          </div>

          <Listbox className="flex-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <ListboxItem
                  key={item.href}
                  href={item.href}
                  className={`p-2 py-3 ${isActive(item.href) ? "text-primary" : ""}`}
                  startContent={<Icon className="w-5 h-5" />}>
                  {item.label}
                </ListboxItem>
              );
            })}
          </Listbox>

          {/* Logout Button */}
          <div className="p-4 border-t border-slate-200 space-y-2">
            <Button
              fullWidth
              color="danger"
              onClick={handleLogout}
              className="font-semibold">
              Keluar
            </Button>
          </div>
        </div>
      )}

      <main className="flex-1 p-6 overflow-auto h-screen">
        <div className="max-w-7xl mx-auto h-full">{children}</div>
      </main>
    </div>
  );
}
