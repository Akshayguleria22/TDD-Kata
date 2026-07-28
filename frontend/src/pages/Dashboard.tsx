import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import VehicleCard, { Vehicle } from '../components/VehicleCard';
import api from '../api/axios';
import { Search, Loader2, FilterX } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Inventory</h1>
          <p className="text-gray-500 mt-1">Browse and purchase vehicles from our catalog.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center gap-2 mb-4 text-gray-700 font-medium">
            <Search size={18} />
            <h2>Search & Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Make</label>
              <input 
                type="text" 
                value={make} 
                onChange={e => setMake(e.target.value)}
                placeholder="e.g. Toyota"
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Model</label>
              <input 
                type="text" 
                value={model} 
                onChange={e => setModel(e.target.value)}
                placeholder="e.g. Camry"
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Category</label>
              <input 
                type="text" 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g. Sedan, SUV"
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Min Price</label>
              <input 
                type="number" 
                value={minPrice} 
                onChange={e => setMinPrice(e.target.value)}
                placeholder="$0"
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Max Price</label>
              <input 
                type="number" 
                value={maxPrice} 
                onChange={e => setMaxPrice(e.target.value)}
                placeholder="$100k"
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>
          
          {(make || model || category || minPrice || maxPrice) && (
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition"
              >
                <FilterX size={16} />
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Vehicle Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
            <p>Loading inventory...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <CarFront size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No vehicles found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search filters to find what you're looking for.</p>
            <button 
              onClick={handleClearFilters}
              className="mt-6 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-md transition font-medium text-sm"
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
