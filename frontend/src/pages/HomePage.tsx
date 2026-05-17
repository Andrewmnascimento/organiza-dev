import { NavBar } from '../sections/NavBar';
import { Hero } from '../sections/Hero';
import { Solutions } from '../sections/Solutions';
import { Features } from '../sections/Features';

export const HomePage = () => {
  return (
    <div className='bg-slate-50'>
      <NavBar />
      <Hero />
      <Solutions />
      <Features />
    </div>
  );
};
