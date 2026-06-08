"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Form,
  addToast,
} from "@heroui/react";
import { supabase } from "@/lib/supabase-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase().auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      addToast({
        color: "danger",
        title: signInError.message,
      });
      return;
    }

    // Successful login
    addToast({
      color: "success",
      title: "Login berhasil",
    });

    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold">Surya Jaya Motor</h1>
          <p className="text-sm">Admin Dashboard Login</p>
        </CardHeader>
        <CardBody className="gap-6 p-8">
          <Form onSubmit={handleSubmit} className="space-y-6">
            <Input
              isClearable
              type="email"
              label="Email"
              placeholder="Masukkan email anda"
              value={email}
              onValueChange={setEmail}
              isRequired
            />

            <Input
              type="password"
              label="Password"
              placeholder="Masukkan password anda"
              value={password}
              onValueChange={setPassword}
              isRequired
            />

            {error && (
              <div className="text-danger text-sm bg-danger/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              isLoading={loading}
              color="primary"
              size="lg"
              type="submit"
              className="w-full font-semibold"
              isDisabled={loading || !(email.trim() && password.trim())}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}
