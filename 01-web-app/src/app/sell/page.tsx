export default function SellPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="font-display text-3xl text-alba-white md:text-4xl">
            Sell your used car hassle free
          </h1>
          <p className="mt-4 text-alba-silver">
            Get top market value, instant cash options, and loan support in Dubai and Abu Dhabi.
            Sell in three steps — often the same day.
          </p>
          <ol className="mt-8 space-y-3 text-sm text-alba-mist">
            <li>
              <span className="text-alba-accentSoft">01</span> Fill the details
            </li>
            <li>
              <span className="text-alba-accentSoft">02</span> Get a quick response
            </li>
            <li>
              <span className="text-alba-accentSoft">03</span> Sell same day for cash
            </li>
          </ol>
          <p className="mt-8 text-sm text-alba-silver">
            Open the inquiry desk (bottom right) and choose{" "}
            <strong className="text-alba-white">Sell or trade in my car</strong>.
          </p>
        </div>
        <div className="min-h-[280px] rounded-lg border border-white/10 bg-gradient-to-br from-alba-steel to-alba-black p-8">
          <p className="font-display text-2xl text-alba-white">Trade-in ready</p>
          <p className="mt-3 text-sm leading-relaxed text-alba-silver">
            Tell us make, model, year, mileage, and condition. We handle paperwork and RTA
            transfer so you can move into your next Alba vehicle faster.
          </p>
        </div>
      </div>
    </div>
  );
}
