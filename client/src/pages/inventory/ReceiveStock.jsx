import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlinePlus, HiOutlineUserGroup, HiOutlineTrash, HiOutlineCube } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import SearchableDistributorSelect from '../../components/common/SearchableDistributorSelect';
import SearchableItemSelect from '../../components/common/SearchableItemSelect';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

const ReceiveStock = () => {
  const navigate = useNavigate();
  const [distributors, setDistributors] = useState([]);
  const [products, setProducts] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [distributorId, setDistributorId] = useState('');
  const [newDistributor, setNewDistributor] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');
  
  // Selected Items to Intake
  const [items, setItems] = useState([]);

  // Modal State for adding items to the list
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemType, setItemType] = useState('PRODUCT'); // PRODUCT or SPARE_PART
  const [selectedItemData, setSelectedItemData] = useState(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemCost, setItemCost] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [distRes, prodRes, partsRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/inventory/products'),
        api.get('/inventory/parts')
      ]);
      setDistributors(distRes.data || []);
      setProducts(prodRes.data.products || []);
      setSpareParts(partsRes.data.parts || []);
    } catch (err) {
      toast.error('Failed to load required data');
    } finally {
      setLoading(false);
    }
  };

  const addItemToList = () => {
    if (!selectedItemData || itemQuantity < 1 || !itemCost) {
      toast.error('Please fill in all item details correctly');
      return;
    }

    let itemToAdd;
    
    // Check if it's an existing item or a new one
    if (typeof selectedItemData === 'string') {
        const sourceItem = (itemType === 'PRODUCT' ? products : spareParts).find(p => p.id === selectedItemData);
        if (!sourceItem) return;
        itemToAdd = {
            id: sourceItem.id,
            name: sourceItem.name,
            itemType: itemType,
            isNew: false
        };
    } else if (selectedItemData.isNew) {
        itemToAdd = {
            id: null,
            name: selectedItemData.name,
            itemType: itemType,
            isNew: true
        };
    }

    if (!itemToAdd) return;

    setItems([...items, {
      ...itemToAdd,
      quantity: parseInt(itemQuantity),
      unitCost: parseFloat(itemCost),
      totalRowCost: parseInt(itemQuantity) * parseFloat(itemCost)
    }]);

    setIsItemModalOpen(false);
    // Reset modal states
    setSelectedItemData(null);
    setItemQuantity(1);
    setItemCost('');
  };

  const removeItem = (indexToRemove) => {
    setItems(items.filter((_, i) => i !== indexToRemove));
  };

  const totalPurchaseCost = items.reduce((sum, item) => sum + item.totalRowCost, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!distributorId && !newDistributor) return toast.error('Please select or add a distributor');
    if (items.length === 0) return toast.error('Please add at least one item');
    
    if (paymentStatus === 'PARTIAL' && (!amountPaid || parseFloat(amountPaid) >= totalPurchaseCost)) {
      return toast.error('Partial payment amount must be less than the total cost');
    }

    try {
      setIsSubmitting(true);
      await api.post('/suppliers/intake', {
        distributorId,
        newDistributor,
        items: items.map(i => ({ id: i.id, itemType: i.itemType, quantity: i.quantity, unitCost: i.unitCost })),
        totalCost: totalPurchaseCost,
        paymentStatus,
        amountPaid: paymentStatus === 'PARTIAL' ? parseFloat(amountPaid) : undefined,
        notes
      });
      
      toast.success('Inventory received successfully!');
      navigate('/inventory');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record inventory intake');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-8 h-8 border-2 border-ag-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="max-w-5xl mx-auto space-y-6">
      
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/inventory')} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
          <HiOutlineArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Receive Stock</h1>
          <p className="text-sm text-ag-text-dim mt-1">Log incoming inventory from a distributor.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Distributor Info */}
        <motion.div variants={itemVariants} className="glass-card p-6 border border-white/5">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <HiOutlineUserGroup className="w-5 h-5 text-ag-primary" /> 1. Supplier Source
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-ag-text-muted mb-3 uppercase tracking-wider">Select or Type Supplier Name *</label>
              <SearchableDistributorSelect 
                distributors={distributors}
                onSelect={(id) => {
                    setDistributorId(id);
                    if (id) setNewDistributor(null);
                }}
                value={distributorId}
                onNewDistributor={(dist) => {
                    setNewDistributor(dist);
                    if (dist) setDistributorId('');
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Step 2: Items List */}
        <motion.div variants={itemVariants} className="glass-card p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <HiOutlineCube className="w-5 h-5 text-ag-primary" /> 2. Items Received
            </h2>
            <button
              type="button"
              onClick={() => setIsItemModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-all border border-white/10"
            >
              <HiOutlinePlus className="w-4 h-4" /> Add Item
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-xl bg-white/[0.01]">
              <p className="text-sm font-medium text-ag-text-dim">No items added to this delivery yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="py-3 px-4 text-xs font-semibold text-ag-text-muted uppercase tracking-wider">Item Name</th>
                    <th className="py-3 px-4 text-xs font-semibold text-ag-text-muted uppercase tracking-wider">Type</th>
                    <th className="py-3 px-4 text-xs font-semibold text-ag-text-muted uppercase tracking-wider text-right">Qty</th>
                    <th className="py-3 px-4 text-xs font-semibold text-ag-text-muted uppercase tracking-wider text-right">Unit Cost</th>
                    <th className="py-3 px-4 text-xs font-semibold text-ag-text-muted uppercase tracking-wider text-right">Total</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-white/[0.01]">
                      <td className="py-3 px-4 text-sm font-medium text-white">{item.name}</td>
                      <td className="py-3 px-4 text-xs">
                        <span className={`px-2 py-1 rounded-md border ${item.itemType === 'PRODUCT' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                          {item.itemType === 'PRODUCT' ? 'New Phone' : 'Spare Part'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-white">{item.quantity}</td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-white">₹{item.unitCost.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-white">₹{item.totalRowCost.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right">
                        <button type="button" onClick={() => removeItem(index)} className="p-1.5 text-ag-text-dim hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors">
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-white/[0.02]">
                    <td colSpan="4" className="py-4 px-4 text-sm font-semibold text-white text-right">Grand Total:</td>
                    <td className="py-4 px-4 text-lg font-bold text-ag-primary text-right">₹{totalPurchaseCost.toLocaleString('en-IN')}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Step 3: Payment Tracking */}
        <motion.div variants={itemVariants} className="glass-card p-6 border border-white/5">
          <h2 className="text-lg font-semibold text-white mb-6">3. Payment & Ledger</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-ag-text-muted mb-2 uppercase tracking-wider">Payment Status *</label>
              <select
                value={paymentStatus}
                onChange={(e) => {
                  setPaymentStatus(e.target.value);
                  if (e.target.value !== 'PARTIAL') setAmountPaid('');
                }}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white focus:border-ag-primary transition-all [&>option]:bg-[#111] [&>option]:text-white"
              >
                <option value="PAID">Paid in Full (Cash/Transfer)</option>
                <option value="PARTIAL">Partially Paid</option>
                <option value="CREDIT">Bought on Credit (Owe Total Amount)</option>
              </select>
              {paymentStatus === 'CREDIT' && (
                <p className="text-[11px] text-red-400 font-medium mt-2 tracking-wide">
                  This will add ₹{totalPurchaseCost.toLocaleString('en-IN')} to the Supplier's outstanding debt balance.
                </p>
              )}
            </div>

            {paymentStatus === 'PARTIAL' && (
              <div>
                <label className="block text-xs font-semibold text-ag-text-muted mb-2 uppercase tracking-wider">Amount Paid Now (₹)</label>
                <input
                  type="number" required min="1" step="0.01" max={totalPurchaseCost - 1}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-ag-text-dim focus:border-ag-primary transition-all font-medium"
                  placeholder="0.00"
                />
                 <p className="text-[11px] text-red-400 font-medium mt-2 tracking-wide">
                  Remaining ₹{(totalPurchaseCost - (parseFloat(amountPaid) || 0)).toLocaleString('en-IN')} will be logged as debt.
                </p>
              </div>
            )}
            
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-ag-text-muted mb-2 uppercase tracking-wider">Invoice Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-ag-text-dim focus:border-ag-primary transition-all"
                placeholder="e.g. Received via BlueDart tracking #9182312"
              />
            </div>
          </div>
        </motion.div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="px-6 py-3 text-sm font-semibold text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || items.length === 0 || (!distributorId && !newDistributor)}
              className="flex items-center gap-2 px-8 py-3 text-sm font-semibold bg-ag-primary text-black rounded-xl hover:bg-ag-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,165,0,0.3)]"
            >
              <HiOutlineCheckCircle className="w-5 h-5" />
              {isSubmitting ? 'Logging...' : 'Confirm Delivery'}
            </button>
          </div>
      </form>

      {/* Add Item Modal */}
      <AnimatePresence>
        {isItemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-md p-6 border border-white/10 shadow-2xl relative"
            >
              <h2 className="text-xl font-bold text-white mb-6">Add Item to Delivery</h2>
              
              <div className="space-y-4">
                {/* Toggle Type */}
                <div className="flex p-1 bg-black/40 border border-white/10 rounded-lg">
                  <button
                    onClick={() => setItemType('PRODUCT')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${itemType === 'PRODUCT' ? 'bg-white text-black' : 'text-ag-text-muted hover:text-white'}`}
                  >
                    New Phones
                  </button>
                  <button
                    onClick={() => setItemType('SPARE_PART')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${itemType === 'SPARE_PART' ? 'bg-white text-black' : 'text-ag-text-muted hover:text-white'}`}
                  >
                    Spare Parts
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ag-text-muted mb-3 uppercase tracking-wider">Select Product/Part *</label>
                  <SearchableItemSelect 
                    items={itemType === 'PRODUCT' ? products : spareParts}
                    onSelect={setSelectedItemData}
                    value={selectedItemData}
                    placeholder={`Search or type a ${itemType === 'PRODUCT' ? 'phone' : 'part'}...`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ag-text-muted mb-2 uppercase tracking-wider">Quantity Received</label>
                    <input
                      type="number" min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-ag-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ag-text-muted mb-2 uppercase tracking-wider">Cost per Unit (₹)</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={itemCost}
                      onChange={(e) => setItemCost(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-ag-primary transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3 justify-end">
                  <button
                    onClick={() => setIsItemModalOpen(false)}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addItemToList}
                    disabled={!selectedItemId || !itemCost}
                    className="px-5 py-2.5 text-sm font-semibold bg-ag-primary text-black rounded-lg hover:bg-ag-primary/90 transition-colors disabled:opacity-50"
                  >
                    Add to List
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default ReceiveStock;
