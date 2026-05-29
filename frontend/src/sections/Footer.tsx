export const Footer = () => {
  return (
    <div className='bg-zinc-100 p-4'>
      <div className='flex flex-row bg-zinc-200 rounded-4xl border border-zinc-300 p-12 justify-between'>
        <div>
          <div className='text-xl font-medium pb-3 '>OrganizaDev</div>
          <div className='text-5xl font-medium'>
            Stop context-switching. <br />
            Boost your productivity.
          </div>
        </div>
        <div className='flex flex-row gap-12 p-5 justify-between'>
          <div className='gap-2 flex flex-col'>
            <a href=''>About Us</a>
            <a href=''>Contact</a>
            <a href=''>What's New</a>
            <a href=''>Carrers</a>
          </div>
          <div className='gap-2 flex flex-col'>
            <a href=''>Product</a>
            <a href=''>Solutions</a>
            <a href=''>Integrations</a>
            <a href=''>Pricing</a>
          </div>
        </div>
      </div>
      <div className='text-sm font-medium mt-8 text-center'>
        &copy; {new Date().getFullYear()} OrganizaDev. All rights reserved.
      </div>
    </div>
  );
};
