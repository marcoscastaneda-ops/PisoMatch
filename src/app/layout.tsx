import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { BarraSuperior } from "@/components/barra-superior";
import "./globals.css";

// Fuente única de la guía de estilo (PM-41): Poppins 400, 600 y 700.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "PisoMatch",
  description: "Compañeros de piso por compatibilidad de convivencia",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-crema font-sans text-marino">
        <BarraSuperior />
        {children}
      </body>
    </html>
  );
}
