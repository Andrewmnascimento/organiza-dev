export const Hero = () => {
  return (
    <div className='flex flex-col items-center text-center gap-6 py-32 px-8'>
      <h1 className='text-6xl font-semibold tracking-tight max-w-2xl'>
        Organize your work,
        <br /> ship faster
      </h1>
      <h2 className='text-lg text-slate-500 max-w-xl'>
        The project management tool built for developers
      </h2>
      <a className='bg-black text-white px-6 py-3 rounded-2xl text-sm font-medium'>
        Get Started
      </a>
    </div>
  );
};
