export const NavBar = () => {
  return (
    <nav className='flex items-center justify-between px-8 py-4'>
      <section className='text-xl font-medium'>OrganizaDev</section>
      <section className='flex flex-row gap-6 text-sm font-medium'>
        <a href='#solutions'>Solutions</a>
        <a href='#features'>Features</a>
        <a href='#integrations'>Integrations</a>
        <a href='#pricing'>Pricing</a>
      </section>
      <section className='flex flex-row gap-4 text-sm font-medium items-center'>
        <a href="/login">Sign In</a>
        <a href="/signup" className='border border-zinc-900 bg-zinc-950 text-white hover:bg-zinc-900 px-4 py-2 rounded-lg transition-colors'>
          Get Started
        </a>
      </section>
    </nav>
  );
};
