import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import VehicleCard, { type Vehicle } from '../components/VehicleCard';
import api from '../api/axios';
import { Search, Loader2, FilterX, CarFront } from 'lucide-react';

const Dashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

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

  const handleClearFilters = () => {
    setMake('');
    setModel('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
  };

  const handlePurchaseSuccess = (updatedVehicle: Vehicle) => {
    // Optimistically update the specific vehicle in the local state
    setVehicles(prev => prev.map(v => 
      v._id === updatedVehicle._id ? updatedVehicle : v
    ));
    
    // In a real app, we might use react-hot-toast for a global success message here
  };

  const hasFilters = make || model || category || minPrice || maxPrice;

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
          <div className="flex flex-col items-center justify-center py-20 text-foreground/50">
            <Loader2 size={40} strokeWidth={2.5} className="animate-spin mb-4 text-accent" />
            <p className="font-body font-medium">Loading inventory...</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map(vehicle => (
              <VehicleCard 
                key={vehicle._id} 
                vehicle={vehicle} 
                onPurchaseSuccess={handlePurchaseSuccess}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
