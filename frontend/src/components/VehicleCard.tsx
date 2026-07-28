import { useState } from 'react';
import { ShoppingCart, Loader2, Info } from 'lucide-react';
import api from '../api/axios';

export interface Vehicle {
  _id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  year: number;
  description?: string;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onPurchaseSuccess: (updatedVehicle: Vehicle) => void;
}

const VehicleCard = ({ vehicle, onPurchaseSuccess }: VehicleCardProps) => {
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');

  const handlePurchase = async () => {
    if (vehicle.quantity === 0) return;
    
    setError('');
    setPurchasing(true);
    
    try {
      const response = await api.post(`/vehicles/${vehicle._id}/purchase`);
      onPurchaseSuccess(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to purchase vehicle.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setPurchasing(false);
    }
  };

  const inStock = vehicle.quantity > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition flex flex-col h-full relative">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md mt-1">
              {vehicle.category}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-blue-600">
              ${vehicle.price.toLocaleString()}
            </span>
          </div>
        </div>
        
        {vehicle.description && (
          <p className="text-gray-600 text-sm mt-3 line-clamp-2">
            {vehicle.description}
          </p>
        )}
      </div>

      <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <span className={`inline-flex items-center gap-1 text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>
            <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {inStock ? `${vehicle.quantity} In Stock` : 'Out of Stock'}
          </span>
        </div>
        
        <button
          onClick={handlePurchase}
          disabled={!inStock || purchasing}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            inStock 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {purchasing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ShoppingCart size={16} />
          )}
          Purchase
        </button>
      </div>

      {error && (
        <div className="absolute top-2 right-2 left-2 bg-red-100 text-red-700 text-xs px-3 py-2 rounded shadow flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Info size={14} />
          {error}
        </div>
      )}
    </div>
  );
};

export default VehicleCard;
