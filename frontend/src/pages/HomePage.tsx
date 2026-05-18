import { NavBar } from '../sections/NavBar';
import { Hero } from '../sections/Hero';
import { Solutions } from '../sections/Solutions';
import { Features } from '../sections/Features';
import { Integrations } from '../sections/Integrations';
import { Pricing } from '../sections/Pricing';
import { Footer } from '../sections/Footer';

export const HomePage = () => {
  return (
    <div className='bg-slate-50'>
      <NavBar />
      <Hero />
      <Solutions />
      <Features />
      <Integrations />
      <Pricing />
      <Footer />
    </div>
  );
};
