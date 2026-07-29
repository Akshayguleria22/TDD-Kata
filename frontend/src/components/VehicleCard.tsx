import { useState } from 'react';
import { ShoppingCart, Loader2, Info, Tag, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const [success, setSuccess] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (vehicle.quantity === 0) return;
    
    setError('');
    setSuccess('');
    setPurchasing(true);
    
    try {
      const response = await api.post(`/vehicles/${vehicle._id}/purchase`);
      onPurchaseSuccess(response.data.data);
      setSuccess('Purchase successful! 🎉');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to purchase vehicle.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setPurchasing(false);
    }
  };

  const inStock = vehicle.quantity > 0;

  return (
    <div className="bg-white border-2 border-foreground rounded-2xl shadow-pop-lg hover:rotate-[-1deg] hover:scale-[1.02] transition-all duration-300 overflow-hidden flex flex-col h-full relative">
      {/* Card Body */}
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-heading font-bold text-foreground">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <span className="inline-flex items-center gap-1 bg-tertiary/20 text-foreground border-2 border-foreground rounded-full text-xs font-bold px-3 py-1 mt-2">
              <Tag size={12} strokeWidth={2.5} />
              {vehicle.category}
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-heading font-extrabold text-accent">
              ${vehicle.price.toLocaleString()}
            </span>
          </div>
        </div>
        
        {vehicle.description && (
          <p className="text-foreground/60 text-sm mt-3 line-clamp-2 font-body">
            {vehicle.description}
          </p>
        )}
      </div>

      {/* Card Footer */}
      <div className="bg-background p-4 border-t-2 border-foreground flex items-center justify-between">
        <div className="flex items-center">
          <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${inStock ? 'text-green-600' : 'text-red-500'}`}>
            <span className={`w-2.5 h-2.5 rounded-full border-2 ${inStock ? 'bg-green-400 border-green-600' : 'bg-red-400 border-red-600'}`}></span>
            {inStock ? `${vehicle.quantity} In Stock` : 'Out of Stock'}
          </span>
        </div>
        
        <button
          onClick={handlePurchase}
          disabled={!inStock || purchasing}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold border-2 transition-all duration-200 ${
            inStock 
              ? 'bg-accent text-white border-foreground shadow-pop hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-pop-hover active:translate-y-0.5 active:translate-x-0.5 active:shadow-pop-active' 
              : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
          }`}
        >
          {purchasing ? (
            <Loader2 size={16} strokeWidth={2.5} className="animate-spin" />
          ) : (
            <ShoppingCart size={16} strokeWidth={2.5} />
          )}
          {isAuthenticated ? 'Purchase' : 'Login to Buy'}
        </button>
      </div>

      {/* Success Toast */}
      {success && (
        <div className="absolute top-3 right-3 left-3 bg-green-50 text-green-700 border-2 border-green-400 text-xs px-3 py-2 rounded-xl shadow-pop font-bold flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
          <CheckCircle2 size={14} strokeWidth={2.5} />
          {success}
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="absolute top-3 right-3 left-3 bg-red-50 text-red-600 border-2 border-red-300 text-xs px-3 py-2 rounded-xl shadow-pop font-bold flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
          <Info size={14} strokeWidth={2.5} />
          {error}
        </div>
      )}
    </div>
  );
};

export default VehicleCard;
