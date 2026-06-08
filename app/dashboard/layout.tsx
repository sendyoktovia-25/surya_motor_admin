"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  type ElementType,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button, Listbox, ListboxItem, Skeleton } from "@heroui/react";
import { supabase } from "@/lib/supabase-client";
import {
  Home02,
  ShoppingCart02,
  Settings02,
  Calculator,
  File02,
  BarChart02,
  Users03,
} from "@untitledui/icons";

type NavRole = "all" | "admin" | "pemilik";

const ALL_NAV_ITEMS: {
  href: string;
  label: string;
  icon: ElementType;
  role: NavRole;
}[] = [
  {
    href: "/dashboard/halaman-utama",
    label: "Halaman Utama",
    icon: Home02,
    role: "all",
  },
  {
    href: "/dashboard/jenis-motor",
    label: "Jenis Sepeda Motor",
    icon: Settings02,
    role: "all",
  },
  {
    href: "/dashboard/data-stok",
    label: "Data Stok Sepeda Motor",
    icon: ShoppingCart02,
    role: "all",
  },
  {
    href: "/dashboard/kalkulator",
    label: "Kalkulator Kredit",
    icon: Calculator,
    role: "all",
  },
  {
    href: "/dashboard/transaksi",
    label: "Pencatatan Transaksi",
    icon: File02,
    role: "all",
  },
  {
    href: "/dashboard/laporan",
    label: "Laporan Keuangan",
    icon: BarChart02,
    role: "pemilik",
  },
  {
    href: "/dashboard/user",
    label: "Manajemen Pengguna",
    icon: Users03,
    role: "pemilik",
  },
];

function canAccess(itemRole: NavRole, userRole: string): boolean {
  if (itemRole === "all") return true;
  return userRole === itemRole;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const auth = useMemo(() => supabase().auth, []);

  const hideNavbar = pathname === "/dashboard/login";
  const isActive = (path: string) => pathname.startsWith(path);

  const navItems =
    role !== null
      ? ALL_NAV_ITEMS.filter((item) => canAccess(item.role, role))
      : [];

  useEffect(() => {
    const {
      data: { subscription },
    } = auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setEmail(session.user.email ?? null);
        const userRole =
          (session.user.user_metadata?.role as string) || "pemilik";
        setRole(userRole);
      } else {
        setEmail(null);
        setRole(null);
        router.replace("/dashboard/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [auth, router]);

  useEffect(() => {
    if (role !== null) {
      const restricted = ALL_NAV_ITEMS.filter(
        (item) => item.role !== "all",
      ).map((item) => item.href);
      const blocked =
        restricted.some((r) => pathname.startsWith(r)) &&
        !canAccess(
          ALL_NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.role ??
            "all",
          role,
        );
      if (blocked) router.replace("/dashboard/halaman-utama");
    }
  }, [role, pathname, router]);

  const handleLogout = async () => {
    const response = await auth.signOut();
    if (!response.error) {
      router.replace("/dashboard/login");
    }
  };

  return (
    <div className="h-screen flex">
      {!hideNavbar && (
        <div className="flex flex-col border-r border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h1 className="text-2xl font-bold">Surya Jaya Motor</h1>
            {email !== null ? (
              <p className="text-sm mt-1">{email}</p>
            ) : (
              <Skeleton className="rounded mt-2 h-4 w-40" />
            )}
          </div>

          {role === null ? (
            <div className="flex-1 p-4 flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="rounded h-10 w-full" />
              ))}
            </div>
          ) : (
            <Listbox className="flex-1 p-4" selectionMode="none">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <ListboxItem
                    key={item.href}
                    onPress={() => router.push(item.href)}
                    className={`p-2 py-3 ${isActive(item.href) ? "text-primary" : ""}`}
                    startContent={<Icon className="w-5 h-5" />}>
                    {item.label}
                  </ListboxItem>
                );
              })}
            </Listbox>
          )}

          <div className="p-4 border-t border-slate-200">
            <Button
              fullWidth
              color="danger"
              onPress={handleLogout}
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
