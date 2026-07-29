import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import type { Vehicle } from '../components/VehicleCard';
import { Plus, Edit2, Trash2, PackagePlus, X, Loader2, Activity, Car } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import SystemHealth from '../components/SystemHealth';

const Admin = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState<'inventory' | 'health'>('inventory');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentVehicle, setCurrentVehicle] = useState<Partial<Vehicle>>({});
  
  // Restock state
  const [restockId, setRestockId] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(1);

  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data.data);
    } catch (err) {
      console.error('Failed to fetch vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Real-time socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleInventoryUpdated = (updatedVehicle: Vehicle) => {
      setVehicles(prev => {
        const exists = prev.find(v => v._id === updatedVehicle._id);
        if (exists) {
          return prev.map(v => v._id === updatedVehicle._id ? updatedVehicle : v);
        }
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

  const openAddModal = () => {
    setModalMode('add');
    setCurrentVehicle({
      make: '', model: '', category: '', price: 0, quantity: 1, year: new Date().getFullYear(), description: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setModalMode('edit');
    setCurrentVehicle(vehicle);
    setError('');
    setIsModalOpen(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    try {
      if (modalMode === 'add') {
        const res = await api.post('/vehicles', currentVehicle);
        setVehicles([...vehicles, res.data.data]);
      } else {
        const res = await api.put(`/vehicles/${currentVehicle._id}`, currentVehicle);
        setVehicles(vehicles.map(v => v._id === currentVehicle._id ? res.data.data : v));
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles(vehicles.filter(v => v._id !== id));
    } catch (err) {
      alert('Failed to delete vehicle');
    }
  };

  const handleRestock = async (id: string) => {
    if (restockAmount < 1) return;
    
    try {
      const res = await api.post(`/vehicles/${id}/restock`, { quantityToAdd: Number(restockAmount) });
      setVehicles(vehicles.map(v => v._id === id ? res.data.data : v));
      setRestockId(null);
      setRestockAmount(1);
    } catch (err) {
      alert('Failed to restock vehicle');
    }
  };

  const inputClasses = "w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2.5 font-body transition-all outline-none focus:border-accent focus:shadow-[4px_4px_0px_0px_#8B5CF6]";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-heading font-extrabold text-foreground">Admin Dashboard</h1>
            <p className="text-foreground/50 mt-2 font-body font-medium">Manage inventory, prices, and stock levels</p>
          </div>
          
          {activeTab === 'inventory' && (
            <button 
              onClick={openAddModal}
              className="bg-accent text-white font-bold border-2 border-foreground px-5 py-2.5 rounded-full flex items-center gap-2 shadow-pop transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-pop-hover active:translate-y-0.5 active:translate-x-0.5 active:shadow-pop-active"
            >
              <Plus size={20} strokeWidth={2.5} />
              Add Vehicle
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold border-2 border-foreground text-sm transition-all duration-200 ${
              activeTab === 'inventory'
                ? 'bg-accent text-white shadow-pop'
                : 'bg-white text-foreground shadow-[2px_2px_0px_0px_#1E293B] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#1E293B]'
            }`}
          >
            <Car size={16} strokeWidth={2.5} />
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold border-2 border-foreground text-sm transition-all duration-200 ${
              activeTab === 'health'
                ? 'bg-accent text-white shadow-pop'
                : 'bg-white text-foreground shadow-[2px_2px_0px_0px_#1E293B] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#1E293B]'
            }`}
          >
            <Activity size={16} strokeWidth={2.5} />
            System Health
          </button>
        </div>

        {activeTab === 'health' ? (
          <SystemHealth />
        ) : (
          <>

        {/* Inventory Table — Sticker Card */}
        <div className="bg-white border-2 border-foreground rounded-2xl shadow-pop overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-background">
                  <th scope="col" className="px-6 py-4 text-left text-xs font-heading font-bold text-foreground uppercase tracking-wider">Vehicle</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-heading font-bold text-foreground uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-heading font-bold text-foreground uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-heading font-bold text-foreground uppercase tracking-wider">Stock</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-heading font-bold text-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-foreground/50">
                      <Loader2 className="animate-spin mx-auto mb-2 text-accent" size={24} strokeWidth={2.5} />
                      <span className="font-body font-medium">Loading inventory...</span>
                    </td>
                  </tr>
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-foreground/50 font-body font-medium">
                      No vehicles found. Click "Add Vehicle" to create one.
                    </td>
                  </tr>
                ) : (
                  vehicles.map(vehicle => (
                    <tr key={vehicle._id} className="border-b-2 border-border hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-foreground font-body">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-block bg-tertiary/20 text-foreground border-2 border-foreground rounded-full text-xs font-bold px-3 py-0.5">
                          {vehicle.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-heading font-bold text-accent">${vehicle.price.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 text-sm font-bold ${vehicle.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          <span className={`w-2 h-2 rounded-full ${vehicle.quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {vehicle.quantity} units
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {restockId === vehicle._id ? (
                          <div className="inline-flex items-center gap-2">
                            <input 
                              type="number" 
                              min="1" 
                              value={restockAmount} 
                              onChange={e => setRestockAmount(Number(e.target.value))}
                              className="w-16 border-2 border-slate-300 rounded-lg px-2 py-1 text-sm font-body outline-none focus:border-accent"
                            />
                            <button 
                              onClick={() => handleRestock(vehicle._id)} 
                              className="bg-green-500 text-white text-xs font-bold border-2 border-foreground rounded-full px-3 py-1 shadow-[2px_2px_0px_0px_#1E293B] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#1E293B] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1E293B] transition-all"
                            >
                              Confirm
                            </button>
                            <button 
                              onClick={() => setRestockId(null)} 
                              className="text-foreground/40 hover:text-foreground text-xs font-bold transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            <button 
                              onClick={() => setRestockId(vehicle._id)}
                              className="w-8 h-8 inline-flex items-center justify-center rounded-lg border-2 border-foreground bg-green-50 text-green-600 shadow-[2px_2px_0px_0px_#1E293B] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#1E293B] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1E293B] transition-all"
                              title="Restock"
                            >
                              <PackagePlus size={15} strokeWidth={2.5} />
                            </button>
                            <button 
                              onClick={() => openEditModal(vehicle)}
                              className="w-8 h-8 inline-flex items-center justify-center rounded-lg border-2 border-foreground bg-accent/10 text-accent shadow-[2px_2px_0px_0px_#1E293B] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#1E293B] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1E293B] transition-all"
                              title="Edit"
                            >
                              <Edit2 size={15} strokeWidth={2.5} />
                            </button>
                            <button 
                              onClick={() => handleDelete(vehicle._id)}
                              className="w-8 h-8 inline-flex items-center justify-center rounded-lg border-2 border-foreground bg-red-50 text-red-500 shadow-[2px_2px_0px_0px_#1E293B] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#1E293B] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1E293B] transition-all"
                              title="Delete"
                            >
                              <Trash2 size={15} strokeWidth={2.5} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-foreground/40 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
            
            {/* Modal Card — Massive Sticker */}
            <div className="relative bg-white border-2 border-foreground rounded-2xl shadow-pop-lg overflow-hidden w-full max-w-lg z-10">
              <div className="p-6">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-heading font-extrabold text-foreground" id="modal-title">
                    {modalMode === 'add' ? '🚗 Add New Vehicle' : '✏️ Edit Vehicle'}
                  </h3>
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="w-8 h-8 inline-flex items-center justify-center rounded-full border-2 border-foreground bg-white text-foreground shadow-[2px_2px_0px_0px_#1E293B] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#1E293B] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1E293B] transition-all"
                  >
                    <X size={16} strokeWidth={2.5} />
                  </button>
                </div>
                
                {error && (
                  <div className="bg-red-50 text-red-600 border-2 border-red-300 p-3 rounded-xl mb-4 text-sm font-bold">{error}</div>
                )}
                
                <form id="vehicle-form" onSubmit={handleSaveVehicle}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5 font-body">Make *</label>
                      <input type="text" required value={currentVehicle.make || ''} onChange={e => setCurrentVehicle({...currentVehicle, make: e.target.value})} className={inputClasses} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5 font-body">Model *</label>
                      <input type="text" required value={currentVehicle.model || ''} onChange={e => setCurrentVehicle({...currentVehicle, model: e.target.value})} className={inputClasses} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5 font-body">Year *</label>
                      <input type="number" required value={currentVehicle.year || ''} onChange={e => setCurrentVehicle({...currentVehicle, year: Number(e.target.value)})} className={inputClasses} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5 font-body">Category *</label>
                      <input type="text" required value={currentVehicle.category || ''} onChange={e => setCurrentVehicle({...currentVehicle, category: e.target.value})} className={inputClasses} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5 font-body">Price *</label>
                      <input type="number" min="0" required value={currentVehicle.price || ''} onChange={e => setCurrentVehicle({...currentVehicle, price: Number(e.target.value)})} className={inputClasses} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5 font-body">Initial Quantity</label>
                      <input 
                        type="number" 
                        min="0" 
                        disabled={modalMode === 'edit'} 
                        value={currentVehicle.quantity || 0} 
                        onChange={e => setCurrentVehicle({...currentVehicle, quantity: Number(e.target.value)})} 
                        className={`${inputClasses} ${modalMode === 'edit' ? 'bg-background border-border text-foreground/40 cursor-not-allowed' : ''}`}
                      />
                      {modalMode === 'edit' && <p className="text-xs text-foreground/40 mt-1 font-body">Use 'Restock' to add quantity</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-1.5 font-body">Description</label>
                    <textarea 
                      rows={3} 
                      value={currentVehicle.description || ''} 
                      onChange={e => setCurrentVehicle({...currentVehicle, description: e.target.value})} 
                      className={`${inputClasses} resize-none`}
                    ></textarea>
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="bg-background border-t-2 border-foreground px-6 py-4 flex flex-row-reverse gap-3">
                <button 
                  type="submit" 
                  form="vehicle-form"
                  disabled={actionLoading}
                  className="bg-accent text-white font-bold border-2 border-foreground rounded-full px-6 py-2 shadow-pop transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-pop-hover active:translate-y-0.5 active:translate-x-0.5 active:shadow-pop-active disabled:opacity-70"
                >
                  {actionLoading ? 'Saving...' : 'Save Vehicle'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white text-foreground font-bold border-2 border-foreground rounded-full px-6 py-2 shadow-pop transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-pop-hover active:translate-y-0.5 active:translate-x-0.5 active:shadow-pop-active"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
