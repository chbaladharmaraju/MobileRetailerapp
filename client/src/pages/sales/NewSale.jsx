import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import SearchableCustomerSelect from '../../components/common/SearchableCustomerSelect';
import SearchableItemSelect from '../../components/common/SearchableItemSelect';

const NewSale = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [newCustomer, setNewCustomer] = useState(null);
  const [items, setItems] = useState([{ productId: '', quantity: 1, name: '', price: '', isNew: false }]);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/inventory/products'),
      api.get('/customers')
    ]).then(([pRes, cRes]) => {
      setProducts(pRes.data.products || []);
      setCustomers(cRes.data.customers || []);
    });
  }, []);

  const addItem = () => setItems([...items, { productId: '', quantity: 1, name: '', price: '', isNew: false }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = value;
    
    // If selecting an existing product, autofill name and potentially price
    if (field === 'productId' && typeof value === 'string') {
        const p = products.find(prod => prod.id === value);
        if (p) {
            updated[i].name = p.name;
            updated[i].price = p.sellingPrice;
            updated[i].isNew = false;
        }
    } else if (field === 'productId' && value?.isNew) {
        // It's a brand new item
        updated[i].productId = '';
        updated[i].name = value.name;
        updated[i].isNew = true;
        updated[i].price = ''; // Let user enter
    }
    
    setItems(updated);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => {
      const price = item.isNew ? parseFloat(item.price || 0) : parseFloat(item.price || 0);
      return sum + (price * item.quantity);
    }, 0) - parseFloat(discount || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!customerName && !newCustomer) || items.some((i) => (!i.productId && !i.isNew))) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/sales', { 
        customerId, 
        customerName: newCustomer ? newCustomer.name : customerName, 
        customerPhone: newCustomer ? newCustomer.phone : customerPhone, 
        items, 
        discount, 
        paymentMode 
      });
      toast.success('Sale recorded successfully');
      navigate('/sales');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      
      <div className="flex justify-center mt-4 pb-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 sm:p-8 w-full max-w-3xl border border-white/[0.08]">
          <h2 className="text-lg font-semibold text-white mb-6">Create New Sale</h2>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Section */}
            <div className="space-y-4">
              <label className="text-[11px] font-semibold text-ag-text-dim uppercase tracking-[0.18em] ml-1 mb-2 block">Select or Add Customer</label>
              <SearchableCustomerSelect 
                customers={customers}
                value={customerId}
                onSelect={(id) => {
                    setCustomerId(id);
                    const c = customers.find(cust => cust.id === id);
                    if (c) {
                        setCustomerName(c.name);
                        setCustomerPhone(c.phone);
                        setNewCustomer(null);
                    }
                }}
                onNewCustomer={(cust) => {
                    setNewCustomer(cust);
                    if (cust) {
                        setCustomerName(cust.name);
                        setCustomerPhone(cust.phone || '');
                        setCustomerId('');
                    }
                }}
              />
            </div>

            {/* Products Section */}
            <div className="space-y-5 pt-2">
              <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-3">
                <label className="text-[11px] font-semibold text-ag-text-dim uppercase tracking-[0.18em] ml-1">Sale Items</label>
                <button type="button" onClick={addItem} className="flex items-center gap-2 text-xs font-bold text-white hover:text-ag-primary transition-all bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 active:scale-95">
                  <HiOutlinePlus className="w-3.5 h-3.5" />
                  Add Line Item
                </button>
              </div>
              
              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, scale: 0.98 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="flex flex-col sm:flex-row gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] shadow-sm"
                  >
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-ag-text-dim uppercase tracking-widest ml-1 mb-2 block">Item Name</label>
                      <SearchableItemSelect 
                        items={products}
                        onSelect={(val) => updateItem(i, 'productId', val)}
                        value={item.productId || (item.isNew ? { name: item.name, isNew: true } : '')}
                        placeholder="Search product..."
                      />
                    </div>
                    {item.isNew && (
                        <div className="w-full sm:w-40">
                           <label className="text-[10px] font-bold text-ag-text-dim uppercase tracking-widest ml-1 mb-2 block">Unit Price (₹)</label>
                           <input 
                            type="number" 
                            placeholder="Price"
                            value={item.price} 
                            onChange={(e) => updateItem(i, 'price', e.target.value)} 
                            className="ag-input w-full font-bold"
                           />
                        </div>
                    )}
                    <div className="w-full sm:w-24">
                        <label className="text-[10px] font-bold text-ag-text-dim uppercase tracking-widest ml-1 mb-2 block">Qty</label>
                        <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value))} className="ag-input w-full text-center font-bold" />
                    </div>
                    <div className="w-full sm:w-12 flex items-end justify-center pb-2">
                      {items.length > 1 ? (
                        <button type="button" onClick={() => removeItem(i)} className="text-ag-text-dim hover:text-red-400 transition-colors p-3 rounded-xl hover:bg-red-500/10">
                            <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      ) : <span className="w-12"></span>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Payment & Discount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-ag-text-dim uppercase tracking-[0.18em] ml-1 mb-1 block">Payment Mode</label>
                <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="ag-input">
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="credit">Credit (Pay Later)</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-ag-text-dim uppercase tracking-[0.18em] ml-1 mb-1 block">Discount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ag-text-dim font-bold">₹</span>
                  <input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} className="ag-input pl-10" />
                </div>
              </div>
            </div>

            {/* Total & Submit */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <p className="text-xs font-medium text-ag-text-dim uppercase tracking-wider mb-1">Total Amount</p>
                <p className="text-3xl font-semibold text-white tracking-tight">₹{getTotal().toLocaleString('en-IN')}</p>
              </div>
              <button type="submit" disabled={loading} className="ag-btn ag-btn-primary w-full sm:w-48 h-12 text-sm">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Complete Sale'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NewSale;
