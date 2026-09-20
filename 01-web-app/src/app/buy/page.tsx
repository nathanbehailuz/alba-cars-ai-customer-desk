"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { VehicleCard } from "@/components/VehicleCard";
import { vehicleLabel, vehicles } from "@/data/vehicles";

function BuyContent() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("vehicle");
  const [body, setBody] = useState("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (body !== "all" && v.bodyType !== body) return false;
      if (!q.trim()) return true;
      const hay = `${v.make} ${v.model} ${v.year}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });
  }, [body, q]);

  const selected = vehicles.find((v) => v.id === selectedId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl text-alba-white md:text-4xl">Buy used cars</h1>
      <p className="mt-2 max-w-2xl text-sm text-alba-silver">
        Mocked inventory for this demo — open a car, then use the inquiry desk to attach vehicle
        context automatically.
      </p>

      {selected && (
        <div className="mt-6 rounded border border-alba-accent/30 bg-alba-graphite px-4 py-3 text-sm text-alba-mist">
          Viewing <span className="text-alba-accentSoft">{vehicleLabel(selected)}</span> — open the
          inquiry desk to ask about this vehicle.
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search make or model"
          className="min-w-[12rem] flex-1 rounded border border-white/10 bg-alba-black px-3 py-2 text-sm outline-none focus:border-alba-accent/40"
        />
        <select
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="rounded border border-white/10 bg-alba-black px-3 py-2 text-sm"
        >
          <option value="all">All body types</option>
          <option value="SUV">SUV</option>
          <option value="Sedan">Sedan</option>
        </select>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((v) => (
          <VehicleCard key={v.id} vehicle={v} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="mt-8 text-sm text-alba-silver">
          No matches — use the inquiry desk (“Help me find a car”) and we will capture your
          filters for sales.
        </p>
      )}
    </div>
  );
}

export default function BuyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-alba-silver">Loading inventory…</div>}>
      <BuyContent />
    </Suspense>
  );
}
