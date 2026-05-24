import type { Metadata } from "next";
import "./globals.css";
import { Provider } from "./HeroUIProvider";

export const metadata: Metadata = {
  title: "Surya Jaya Motor Admin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
