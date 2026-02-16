import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Importamos el CSS de Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenDocs AI - README Generator",
  description: "Generador profesional de README para GitHub",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
