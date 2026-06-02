export const Hero = () => {
  return (
    <div className='flex flex-col items-center text-center gap-6 py-32 px-8'>
      <h1 className='text-6xl font-semibold tracking-tight max-w-2xl'>
        Stop context-switching.
        <br /> Ship faster.
      </h1>
      <h2 className='text-lg text-zinc-500 max-w-xl'>
        A PM tool for devs who want to focus on building, not on managing tools.
      </h2>
      <a className='bg-black text-white px-6 py-3 rounded-2xl text-sm font-medium' href="/signup">
        Try for free
      </a>
    </div>
  );
};
