export const Pricing = () => {
  return (
    <section id="pricing" className="flex flex-col items-center py-24 px-8 bg-slate-100">
      <span className="text-sm border border-slate-300 px-4 py-1 rounded-full">
        Pricing
      </span>
      <h2 className="text-4xl font-semibold tracking-tight mt-2">
        Free tier covers your workflow. Upgrade for more.
      </h2>
      <div className="flex flex-row justify-between items-center w-max gap-16 p-20  ">
        <div className="flex flex-col bg-white rounded-2xl p-8  gap-4 w-64">
          <div>
            <h3 className="text-xl font-semibold">
              Free
            </h3>
            <p className="text-slate-500 text-sm">
              Perfect for solo developers
            </p>
          </div>
          <p className="text-4xl font-semibold">$0<span className="text-lg font-normal text-slate-500">/mo</span></p>
          <a className="bg-black text-white text-center text-sm py-2 rounded-xl">Get Started</a>
          <ul className="flex flex-col gap-2 text-sm text-slate-600">
            <li>✓ 3 project boards</li>
            <li>✓ 1 integration per board</li>
            <li>✓ 3 collaborators total</li>
            <li>✓ All core features</li>
            <li>✓ Community support</li>
          </ul>
        </div>
        <div className="relative flex flex-col gap-4 bg-black text-white rounded-2xl p-8 w-64">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black border border-slate-200 text-xs font-medium px-3 py-1 rounded-full">
              Most Popular
          </span>
          <div>
            <h3 className="text-xl font-semibold">Plus</h3>
            <p className="text-slate-200 text-sm">For developers who need more</p>
          </div>
          <p className="text-4xl font-semibold">$7<span className="text-lg font-normal text-slate-500">/mo</span></p>
          <a className="bg-white text-black text-center text-sm py-2 rounded-xl">Get Started</a>
          <ul className="flex flex-col gap-2 text-sm text-slate-300">
            <li>✓ Unlimited project boards</li>
            <li>✓ 5 integrations per board</li>
            <li>✓ 6 collaborators total</li>
            <li>✓ Advanced analytics</li>
            <li>✓ Email support</li>
          </ul>
        </div>
        <div className="flex flex-col bg-white rounded-2xl p-8  gap-4 w-64">
          <div>
            <h3 className="text-xl font-semibold">
              Pro
            </h3>
            <p className="text-slate-500 text-sm">
              For power developers
            </p>
          </div>
          <p className="text-4xl font-semibold">$15<span className="text-lg font-normal text-slate-500">/mo</span></p>
          <a className="bg-black text-white text-center text-sm py-2 rounded-xl">Get Started</a>
          <ul className="flex flex-col gap-2 text-sm text-slate-600">
            <li>✓ Unlimited project boards</li>
            <li>✓ Unlimited integrations per board</li>
            <li>✓ 20 collaborators total</li>
            <li>✓ Advanced filters & views</li>
            <li>✓ Priority support</li>
          </ul>
        </div>
      </div>
    </section>
  )
}