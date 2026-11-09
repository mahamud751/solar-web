import type { Metadata } from "next";
import { Manrope, Instrument_Serif } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const editorial = Instrument_Serif({ weight: "400", subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Nirvana Power Tech — Solar Street Lights",
  description: "Filatec, MODI and Nirvana solar street lights, supplied from Jail Road, Sylhet and delivered across Bangladesh.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${manrope.variable} ${editorial.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
