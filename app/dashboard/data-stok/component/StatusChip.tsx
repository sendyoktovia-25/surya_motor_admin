import { Chip } from "@heroui/react";

export const StatusChip = ({ status }: { status: string }) => {
  const color: Record<string, { color: "success" | "warning" }> = {
    tersedia: { color: "success" },
    negosiasi: { color: "warning" },
  };

  return (
    <Chip
      className="capitalize border-none"
      color={color[status].color}
      variant="dot">
      {status}
    </Chip>
  );
};
