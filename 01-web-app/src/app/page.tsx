import Link from "next/link";
import { VehicleCard } from "@/components/VehicleCard";
import { vehicles } from "@/data/vehicles";

const featured = vehicles.filter((v) => v.featured);

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-40"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-alba-black via-alba-black/85 to-alba-black/40" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 md:px-6">
          <p className="font-display text-4xl leading-tight text-alba-white md:text-6xl md:leading-[1.1]">
            ALBA CARS
          </p>
          <h1 className="mt-3 max-w-xl text-lg text-alba-mist md:text-xl">
            Find your perfect used car in Dubai — certified stock, flexible finance, hassle-free
            selling.
          </h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/buy"
              className="rounded bg-alba-accent px-5 py-3 text-sm font-medium text-alba-black"
            >
              Show all cars
            </Link>
            <Link
              href="/sell"
              className="rounded border border-white/25 px-5 py-3 text-sm text-alba-white"
            >
              Sell your car
            </Link>
          </div>
          <p className="mt-6 text-sm text-alba-silver">4.8 · Reviews (2,500+) · Al Quoz showroom</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-alba-white md:text-3xl">Special car deals</h2>
            <p className="mt-1 text-sm text-alba-silver">Handpicked stock with one-year warranty.</p>
          </div>
          <Link href="/buy" className="text-sm text-alba-accentSoft hover:underline">
            See all
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-alba-graphite/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3 md:px-6">
          {[
            ["150+ point inspection", "Mileage verified · RTA certified"],
            ["One year free warranty", "Major mechanical & electrical cover"],
            ["Easy finance", "0% down options with partner banks"],
          ].map(([title, body]) => (
            <div key={title}>
              <h3 className="font-display text-lg text-alba-accentSoft">{title}</h3>
              <p className="mt-2 text-sm text-alba-silver">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <h2 className="font-display text-2xl text-alba-white">Visit our showroom</h2>
        <p className="mt-2 max-w-2xl text-sm text-alba-silver">
          Sun–Sat 9:30 AM – 10 PM · Call +971 4 377 2503 · Use the inquiry desk (bottom right) —
          no WhatsApp required.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/finance"
            className="rounded border border-alba-accent/40 px-4 py-2 text-sm text-alba-accentSoft"
          >
            Check finance eligibility
          </Link>
          <Link href="/sell" className="rounded border border-white/20 px-4 py-2 text-sm text-alba-mist">
            Trade-in valuation
          </Link>
        </div>
      </section>
    </>
  );
}
