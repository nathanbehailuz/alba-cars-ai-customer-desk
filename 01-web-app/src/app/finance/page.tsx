export default function FinancePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl text-alba-white md:text-4xl">Auto finance eligibility</h1>
      <p className="mt-4 max-w-2xl text-alba-silver">
        Let our team tackle the finance for you. We work with major banks across the UAE for
        Islamic and conventional options — terms up to 5 years, including flexible down payment
        structures.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          ["Partner banks", "Competitive rates across UAE lenders"],
          ["Fast paperwork", "Salary certificate & docs guidance"],
          ["Lease to own", "Options beyond classic loans"],
        ].map(([t, b]) => (
          <div key={t} className="border border-white/10 bg-alba-graphite p-5">
            <h2 className="font-display text-lg text-alba-accentSoft">{t}</h2>
            <p className="mt-2 text-sm text-alba-silver">{b}</p>
          </div>
        ))}
      </div>
      <p className="mt-10 text-sm text-alba-mist">
        Use the inquiry desk → <strong>Ask about financing</strong> — no need to leave for
        WhatsApp.
      </p>
    </div>
  );
}
