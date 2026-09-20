import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ALBA Desk · Dashboard",
  description: "Leads, messages, and AI sample evaluation for ALBA CARS inquiry desk",
};

const nav = [
  { href: "/", label: "Leads" },
  { href: "/messages", label: "Messages" },
  { href: "/eval", label: "AI samples" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} font-sans antialiased`}>
        <div className="min-h-screen">
          <header className="border-b border-line bg-panel">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
              <div>
                <p className="text-sm font-semibold tracking-wide">ALBA Desk</p>
                <p className="text-xs text-mute">Internal · leads &amp; AI eval</p>
              </div>
              <nav className="flex gap-1 text-sm">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded px-3 py-1.5 text-mute hover:bg-white/5 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
