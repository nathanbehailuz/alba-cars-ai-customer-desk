export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  priceAed: number;
  mileageKm: number;
  bodyType: string;
  fuel: string;
  transmission: string;
  imageGradient: string;
  featured?: boolean;
};

export const vehicles: Vehicle[] = [
  {
    id: "veh-rav4-2023",
    make: "Toyota",
    model: "RAV4",
    year: 2023,
    priceAed: 125000,
    mileageKm: 28000,
    bodyType: "SUV",
    fuel: "Petrol",
    transmission: "Automatic",
    imageGradient: "from-slate-700 to-slate-900",
    featured: true,
  },
  {
    id: "veh-civic-2022",
    make: "Honda",
    model: "Civic",
    year: 2022,
    priceAed: 78000,
    mileageKm: 35000,
    bodyType: "Sedan",
    fuel: "Petrol",
    transmission: "Automatic",
    imageGradient: "from-zinc-600 to-zinc-900",
    featured: true,
  },
  {
    id: "veh-cclass-2021",
    make: "Mercedes-Benz",
    model: "C 300",
    year: 2021,
    priceAed: 145000,
    mileageKm: 42000,
    bodyType: "Sedan",
    fuel: "Petrol",
    transmission: "Automatic",
    imageGradient: "from-neutral-700 to-black",
    featured: true,
  },
  {
    id: "veh-x5-2020",
    make: "BMW",
    model: "X5",
    year: 2020,
    priceAed: 168000,
    mileageKm: 51000,
    bodyType: "SUV",
    fuel: "Petrol",
    transmission: "Automatic",
    imageGradient: "from-stone-600 to-stone-950",
  },
  {
    id: "veh-range-2019",
    make: "Land Rover",
    model: "Range Rover Sport",
    year: 2019,
    priceAed: 195000,
    mileageKm: 62000,
    bodyType: "SUV",
    fuel: "Petrol",
    transmission: "Automatic",
    imageGradient: "from-emerald-900 to-black",
  },
  {
    id: "veh-altima-2020",
    make: "Nissan",
    model: "Altima",
    year: 2020,
    priceAed: 52000,
    mileageKm: 71000,
    bodyType: "Sedan",
    fuel: "Petrol",
    transmission: "Automatic",
    imageGradient: "from-blue-900 to-slate-950",
  },
];

export function formatAed(amount: number) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function vehicleLabel(v: Vehicle) {
  return `${v.year} ${v.make} ${v.model}`;
}
