export const Features = () => {
  return (
    <section id='features' className='py-24 px-8 bg-zinc-100'>
      <div className='flex flex-col items-center text-center gap-2 mb-12'>
        <span className='text-sm border border-zinc-300 px-4 py-1 rounded-full'>
          Features
        </span>
        <h2 className='text-4xl font-semibold tracking-tight mt-2'>
          Keep everything in one place
        </h2>
        <p className='text-zinc-500'>
          Forget complex project management tools.
        </p>
      </div>

      <div className='grid grid-cols-2 gap-4 max-w-5xl mx-auto'>
        {/* Card 1 */}
        <div className='bg-white rounded-2xl p-6 flex flex-col gap-4'>
          <div className='bg-zinc-100 rounded-xl h-52 w-full' />
          <h3 className='text-lg font-semibold'>Seamless Collaboration</h3>
          <p className='text-zinc-500 text-sm'>
            Work together with your team effortlessly.
          </p>
        </div>

        {/* Card 2 */}
        <div className='bg-white rounded-2xl p-6 flex flex-col gap-4'>
          <div className='bg-zinc-100 rounded-xl h-52 w-full' />
          <h3 className='text-lg font-semibold'>Real-time Updates</h3>
          <p className='text-zinc-500 text-sm'>
            See changes as they happen across your board.
          </p>
        </div>

        {/* Card 3 */}
        <div className='bg-white rounded-2xl p-6 flex flex-col gap-4'>
          <div className='bg-zinc-100 rounded-xl h-52 w-full' />
          <h3 className='text-lg font-semibold'>Advanced Task Tracking</h3>
          <p className='text-zinc-500 text-sm'>
            A bird's eye view of your entire workflow.
          </p>
        </div>

        {/* Card 4 */}
        <div className='bg-white rounded-2xl p-6 flex flex-col gap-4'>
          <div className='bg-zinc-100 rounded-xl h-52 w-full' />
          <h3 className='text-lg font-semibold'>Customizable Workspaces</h3>
          <p className='text-zinc-500 text-sm'>
            Adapt the tool to fit your team's needs.
          </p>
        </div>
      </div>
    </section>
  );
};
