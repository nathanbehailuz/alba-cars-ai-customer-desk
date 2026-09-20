import Link from "next/link";
import { formatAed, vehicleLabel, type Vehicle } from "@/data/vehicles";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Link
      href={`/buy?vehicle=${vehicle.id}`}
      className="group block overflow-hidden border border-white/10 bg-alba-graphite transition hover:border-alba-accent/40"
    >
      <div
        className={`flex h-40 items-end bg-gradient-to-br ${vehicle.imageGradient} p-4 transition group-hover:brightness-110`}
      >
        <span className="text-xs uppercase tracking-wider text-white/70">
          {vehicle.bodyType}
        </span>
      </div>
      <div className="space-y-1 p-4">
        <h3 className="font-display text-lg text-alba-white">{vehicleLabel(vehicle)}</h3>
        <p className="text-sm text-alba-silver">
          {vehicle.mileageKm.toLocaleString()} km · {vehicle.transmission}
        </p>
        <p className="pt-1 text-alba-accentSoft">{formatAed(vehicle.priceAed)}</p>
      </div>
    </Link>
  );
}
