import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Button,
  Divider,
  Form,
  addToast,
  NumberInput,
} from "@heroui/react";
import { JenisMotor, useJenisMotorStore } from "@/app/store/JenisMotorStore";
import { Motor, useMotorStore } from "@/app/store/MotorStore";
import { StatusChip } from "./StatusChip";

export const MotorForm = ({ defaultValue }: { defaultValue: Motor | null }) => {
  const router = useRouter();
  const [jenisOptions, setJenisOptions] = useState<JenisMotor[]>([]);
  const [tahunOptions, setTahunOptions] = useState<{ key: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(
    defaultValue ? defaultValue.status : "tersedia",
  );
  const { get } = useJenisMotorStore();
  const { create, update } = useMotorStore();
  const title = defaultValue ? "Edit Motor" : "Tambah Motor";
  const description = defaultValue
    ? "Perbarui informasi kendaraan"
    : "Tambahkan kendaraan baru ke stok motor";

  useEffect(() => {
    const fetchJenisMotor = async () => {
      const { data, error } = await get();
      if (error) {
        addToast({ color: "danger", title: "Gagal memuat jenis motor" });
      } else {
        setJenisOptions(data as JenisMotor[]);
      }
    };

    const yearsOptions = Array.from(
      { length: new Date().getFullYear() - 2000 + 1 },
      (_, i) => new Date().getFullYear() - i,
    ).map((year) => ({ key: year }));

    setTahunOptions(yearsOptions);
    fetchJenisMotor();
  }, [defaultValue?.tahun_produksi]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (defaultValue) {
      const { error } = await update({ id: defaultValue.id, ...data });
      if (error) {
        addToast({ color: "danger", title: error.message });
      } else {
        addToast({ color: "success", title: "Berhasil memperbarui motor" });
        router.push("/dashboard/data-stok");
      }
    } else {
      const { error } = await create({ ...data });

      if (error) {
        addToast({ color: "danger", title: error.message });
      } else {
        addToast({ color: "success", title: "Berhasil menambahkan motor" });
        router.push("/dashboard/data-stok");
      }
    }
  };

  return (
    <section className="pb-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-default-500">{description}</p>
      </div>

      <Form onSubmit={handleSubmit} className="gap-6">
        {/* Data Motor Section */}
        <Card shadow="none" className="border border-slate-200 w-full">
          <CardHeader className="flex gap-3 p-4 justify-between">
            <div className="flex flex-col">
              <p className="text-lg font-semibold">Data Motor</p>
              <p className="text-small text-default-500">
                Informasi utama kendaraan
              </p>
            </div>
            <Select
              name="status"
              defaultSelectedKeys={[
                defaultValue ? defaultValue.status : "tersedia",
              ]}
              className="w-48"
              onSelectionChange={(keys) => {
                const status = Array.from(keys)[0] as string;
                setSelectedStatus(status);
              }}
              items={[
                { key: "tersedia", color: "success" },
                { key: "negosiasi", color: "warning" },
              ]}
              label="Status Motor"
              renderValue={(items) => {
                return items.map((status) => {
                  return (
                    <StatusChip
                      key={status.key}
                      status={status.data?.key ?? ""}
                    />
                  );
                });
              }}>
              {(status) => (
                <SelectItem key={status.key}>
                  <StatusChip status={status.key} />
                </SelectItem>
              )}
            </Select>
          </CardHeader>
          <Divider />

          <CardBody className="gap-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                defaultValue={defaultValue?.no_polisi || ""}
                label="No. Polisi"
                placeholder="Masukkan nomor polisi"
                name="no_polisi"
                isRequired
              />

              <Select
                defaultSelectedKeys={[defaultValue?.jenis_motor_id || ""]}
                label="Jenis Motor"
                name="jenis_motor_id"
                placeholder="Pilih jenis motor"
                items={jenisOptions}
                isRequired
                renderValue={(options) => {
                  return options.map((option) => {
                    return (
                      <div key={option.key}>
                        {option.data?.kode} - {option.data?.merk}
                      </div>
                    );
                  });
                }}>
                {(jenis) => (
                  <SelectItem key={jenis.id}>
                    {jenis.kode} - {jenis.merk}
                  </SelectItem>
                )}
              </Select>

              <Input
                defaultValue={defaultValue?.tanggal_masuk || ""}
                label="Tanggal Masuk"
                type="date"
                name="tanggal_masuk"
                isRequired
              />

              <Select
                defaultSelectedKeys={
                  defaultValue?.tahun_produksi
                    ? [String(defaultValue.tahun_produksi)]
                    : []
                }
                label="Tahun Produksi"
                name="tahun_produksi"
                placeholder="Contoh: 2026"
                items={tahunOptions}
                renderValue={(items) => {
                  return items.map((item) => {
                    return <p key={item.key}>{item.key}</p>;
                  });
                }}
                isRequired>
                {(year) => <SelectItem key={year.key}>{year.key}</SelectItem>}
              </Select>

              <Input
                label="Warna"
                defaultValue={defaultValue?.warna || ""}
                placeholder="Masukkan warna motor"
                name="warna"
                isRequired
              />

              <Input
                label="STNK"
                defaultValue={defaultValue?.stnk || ""}
                placeholder="Masukkan status STNK"
                name="stnk"
                isRequired
              />

              <Input
                label="BPKP"
                defaultValue={defaultValue?.bpkp || ""}
                placeholder="Masukkan status BPKP"
                name="bpkp"
                isRequired
              />

              <Input
                label="Tanggal Berakhir Pajak"
                defaultValue={defaultValue?.tanggal_berakhir_pajak || ""}
                type="date"
                name="tanggal_berakhir_pajak"
                isRequired
              />

              <Input
                label="No. Rangka"
                defaultValue={defaultValue?.no_rangka || ""}
                placeholder="Masukkan nomor rangka"
                name="no_rangka"
                isRequired
              />

              <Input
                label="No. Mesin"
                defaultValue={defaultValue?.no_mesin || ""}
                placeholder="Masukkan nomor mesin"
                name="no_mesin"
                isRequired
              />

              <NumberInput
                defaultValue={defaultValue?.harga_modal}
                classNames={{
                  inputWrapper: "shadow-none",
                }}
                hideStepper
                label="Harga Modal"
                type="number"
                placeholder="Masukkan harga modal"
                name="harga_modal"
                isRequired
                formatOptions={{
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }}
              />

              <NumberInput
                defaultValue={defaultValue?.biaya_servis}
                classNames={{
                  inputWrapper: "shadow-none",
                }}
                hideStepper
                label="Biaya Servis"
                type="number"
                placeholder="Masukkan biaya servis"
                name="biaya_servis"
                isRequired
                formatOptions={{
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }}
              />

              {selectedStatus === "negosiasi" && (
                <Input
                  isRequired
                  defaultValue={defaultValue?.calon_no_hp || ""}
                  label="No Hp Calon Pembeli"
                  placeholder="Masukkan nomor hp calon pembeli"
                  name="calon_no_hp"
                />
              )}
            </div>
          </CardBody>
        </Card>

        {/* Histori Motor Section */}
        <Card shadow="none" className="border border-slate-200 w-full">
          <CardHeader className="p-4">
            <div className="flex flex-col">
              <p className="text-lg font-semibold">Histori Motor</p>
              <p className="text-small text-default-500">
                Riwayat dan kondisi kendaraan
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberInput
                defaultValue={defaultValue?.durasi_pemakaian}
                classNames={{
                  inputWrapper: "shadow-none",
                }}
                label="Durasi Pemakaian (bulan)"
                type="number"
                placeholder="Masukkan durasi pemakaian"
                name="durasi_pemakaian"
                isRequired
              />

              <NumberInput
                defaultValue={defaultValue?.jarak_tempuh_km}
                classNames={{
                  inputWrapper: "shadow-none",
                }}
                hideStepper
                label="Jarak Tempuh (km)"
                type="number"
                placeholder="Masukkan jarak tempuh"
                name="jarak_tempuh_km"
                isRequired
              />

              <Input
                label="Kondisi Mesin"
                placeholder="Masukkan kondisi mesin"
                name="kondisi_mesin"
                defaultValue={defaultValue?.kondisi_mesin || ""}
                isRequired
              />

              <Input
                label="Tanggal Terakhir Ganti Oli"
                type="date"
                name="tanggal_terakhir_ganti_oli"
                defaultValue={defaultValue?.tanggal_terakhir_ganti_oli || ""}
                isRequired
              />
            </div>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 w-full">
          <Button onClick={() => router.push("/dashboard/data-stok")}>
            Batal
          </Button>
          <Button color="primary" type="submit" isLoading={isLoading}>
            Simpan Motor
          </Button>
        </div>
      </Form>
    </section>
  );
};
