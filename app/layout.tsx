import type { Metadata } from "next";
import { Inter, Baloo_2 } from 'next/font/google'
import { Rubik_Bubbles } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
 
const roboto_mono = Baloo_2({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

const roboto = Rubik_Bubbles({ weight: ["400"], subsets: ["latin"] });


export const metadata: Metadata = {
  title: "Check Masks",
  description: "use this frame to check mask stats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>{children}</body>
    </html>
  );
}
