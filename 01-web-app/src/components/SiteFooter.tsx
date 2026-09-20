import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-alba-black text-alba-silver">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-display text-lg text-alba-white">ALBA CARS</p>
          <p className="mt-2 text-sm leading-relaxed">
            Showroom 17, 18 &amp; 20, Al Asayel Street, Al Quoz Ind 1
            <br />
            Dubai, United Arab Emirates
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-alba-mist">Contact</p>
          <p className="mt-2 text-sm">
            <a href="tel:+97143772503" className="hover:text-alba-accent">
              +971 4 377 2503
            </a>
          </p>
          <p className="mt-1 text-sm">Sun–Sat · 9:30 AM – 10:00 PM</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-alba-mist">Explore</p>
          <div className="mt-2 flex flex-col gap-1 text-sm">
            <Link href="/buy" className="hover:text-alba-accent">
              Buy used cars
            </Link>
            <Link href="/sell" className="hover:text-alba-accent">
              Sell your car
            </Link>
            <Link href="/finance" className="hover:text-alba-accent">
              Auto finance
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 px-4 py-4 text-center text-xs text-alba-silver/70 md:px-6">
        Demo prototype for assignment review — not the production{" "}
        <a
          href="https://albacars.ae/"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-alba-accent/40 hover:text-alba-accent"
        >
          albacars.ae
        </a>{" "}
        website. Prefer WhatsApp? Optional:{" "}
        <a
          href="https://wa.me/97143772503"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-alba-accent/40 hover:text-alba-accent"
        >
          chat on WhatsApp
        </a>{" "}
        (secondary only).
      </div>
    </footer>
  );
}
