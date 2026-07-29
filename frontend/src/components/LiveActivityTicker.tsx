import { useEffect, useState } from 'react';
import api from '../api/axios';
import { CarFront, Zap } from 'lucide-react';
import type { Vehicle } from './VehicleCard';

const LiveActivityTicker = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await api.get('/vehicles');
        setVehicles(res.data.data.slice(0, 5)); // Take top 5 for ticker
      } catch (err) {
        console.error('Failed to fetch vehicles for ticker', err);
      }
    };
    fetchVehicles();
  }, []);

  if (vehicles.length === 0) return null;

  return (
    <footer className="border-t-2 border-foreground bg-foreground text-white flex flex-col">
      {/* Dynamic Scrolling Ticker */}
      <div className="bg-accent text-white font-heading font-extrabold border-b-2 border-foreground py-2 text-sm tracking-widest uppercase overflow-hidden flex whitespace-nowrap">
        <div className="flex animate-[marquee_25s_linear_infinite]">
          {/* Group 1 */}
          <div className="flex items-center">
            {vehicles.map((v) => (
              <span key={v._id} className="mx-4 flex items-center gap-2">
                <Zap size={14} className="text-tertiary" /> 
                HOT DEAL: {v.year} {v.make} {v.model} for ${v.price.toLocaleString()}!
                <span className="mx-4">•</span>
              </span>
            ))}
            <span className="mx-4 text-tertiary">Live Inventory Tracking Active</span>
            <span className="mx-4">•</span>
          </div>
          {/* Group 2 (Duplicate for seamless loop) */}
          <div className="flex items-center">
            {vehicles.map((v) => (
              <span key={`${v._id}-dup`} className="mx-4 flex items-center gap-2">
                <Zap size={14} className="text-tertiary" /> 
                HOT DEAL: {v.year} {v.make} {v.model} for ${v.price.toLocaleString()}!
                <span className="mx-4">•</span>
              </span>
            ))}
            <span className="mx-4 text-tertiary">Live Inventory Tracking Active</span>
            <span className="mx-4">•</span>
          </div>
          {/* Group 3 (Duplicate for seamless loop) */}
          <div className="flex items-center">
            {vehicles.map((v) => (
              <span key={`${v._id}-dup2`} className="mx-4 flex items-center gap-2">
                <Zap size={14} className="text-tertiary" /> 
                HOT DEAL: {v.year} {v.make} {v.model} for ${v.price.toLocaleString()}!
                <span className="mx-4">•</span>
              </span>
            ))}
            <span className="mx-4 text-tertiary">Live Inventory Tracking Active</span>
            <span className="mx-4">•</span>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between w-full">
        <div className="flex items-center gap-2 font-heading font-bold text-lg">
          <CarFront size={22} strokeWidth={2.5} />
          AutoInventory
        </div>
        <p className="text-white/50 text-sm font-body">
          Built with TDD • 60+ Tests • Full-Stack MERN
        </p>
      </div>
    </footer>
  );
};

export default LiveActivityTicker;
