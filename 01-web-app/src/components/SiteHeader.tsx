"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/buy", label: "Buy" },
  { href: "/sell", label: "Sell" },
  { href: "/finance", label: "Finance" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-alba-black/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link href="/" className="font-display text-xl tracking-wide text-alba-white md:text-2xl">
          ALBA CARS
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm md:gap-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded px-2.5 py-1.5 transition ${
                  active
                    ? "bg-white/10 text-alba-accent"
                    : "text-alba-mist/80 hover:bg-white/5 hover:text-alba-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <a
            href="tel:+97143772503"
            className="ml-1 hidden rounded border border-alba-accent/40 px-3 py-1.5 text-alba-accentSoft sm:inline"
          >
            +971 4 377 2503
          </a>
        </nav>
      </div>
    </header>
  );
}
