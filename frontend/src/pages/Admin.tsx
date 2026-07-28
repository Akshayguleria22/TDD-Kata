import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Vehicle } from '../components/VehicleCard';
import { Plus, Edit2, Trash2, PackagePlus, X, Loader2 } from 'lucide-react';

const Admin = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage inventory, prices, and stock levels</p>
          </div>
          
          <button 
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm"
          >
            <Plus size={20} />
            Add Vehicle
          </button>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                      Loading inventory...
                    </td>
                  </tr>
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No vehicles found. Click "Add Vehicle" to create one.
                    </td>
                  </tr>
                ) : (
                  vehicles.map(vehicle => (
                    <tr key={vehicle._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{vehicle.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${vehicle.price.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${vehicle.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {vehicle.quantity} units
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {restockId === vehicle._id ? (
                          <div className="inline-flex items-center gap-2 mr-4">
                            <input 
                              type="number" 
                              min="1" 
                              value={restockAmount} 
                              onChange={e => setRestockAmount(Number(e.target.value))}
                              className="w-16 border rounded px-2 py-1 text-sm"
                            />
                            <button onClick={() => handleRestock(vehicle._id)} className="text-green-600 hover:text-green-900">Confirm</button>
                            <button onClick={() => setRestockId(null)} className="text-gray-400 hover:text-gray-600">Cancel</button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setRestockId(vehicle._id)}
                            className="text-green-600 hover:text-green-900 mx-2"
                            title="Restock"
                          >
                            <PackagePlus size={18} />
                          </button>
                        )}
                        
                        <button 
                          onClick={() => openEditModal(vehicle)}
                          className="text-blue-600 hover:text-blue-900 mx-2"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(vehicle._id)}
                          className="text-red-600 hover:text-red-900 ml-2"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {modalMode === 'add' ? 'Add New Vehicle' : 'Edit Vehicle'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                    <X size={20} />
                  </button>
                </div>
                
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
                )}
                
                <form id="vehicle-form" onSubmit={handleSaveVehicle}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                      <input type="text" required value={currentVehicle.make || ''} onChange={e => setCurrentVehicle({...currentVehicle, make: e.target.value})} className="w-full border-gray-300 rounded-md border px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                      <input type="text" required value={currentVehicle.model || ''} onChange={e => setCurrentVehicle({...currentVehicle, model: e.target.value})} className="w-full border-gray-300 rounded-md border px-3 py-2" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                      <input type="number" required value={currentVehicle.year || ''} onChange={e => setCurrentVehicle({...currentVehicle, year: Number(e.target.value)})} className="w-full border-gray-300 rounded-md border px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <input type="text" required value={currentVehicle.category || ''} onChange={e => setCurrentVehicle({...currentVehicle, category: e.target.value})} className="w-full border-gray-300 rounded-md border px-3 py-2" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                      <input type="number" min="0" required value={currentVehicle.price || ''} onChange={e => setCurrentVehicle({...currentVehicle, price: Number(e.target.value)})} className="w-full border-gray-300 rounded-md border px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Initial Quantity</label>
                      <input type="number" min="0" disabled={modalMode === 'edit'} value={currentVehicle.quantity || 0} onChange={e => setCurrentVehicle({...currentVehicle, quantity: Number(e.target.value)})} className={`w-full rounded-md border px-3 py-2 ${modalMode === 'edit' ? 'bg-gray-100 border-gray-200 text-gray-500' : 'border-gray-300'}`} />
                      {modalMode === 'edit' && <p className="text-xs text-gray-400 mt-1">Use 'Restock' to add quantity</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea rows={3} value={currentVehicle.description || ''} onChange={e => setCurrentVehicle({...currentVehicle, description: e.target.value})} className="w-full border-gray-300 rounded-md border px-3 py-2"></textarea>
                  </div>
                </form>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="submit" 
                  form="vehicle-form"
                  disabled={actionLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-70"
                >
                  {actionLoading ? 'Saving...' : 'Save Vehicle'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
