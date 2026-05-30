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
  Tabs,
  Tab,
  Image,
} from "@heroui/react";
import { Motor, useMotorStore } from "@/app/store/MotorStore";
import { Pembeli, usePembeliStore } from "@/app/store/PembeliStore";
import { Transaksi, useTransaksiStore } from "@/app/store/TransaksiStore";

const PembeliForm = ({
  transaksi,
  handleImageChange,
  imagePreview,
}: {
  transaksi: Transaksi | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreview: string | null;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Nama Pembeli"
        placeholder="Masukkan nama lengkap"
        name="nama"
        isRequired
        defaultValue={transaksi?.pembeli?.nama || ""}
      />

      <Input
        label="No. HP"
        placeholder="08xxxxxxxxxx"
        type="tel"
        name="no_hp"
        isRequired
        validate={(value) => {
          if (!value) return "Nomor telepon wajib diisi";
          if (!/^[0-9]+$/.test(value)) return "Hanya boleh angka 0–9";
          return true;
        }}
        defaultValue={transaksi?.pembeli?.no_hp || ""}
      />

      <Input
        label="Alamat"
        placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota, Provinsi"
        name="alamat"
        isRequired
        className="md:col-span-2"
        defaultValue={transaksi?.pembeli?.alamat || ""}
      />

      <div className="md:col-span-2 flex flex-col gap-4">
        <Input
          isRequired={transaksi === null}
          label="Foto KTP"
          type="file"
          accept="image/*"
          name="foto_ktp"
          placeholder="Pilih foto KTP"
          onChange={handleImageChange}
        />
        {imagePreview && (
          <Image
            src={imagePreview}
            height={150}
            alt="Preview KTP"
            className="max-w-full h-auto rounded"
          />
        )}
      </div>
    </div>
  );
};

export const TransaksiForm = ({
  transaksi,
}: {
  transaksi: Transaksi | null;
}) => {
  const editMode = transaksi !== null;
  const title = editMode ? "Edit Transaksi" : "Catat Penjualan Baru";
  const description = editMode
    ? "Perbarui informasi transaksi penjualan motor"
    : "Tambahkan catatan transaksi penjualan motor baru";

  const router = useRouter();
  const [motors, setMotors] = useState<Motor[]>([]);
  const [pembeli, setPembeli] = useState<Pembeli[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hargaJual, setHargaJual] = useState<number>(
    transaksi?.harga_jual || 0,
  );
  const [pembeliMode, setPembeliMode] = useState<"existing" | "new">("new");
  const [selectedMotor, setSelectedMotor] = useState<Motor | null>(
    transaksi?.motor || null,
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    transaksi?.pembeli.foto_ktp || null,
  );
  const { getAll: getMotors, update: updateMotor } = useMotorStore();
  const {
    get: getPembeli,
    create: createPembeli,
    update: updatePembeli,
  } = usePembeliStore();
  const { create: createTransaksi, update: updateTransaksi } =
    useTransaksiStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: motorData } = await getMotors();
        const availableMotors =
          motorData?.filter(
            (motor) =>
              motor.id == transaksi?.motor_id || motor.status !== "terjual",
          ) || [];
        setMotors(availableMotors);

        const { data: pembeliData } = await getPembeli();
        setPembeli(pembeliData || []);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Gagal memuat data";
        addToast({ color: "danger", title: msg });
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const motor = motors.find((m) => m.id === data.motor_id);

    if (!motor) {
      addToast({ color: "danger", title: "Sepeda Motor tidak ditemukan" });
      setIsLoading(false);
      return;
    }

    const laba = hargaJual - motor.harga_modal - motor.biaya_servis;

    if (editMode) {
      // Update pembeli
      const fotoKtpFile = formData.get("foto_ktp") as File | null;
      const pembeliPayload: any = {
        id: transaksi.pembeli_id,
        nama: data.nama,
        alamat: data.alamat,
        no_hp: data.no_hp,
      };

      if (fotoKtpFile && fotoKtpFile.size > 0) {
        pembeliPayload.foto_ktp = fotoKtpFile;
      } else if (imagePreview) {
        pembeliPayload.foto_ktp = imagePreview;
      }

      const { error: pembeliError } = await updatePembeli(pembeliPayload);
      if (pembeliError) {
        addToast({ color: "danger", title: "Gagal memperbarui data pembeli" });
        setIsLoading(false);
        return;
      }

      // Update transaksi
      const { error: transaksiError } = await updateTransaksi({
        id: transaksi.id,
        motor_id: motor.id,
        tanggal_jual: data.tanggal_jual,
        harga_jual: hargaJual,
        laba,
      });

      if (transaksiError) {
        addToast({ color: "danger", title: "Gagal memperbarui transaksi" });
        setIsLoading(false);
        return;
      }

      // Swap motor status if motor changed
      if (motor.id !== transaksi.motor_id) {
        await updateMotor({ id: transaksi.motor_id, status: "tersedia" });
        await updateMotor({ id: motor.id, status: "terjual" });
      }
    } else {
      let pembeliId = data.pembeli_id;

      if (pembeliId === undefined) {
        const { data: pData } = await createPembeli({ ...data });
        pembeliId = (pData as any)?.id;
      }

      const { error: transaksiError } = await createTransaksi({
        pembeli_id: pembeliId,
        motor_id: motor.id,
        tanggal_jual: data.tanggal_jual,
        harga_jual: hargaJual,
        laba,
      });

      if (transaksiError) {
        addToast({ color: "danger", title: "Gagal menyimpan transaksi" });
        setIsLoading(false);
        return;
      }

      await updateMotor({ status: "terjual", id: motor.id });
    }

    addToast({ color: "success", title: "Transaksi berhasil disimpan" });
    router.push("/dashboard/transaksi");
    setIsLoading(false);
  };

  const labaEstimate =
    hargaJual -
    ((selectedMotor?.harga_modal || 0) + (selectedMotor?.biaya_servis || 0));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="pb-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-default-500">{description}</p>
      </div>

      <Form onSubmit={handleSubmit} className="gap-6">
        {/* Data Pembeli Section */}
        <Card shadow="none" className="border border-slate-200 w-full">
          <CardHeader className="flex gap-3 p-4">
            <div className="flex flex-col">
              <p className="text-lg font-semibold">Data Pembeli</p>
              <p className="text-small text-default-500">
                Pilih pembeli dari database atau tambah baru
              </p>
            </div>
          </CardHeader>
          <Divider />

          <CardBody className="gap-4 p-4">
            {editMode ? (
              <PembeliForm
                transaksi={transaksi}
                handleImageChange={handleImageChange}
                imagePreview={imagePreview}
              />
            ) : (
              <Tabs
                selectedKey={pembeliMode}
                onSelectionChange={(key) =>
                  setPembeliMode(key as "existing" | "new")
                }>
                <Tab key="new" title="Pembeli Baru">
                  <PembeliForm
                    transaksi={transaksi}
                    handleImageChange={handleImageChange}
                    imagePreview={imagePreview}
                  />
                </Tab>
                <Tab key="existing" title="Pembeli Lama">
                  <Select
                    label="Pilih Pembeli"
                    placeholder="Cari atau pilih pembeli"
                    name="pembeli_id"
                    className="w-1/2"
                    isRequired
                    items={pembeli}
                    renderValue={(items) => {
                      return items.map((item) => {
                        return (
                          <span
                            key={item.key}
                            className="text-sm font-semibold">
                            {item.data?.nama}
                          </span>
                        );
                      });
                    }}>
                    {(item) => (
                      <SelectItem key={item.id}>
                        <span className="text-sm font-semibold">
                          {item.nama}
                        </span>
                      </SelectItem>
                    )}
                  </Select>
                </Tab>
              </Tabs>
            )}
          </CardBody>
        </Card>

        {/* Data Transaksi Section */}
        <Card shadow="none" className="border border-slate-200 w-full">
          <CardHeader className="flex gap-3 p-4">
            <div className="flex flex-col">
              <p className="text-lg font-semibold">Data Transaksi</p>
              <p className="text-small text-default-500">
                Informasi motor dan harga penjualan
              </p>
            </div>
          </CardHeader>
          <Divider />

          <CardBody className="gap-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Sepeda Motor"
                placeholder="Pilih sepeda motor"
                defaultSelectedKeys={[transaksi?.motor_id ?? ""]}
                name="motor_id"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setSelectedMotor(
                    motors.find((m) => m.id === selected) || null,
                  );
                }}
                isRequired
                items={motors}
                renderValue={(items) => {
                  return items.map((item) => {
                    return (
                      <span key={item.key}>
                        {item.data?.jenis_motor.kode} - {item.data?.no_polisi}
                      </span>
                    );
                  });
                }}>
                {(motor) => (
                  <SelectItem key={motor.id}>
                    {motor.jenis_motor.kode} - {motor.no_polisi}
                  </SelectItem>
                )}
              </Select>

              <Input
                label="Tanggal Jual"
                type="date"
                defaultValue={transaksi?.tanggal_jual || ""}
                name="tanggal_jual"
                isRequired
              />

              <NumberInput
                label="Harga Jual (Rp)"
                hideStepper
                defaultValue={transaksi?.harga_jual}
                name="harga_jual"
                classNames={{
                  inputWrapper: "shadow-none",
                }}
                validate={(value) => {
                  if (value === 0) return "Harga tidak boleh 0";
                  return true;
                }}
                onValueChange={setHargaJual}
                isRequired
                formatOptions={{
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }}
              />

              {selectedMotor && (
                <Card
                  shadow="none"
                  className="md:col-span-2 border border-blue-200 bg-blue-50">
                  <CardBody className="gap-4 p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex flex-col">
                        <span className="text-default-500">
                          Harga Modal Sepeda Motor
                        </span>
                        <span className="font-semibold text-sm">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                          }).format(selectedMotor.harga_modal)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-default-500">
                          Biaya Servis Sepeda Motor
                        </span>
                        <span className="font-semibold text-sm">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                          }).format(selectedMotor.biaya_servis)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-default-500">Harga Jual</span>
                        <span className="font-semibold text-sm">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                          }).format(hargaJual)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-default-500">Laba</span>
                        <span
                          className={`font-semibold text-sm ${labaEstimate >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                          }).format(labaEstimate)}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 w-full">
          <Button onClick={() => router.back()}>Batal</Button>
          <Button color="primary" type="submit" isLoading={isLoading}>
            Simpan Transaksi
          </Button>
        </div>
      </Form>
    </section>
  );
};
