import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SASL - Sistema de Autenticación",
  description: "Sistema de autenticación segura con 2FA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}