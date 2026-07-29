import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VehicleCard, { Vehicle } from '../components/VehicleCard';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Zap, ShieldCheck, BarChart3, ArrowRight, CarFront, Sparkles, Loader2 } from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Real-time Stock',
    description: 'Live inventory tracking with instant updates. Always know exactly what\'s on the lot.',
    color: 'bg-accent',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Purchasing',
    description: 'Atomic transactions ensure no overselling. Every purchase is race-condition safe.',
    color: 'bg-secondary',
  },
  {
    icon: Zap,
    title: 'Admin Controls',
    description: 'Full CRUD dashboard for admins. Add, edit, restock, and remove vehicles instantly.',
    color: 'bg-tertiary',
  },
];

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [latestVehicle, setLatestVehicle] = useState<Vehicle | null>(null);
  const [loadingVehicle, setLoadingVehicle] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await api.get('/vehicles');
        const vehicles = res.data.data;
        if (vehicles && vehicles.length > 0) {
          // Render the last one as the most recent
          setLatestVehicle(vehicles[vehicles.length - 1]);
        }
      } catch (err) {
        console.error('Failed to fetch latest vehicle', err);
      } finally {
        setLoadingVehicle(false);
      }
    };
    fetchLatest();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* ══════════════ MARQUEE ══════════════ */}
      <div className="bg-accent text-white font-heading font-extrabold border-b-2 border-foreground py-2 text-sm tracking-widest uppercase overflow-hidden flex whitespace-nowrap">
        <div className="flex animate-[marquee_20s_linear_infinite]">
          {/* Group 1 */}
          <span className="mx-4">🔥 HOT DEALS</span><span className="mx-4">•</span>
          <span className="mx-4">REAL-TIME STOCK</span><span className="mx-4">•</span>
          <span className="mx-4">SECURE PURCHASING</span><span className="mx-4">•</span>
          <span className="mx-4">100% TDD TESTED</span><span className="mx-4">•</span>
          {/* Group 2 */}
          <span className="mx-4">🔥 HOT DEALS</span><span className="mx-4">•</span>
          <span className="mx-4">REAL-TIME STOCK</span><span className="mx-4">•</span>
          <span className="mx-4">SECURE PURCHASING</span><span className="mx-4">•</span>
          <span className="mx-4">100% TDD TESTED</span><span className="mx-4">•</span>
          {/* Group 3 */}
          <span className="mx-4">🔥 HOT DEALS</span><span className="mx-4">•</span>
          <span className="mx-4">REAL-TIME STOCK</span><span className="mx-4">•</span>
          <span className="mx-4">SECURE PURCHASING</span><span className="mx-4">•</span>
          <span className="mx-4">100% TDD TESTED</span><span className="mx-4">•</span>
        </div>
      </div>

      {/* ══════════════ HERO SECTION ══════════════ */}
      <section className="relative overflow-hidden flex-grow flex items-center">
        {/* Decorative background shapes */}
        <div className="absolute top-10 right-[-80px] w-72 h-72 bg-tertiary/30 rounded-full border-2 border-foreground rotate-12" />
        <div className="absolute bottom-[-40px] left-[-60px] w-56 h-56 bg-secondary/20 rounded-2xl border-2 border-foreground -rotate-12" />
        <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-accent/20 rounded-full border-2 border-foreground" />
        <div className="absolute bottom-1/4 right-1/3 w-10 h-10 bg-tertiary rounded-full border-2 border-foreground" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent border-2 border-accent rounded-full px-4 py-1.5 text-sm font-bold mb-6">
                <Sparkles size={16} strokeWidth={2.5} />
                Built with TDD — 60+ Tests
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-extrabold text-foreground leading-[1.1] mb-6">
                The New Way<br />
                to <span className="text-accent">Buy Cars</span>
              </h1>

              <p className="text-lg text-foreground/60 font-body font-medium max-w-md mb-8 leading-relaxed">
                A full-stack car dealership inventory system with real-time stock management, 
                secure purchases, and a powerful admin dashboard.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/inventory"
                  className="inline-flex items-center gap-2 bg-accent text-white font-bold border-2 border-foreground rounded-full px-8 py-3.5 text-lg shadow-pop transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-pop-hover active:translate-y-0.5 active:translate-x-0.5 active:shadow-pop-active"
                >
                  Browse Inventory
                  <ArrowRight size={20} strokeWidth={2.5} />
                </Link>

                {!isAuthenticated && (
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 bg-white text-foreground font-bold border-2 border-foreground rounded-full px-8 py-3.5 text-lg shadow-pop transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-pop-hover active:translate-y-0.5 active:translate-x-0.5 active:shadow-pop-active"
                  >
                    Create Account
                  </Link>
                )}
              </div>
            </div>

            {/* Right: Hero visual card */}
            <div className="hidden lg:flex justify-center">
              <div className="relative w-[380px]">
                {loadingVehicle ? (
                  <div className="bg-white border-2 border-foreground rounded-2xl shadow-[12px_12px_0px_0px_#1E293B] p-8 w-[380px] h-64 flex items-center justify-center rotate-[-2deg]">
                    <Loader2 className="animate-spin text-accent" size={32} />
                  </div>
                ) : latestVehicle ? (
                  <div className="rotate-[-2deg] origin-center z-10 relative">
                    <VehicleCard 
                      vehicle={latestVehicle} 
                      onPurchaseSuccess={(updatedVehicle) => setLatestVehicle(updatedVehicle)} 
                    />
                  </div>
                ) : (
                  <div className="bg-white border-2 border-foreground rounded-2xl shadow-[12px_12px_0px_0px_#1E293B] p-8 w-[380px] h-64 flex items-center justify-center rotate-[-2deg]">
                    <p className="font-bold text-foreground/50">No vehicles available.</p>
                  </div>
                )}

                {/* Decorative stacked card behind */}
                <div className="absolute -z-10 top-4 left-4 w-[380px] h-full bg-secondary/20 border-2 border-foreground rounded-2xl rotate-[2deg]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURES SECTION ══════════════ */}
      <section className="bg-white border-t-2 border-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-heading font-extrabold text-foreground mb-3">
              Why AutoInventory?
            </h2>
            <p className="text-foreground/50 font-body font-medium text-lg max-w-xl mx-auto">
              Enterprise-grade features packed into a beautifully crafted experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-background border-2 border-foreground rounded-2xl p-7 shadow-pop hover:-translate-y-1 hover:-translate-x-1 hover:shadow-pop-hover transition-all duration-300"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-full border-2 border-foreground flex items-center justify-center mb-5`}>
                  <feature.icon size={24} strokeWidth={2.5} className="text-white" />
                </div>
                <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-foreground/60 font-body leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ TECH STACK STRIP ══════════════ */}
      <section className="border-t-2 border-foreground bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-foreground/50 font-body">
            <span className="bg-white border-2 border-foreground rounded-full px-4 py-1.5 shadow-[2px_2px_0px_0px_#1E293B]">React</span>
            <span className="bg-white border-2 border-foreground rounded-full px-4 py-1.5 shadow-[2px_2px_0px_0px_#1E293B]">TypeScript</span>
            <span className="bg-white border-2 border-foreground rounded-full px-4 py-1.5 shadow-[2px_2px_0px_0px_#1E293B]">Node.js</span>
            <span className="bg-white border-2 border-foreground rounded-full px-4 py-1.5 shadow-[2px_2px_0px_0px_#1E293B]">Express</span>
            <span className="bg-white border-2 border-foreground rounded-full px-4 py-1.5 shadow-[2px_2px_0px_0px_#1E293B]">MongoDB</span>
            <span className="bg-white border-2 border-foreground rounded-full px-4 py-1.5 shadow-[2px_2px_0px_0px_#1E293B]">JWT Auth</span>
            <span className="bg-white border-2 border-foreground rounded-full px-4 py-1.5 shadow-[2px_2px_0px_0px_#1E293B]">TDD / Jest</span>
            <span className="bg-white border-2 border-foreground rounded-full px-4 py-1.5 shadow-[2px_2px_0px_0px_#1E293B]">Tailwind CSS v4</span>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="border-t-2 border-foreground bg-foreground text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 font-heading font-bold text-lg">
            <CarFront size={22} strokeWidth={2.5} />
            AutoInventory
          </div>
          <p className="text-white/50 text-sm font-body">
            Built with TDD • 60+ Tests • Full-Stack MERN
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
