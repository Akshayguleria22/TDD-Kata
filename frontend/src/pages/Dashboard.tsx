import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import VehicleCard, { type Vehicle } from '../components/VehicleCard';
import VehicleCardSkeleton from '../components/VehicleCardSkeleton';
import api from '../api/axios';
import { Search, Loader2, FilterX, CarFront, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';

const Dashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  
  // Search state
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // AI Smart Search state
  const [smartQuery, setSmartQuery] = useState('');
  const [smartLoading, setSmartLoading] = useState(false);
  const [parsedFilters, setParsedFilters] = useState<any>(null);
  const [smartError, setSmartError] = useState('');

  // Recommendation Engine state
  const [recommendations, setRecommendations] = useState<Vehicle[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (make) params.append('make', make);
      if (model) params.append('model', model);
      if (category) params.append('category', category);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const response = await api.get(`/vehicles/search?${params.toString()}`);
      setVehicles(response.data.data);
    } catch (error) {
      console.error('Failed to fetch vehicles', error);
    } finally {
      setLoading(false);
    }
  }, [make, model, category, minPrice, maxPrice]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Fetch recommendations based on the first vehicle in the view
  useEffect(() => {
    const target = vehicles[0];
    if (!target) {
      setRecommendations([]);
      return;
    }

    const fetchRecs = async () => {
      setRecsLoading(true);
      try {
        const response = await api.get(`/vehicles/${target._id}/recommendations`);
        setRecommendations(response.data.data);
      } catch (error) {
        console.error('Failed to fetch recommendations', error);
      } finally {
        setRecsLoading(false);
      }
    };
    
    fetchRecs();
  }, [vehicles[0]?._id]);

  // AI Smart Search handler
  const handleSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartQuery.trim()) return;
    
    setSmartLoading(true);
    setLoading(true);
    setParsedFilters(null);
    setSmartError('');
    try {
      const response = await api.post('/vehicles/smart-search', { query: smartQuery });
      setVehicles(response.data.data);
      setParsedFilters(response.data.meta?.parsedFilters || null);
    } catch (error: any) {
      console.error('Smart search failed', error);
      setSmartError(error.response?.data?.message || 'Smart search failed. Please try again.');
      // Fallback: reload all vehicles
      fetchVehicles();
    } finally {
      setSmartLoading(false);
      setLoading(false);
    }
  };

  // Real-time socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleInventoryUpdated = (updatedVehicle: Vehicle) => {
      setVehicles(prev => {
        const exists = prev.find(v => v._id === updatedVehicle._id);
        if (exists) {
          return prev.map(v => v._id === updatedVehicle._id ? updatedVehicle : v);
        }
        // If it's a new vehicle, we could add it to the front of the list
        // (but ideally check if it matches current search filters)
        return [updatedVehicle, ...prev];
      });
    };

    const handleInventoryDeleted = (id: string) => {
      setVehicles(prev => prev.filter(v => v._id !== id));
    };

    socket.on('inventory_updated', handleInventoryUpdated);
    socket.on('inventory_deleted', handleInventoryDeleted);

    return () => {
      socket.off('inventory_updated', handleInventoryUpdated);
      socket.off('inventory_deleted', handleInventoryDeleted);
    };
  }, [socket]);

  const handleClearFilters = () => {
    setMake('');
    setModel('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSmartQuery('');
    setParsedFilters(null);
    setSmartError('');
  };

  const handlePurchaseSuccess = (updatedVehicle: Vehicle) => {
    // Optimistically update the specific vehicle in the local state
    setVehicles(prev => prev.map(v => 
      v._id === updatedVehicle._id ? updatedVehicle : v
    ));
    
    // In a real app, we might use react-hot-toast for a global success message here
  };

  const hasFilters = make || model || category || minPrice || maxPrice || smartQuery;

  const inputClasses = "w-full text-sm bg-white border-2 border-slate-300 rounded-xl px-3 py-2.5 font-body transition-all outline-none focus:border-accent focus:shadow-[4px_4px_0px_0px_#8B5CF6]";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-extrabold text-foreground">Vehicle Inventory</h1>
          <p className="text-foreground/50 mt-2 font-body font-medium">Browse and purchase vehicles from our catalog.</p>
        </div>

        {/* ── AI Smart Search ── */}
        <form onSubmit={handleSmartSearch} className="mb-4">
          <div className="bg-gradient-to-r from-accent/5 via-secondary/5 to-tertiary/5 border-2 border-accent rounded-2xl shadow-pop-accent p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-full border-2 border-foreground flex items-center justify-center shrink-0">
                <Sparkles size={18} strokeWidth={2.5} className="text-white" />
              </div>
              <input
                type="text"
                value={smartQuery}
                onChange={e => setSmartQuery(e.target.value)}
                placeholder="Ask our AI... e.g. 'Show me fast electric cars under $80k'"
                className="flex-1 text-sm bg-white border-2 border-accent/30 rounded-xl px-4 py-3 font-body transition-all outline-none focus:border-accent focus:shadow-[4px_4px_0px_0px_#8B5CF6] placeholder:text-foreground/30"
              />
              <button
                type="submit"
                disabled={smartLoading || !smartQuery.trim()}
                className="bg-accent text-white font-bold border-2 border-foreground rounded-full px-6 py-2.5 shadow-pop transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-pop-hover active:translate-y-0.5 active:translate-x-0.5 active:shadow-pop-active disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
              >
                {smartLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                AI Search
              </button>
            </div>
            {parsedFilters && Object.keys(parsedFilters).length > 0 && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-foreground/40 uppercase tracking-wider">AI Parsed:</span>
                {Object.entries(parsedFilters).map(([key, value]) => (
                  <span key={key} className="inline-flex items-center gap-1 bg-accent/10 text-accent border border-accent/30 rounded-full text-xs font-bold px-3 py-1">
                    {key}: {String(value)}
                  </span>
                ))}
              </div>
            )}
            {smartError && (
              <div className="mt-3 bg-red-50 text-red-600 border-2 border-red-300 text-xs px-3 py-2 rounded-xl font-bold">
                {smartError}
              </div>
            )}
          </div>
        </form>

        {/* Search & Filter Bar — Sticker Card */}
        <div className="bg-white p-6 border-2 border-foreground rounded-2xl shadow-pop mb-8">
          <div className="flex items-center gap-2 mb-4 text-foreground font-heading font-bold text-lg">
            <Search size={20} strokeWidth={2.5} />
            <h2>Search & Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-1.5 font-body">Make</label>
              <input 
                type="text" 
                value={make} 
                onChange={e => setMake(e.target.value)}
                placeholder="e.g. Toyota"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-1.5 font-body">Model</label>
              <input 
                type="text" 
                value={model} 
                onChange={e => setModel(e.target.value)}
                placeholder="e.g. Camry"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-1.5 font-body">Category</label>
              <input 
                type="text" 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g. Sedan, SUV"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-1.5 font-body">Min Price</label>
              <input 
                type="number" 
                value={minPrice} 
                onChange={e => setMinPrice(e.target.value)}
                placeholder="$0"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-1.5 font-body">Max Price</label>
              <input 
                type="number" 
                value={maxPrice} 
                onChange={e => setMaxPrice(e.target.value)}
                placeholder="$100k"
                className={inputClasses}
              />
            </div>
          </div>
          
          {hasFilters && (
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 text-sm font-bold text-foreground border-2 border-foreground bg-white rounded-full px-4 py-1.5 shadow-pop transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-pop-hover hover:text-red-500 active:translate-y-0.5 active:translate-x-0.5 active:shadow-pop-active"
              >
                <FilterX size={16} strokeWidth={2.5} />
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Vehicle Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white border-2 border-foreground rounded-2xl shadow-pop p-12 text-center">
            <CarFront size={48} strokeWidth={2.5} className="mx-auto text-foreground/20 mb-4" />
            <h3 className="text-xl font-heading font-bold text-foreground">No vehicles found</h3>
            <p className="text-foreground/50 mt-2 font-body">Try adjusting your search filters to find what you're looking for.</p>
            <button 
              onClick={handleClearFilters}
              className="mt-6 bg-tertiary text-foreground font-bold border-2 border-foreground rounded-full px-6 py-2.5 shadow-pop transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-pop-hover active:translate-y-0.5 active:translate-x-0.5 active:shadow-pop-active"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <motion.div 
            layout 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {vehicles.map((vehicle, index) => (
                <motion.div
                  key={vehicle._id}
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 260,
                    damping: 20 
                  }}
                  className="h-full"
                >
                  <VehicleCard 
                    vehicle={vehicle} 
                    onPurchaseSuccess={handlePurchaseSuccess}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Similar Vehicles Recommendation Engine */}
        {vehicles.length > 0 && recommendations.length > 0 && (
          <div className="mt-16 mb-8 pt-10 border-t-4 border-foreground/10">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles size={28} className="text-accent" />
              <h2 className="text-3xl font-heading font-extrabold text-foreground">
                Because you viewed {vehicles[0].make} {vehicles[0].model}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recsLoading ? (
                [...Array(4)].map((_, i) => <VehicleCardSkeleton key={`rec-skel-${i}`} />)
              ) : (
                recommendations.map(vehicle => (
                  <VehicleCard 
                    key={`rec-${vehicle._id}`} 
                    vehicle={vehicle} 
                    onPurchaseSuccess={handlePurchaseSuccess}
                  />
                ))
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
