import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineArrowLeft, HiOutlineCog } from 'react-icons/hi';
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
    if (field === 'productId' && typeof value === 'string') {
      const p = products.find(prod => prod.id === value);
      if (p) { updated[i].name = p.name; updated[i].price = p.sellingPrice; updated[i].isNew = false; }
    } else if (field === 'productId' && value?.isNew) {
      updated[i].productId = ''; updated[i].name = value.name; updated[i].isNew = true; updated[i].price = '';
    }
    setItems(updated);
  };

  const getTotal = () => items.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity), 0) - parseFloat(discount || 0);

  const handleSubmit = async (e, saveAndNew = false) => {
    if (e) e.preventDefault();
    if ((!customerName && !newCustomer) || items.some((i) => (!i.productId && !i.isNew))) {
      toast.error('Please fill all required fields'); return;
    }
    setLoading(true);
    try {
      await api.post('/sales', { customerId, customerName: newCustomer ? newCustomer.name : customerName, customerPhone: newCustomer ? newCustomer.phone : customerPhone, items, discount, paymentMode });
      toast.success('Sale recorded successfully');
      if (saveAndNew) {
        setCustomerName(''); setCustomerPhone(''); setCustomerId(''); setNewCustomer(null);
        setItems([{ productId: '', quantity: 1, name: '', price: '', isNew: false }]); setDiscount(0);
      } else { navigate('/sales'); }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create sale'); }
    finally { setLoading(false); }
  };

  const invoiceNo = Math.floor(Math.random() * 100) + 1;
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

      {/* ═══ MOBILE NEW SALE ═══ */}
      <div className="md:hidden -mx-4 -mt-2 pb-32">
        {/* Mobile Top Bar */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--om-border)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full active:scale-95" style={{ color: 'var(--om-text)' }}>
              <HiOutlineArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-[17px] font-bold" style={{ color: 'var(--om-text)' }}>Sale</h1>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={paymentMode} 
              onChange={(e) => setPaymentMode(e.target.value)}
              className="px-3 py-1.5 text-[12px] font-bold rounded-full bg-ag-bg-input border border-ag-border outline-none transition-all focus:border-ag-primary ring-ag-primary/10"
              style={{ color: 'var(--om-text)' }}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="credit">Credit</option>
            </select>
            <button type="button" className="w-9 h-9 flex items-center justify-center rounded-full" style={{ color: 'var(--om-text-muted)' }}>
              <HiOutlineCog className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice No & Date */}
        <div className="flex justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--om-border)' }}>
          <div>
            <p className="text-[11px] font-semibold" style={{ color: 'var(--om-text-muted)' }}>Invoice No.</p>
            <p className="text-[14px] font-bold" style={{ color: 'var(--om-text)' }}>{invoiceNo} ▾</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold" style={{ color: 'var(--om-text-muted)' }}>Date</p>
            <p className="text-[14px] font-bold" style={{ color: 'var(--om-text)' }}>{today} ▾</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="px-4 py-5 space-y-5">
          <div className="rounded-xl p-1" style={{ border: '2px solid #3B82F6' }}>
            <label className="text-[11px] font-bold px-2" style={{ color: '#3B82F6' }}>Customer *</label>
            <SearchableCustomerSelect customers={customers} value={customerId}
              onSelect={(id) => { setCustomerId(id); const c = customers.find(cust => cust.id === id); if (c) { setCustomerName(c.name); setCustomerPhone(c.phone); setNewCustomer(null); } }}
              onNewCustomer={(cust) => { setNewCustomer(cust); if (cust) { setCustomerName(cust.name); setCustomerPhone(cust.phone || ''); setCustomerId(''); } }}
            />
          </div>
          <div className="rounded-xl p-3" style={{ border: '1px solid var(--om-border)' }}>
            <input type="tel" placeholder="Phone Number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full bg-transparent outline-none text-[14px] font-medium" style={{ color: 'var(--om-text)' }} />
          </div>

          {items.map((item, i) => (
            <div key={i} className="rounded-xl p-3 space-y-3" style={{ border: '1px solid var(--om-border)' }}>
              <SearchableItemSelect items={products} onSelect={(val) => updateItem(i, 'productId', val)} value={item.productId || (item.isNew ? { name: item.name, isNew: true } : '')} placeholder="Search product..." />
              {item.isNew && (
                <input type="number" placeholder="Unit Price (₹)" value={item.price} onChange={(e) => updateItem(i, 'price', e.target.value)} className="w-full bg-transparent outline-none text-[14px] font-medium px-1 py-1.5" style={{ color: 'var(--om-text)', borderBottom: '1px solid var(--om-border)' }} />
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--om-text-muted)' }}>Qty:</span>
                  <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value))} className="w-16 bg-transparent outline-none text-center font-bold text-[14px] rounded-lg py-1" style={{ color: 'var(--om-text)', border: '1px solid var(--om-border)' }} />
                </div>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} className="w-8 h-8 flex items-center justify-center rounded-full text-red-400 active:scale-95">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <button type="button" onClick={addItem} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98]" style={{ border: '1px solid var(--om-border)', color: '#3B82F6' }}>
            <HiOutlinePlus className="w-4 h-4" /> Add Items (Optional)
          </button>

          <div className="flex items-center justify-between py-4" style={{ borderBottom: '2px dashed var(--om-border)' }}>
            <span className="text-[15px] font-bold" style={{ color: 'var(--om-text)' }}>Total Amount</span>
            <span className="text-[18px] font-bold" style={{ color: 'var(--om-text)' }}>₹ {getTotal().toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-14 left-0 right-0 z-40 flex items-stretch" style={{ borderTop: '1px solid var(--om-border)', backgroundColor: 'var(--om-card)' }}>
          <button type="button" onClick={() => handleSubmit(null, true)} disabled={loading} className="flex-1 py-3.5 text-[13px] font-bold transition-all active:scale-[0.98]" style={{ color: 'var(--om-text-secondary)', borderRight: '1px solid var(--om-border)' }}>
            Save & New
          </button>
          <button type="button" onClick={() => handleSubmit(null, false)} disabled={loading} className="flex-[2] py-3.5 text-[14px] font-bold text-om-text transition-all active:scale-[0.98]" style={{ backgroundColor: '#EF4444' }}>
            {loading ? <div className="w-5 h-5 border-2 border-ag-border border-t-white rounded-full animate-spin mx-auto" /> : 'Save'}
          </button>
        </div>
      </div>

      {/* ═══ DESKTOP NEW SALE (unchanged) ═══ */}
      <div className="hidden md:block">
        <div className="flex justify-center mt-4 pb-20 sm:pb-12 px-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card bg-om-card border border-om-border p-5 sm:p-8 w-full max-w-3xl border border-om-border">
            <h2 className="text-lg font-bold text-om-text mb-6">Create New Sale</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[11px] font-semibold text-om-text-secondary uppercase tracking-[0.18em] ml-1 mb-2 block">Select or Add Customer</label>
                <SearchableCustomerSelect customers={customers} value={customerId}
                  onSelect={(id) => { setCustomerId(id); const c = customers.find(cust => cust.id === id); if (c) { setCustomerName(c.name); setCustomerPhone(c.phone); setNewCustomer(null); } }}
                  onNewCustomer={(cust) => { setNewCustomer(cust); if (cust) { setCustomerName(cust.name); setCustomerPhone(cust.phone || ''); setCustomerId(''); } }}
                />
              </div>
              <div className="space-y-5 pt-2">
                <div className="flex justify-between items-center mb-2 border-b border-om-border pb-3">
                  <label className="text-[11px] font-semibold text-om-text-secondary uppercase tracking-[0.18em] ml-1">Sale Items</label>
                  <button type="button" onClick={addItem} className="flex items-center gap-2 text-xs font-bold text-om-text-secondary hover:text-om-accent transition-all bg-om-surface hover:bg-om-card-hover px-4 py-2 rounded-xl border border-om-border active:scale-95 shadow-sm">
                    <HiOutlinePlus className="w-3.5 h-3.5" /> Add Line Item
                  </button>
                </div>
                <AnimatePresence>
                  {items.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="flex flex-col sm:flex-row gap-5 p-5 rounded-2xl bg-om-surface border border-om-border shadow-sm">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-om-text-secondary uppercase tracking-widest ml-1 mb-2 block">Item Name</label>
                        <SearchableItemSelect items={products} onSelect={(val) => updateItem(i, 'productId', val)} value={item.productId || (item.isNew ? { name: item.name, isNew: true } : '')} placeholder="Search product..." />
                      </div>
                      {item.isNew && (<div className="w-full sm:w-40"><label className="text-[10px] font-bold text-om-text-secondary uppercase tracking-widest ml-1 mb-2 block">Unit Price (₹)</label><input type="number" placeholder="Price" value={item.price} onChange={(e) => updateItem(i, 'price', e.target.value)} className="ag-input w-full font-bold" /></div>)}
                      <div className="w-full sm:w-24"><label className="text-[10px] font-bold text-om-text-secondary uppercase tracking-widest ml-1 mb-2 block">Qty</label><input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value))} className="ag-input w-full text-center font-bold" /></div>
                      <div className="w-full sm:w-12 flex items-end justify-center pb-2">{items.length > 1 ? (<button type="button" onClick={() => removeItem(i)} className="text-om-text-secondary hover:text-red-400 transition-colors p-3 rounded-xl hover:bg-red-500/10"><HiOutlineTrash className="w-5 h-5" /></button>) : <span className="w-12"></span>}</div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                <div className="space-y-3"><label className="text-[11px] font-semibold text-om-text-secondary uppercase tracking-[0.18em] ml-1 mb-1 block">Payment Mode</label><select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="ag-input"><option value="cash">Cash</option><option value="card">Card</option><option value="upi">UPI</option><option value="credit">Credit (Pay Later)</option></select></div>
                <div className="space-y-3"><label className="text-[11px] font-semibold text-om-text-secondary uppercase tracking-[0.18em] ml-1 mb-1 block">Discount (₹)</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-om-text-secondary font-bold">₹</span><input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} className="ag-input pl-10" /></div></div>
              </div>
              <div className="mt-10 pt-8 border-t border-om-border flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="text-center sm:text-left"><p className="text-[11px] font-bold text-om-text-secondary uppercase tracking-[0.2em] mb-1.5">Total Amount</p><p className="text-3xl font-bold text-om-accent tracking-tight">₹{getTotal().toLocaleString('en-IN')}</p></div>
                <button type="submit" disabled={loading} className="ag-btn ag-btn-primary w-full sm:w-56 h-14 text-[15px] font-bold shadow-lg shadow-om-accent-glow">{loading ? <div className="w-5 h-5 border-3 border-ag-border border-t-white rounded-full animate-spin" /> : 'Complete Sale'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewSale;
