import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineCurrencyRupee, 
  HiOutlineUser, 
  HiOutlineClock, 
  HiOutlinePlus,
  HiOutlineShieldCheck,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import SearchBar from '../../components/common/SearchBar';

const DistributorPayments = () => {
  const [payments, setPayments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    supplierId: '',
    amount: '',
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, suppliersRes] = await Promise.all([
        api.get('/suppliers/payments/daily'),
        api.get('/suppliers')
      ]);
      setPayments(paymentsRes.data || []);
      setSuppliers(suppliersRes.data || []);
    } catch (error) {
      toast.error('Failed to load payment data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPayments = payments.filter(p => 
    (p.distributor?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    (p.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const totalToday = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierId || !formData.amount) {
      return toast.error('Please select a supplier and enter amount');
    }

    try {
      setIsSubmitting(true);
      await api.post(`/suppliers/${formData.supplierId}/payment`, {
        amount: parseFloat(formData.amount),
        description: formData.description || 'Daily Settlement'
      });
      toast.success('Payment recorded successfully');
      setFormData({ supplierId: '', amount: '', description: '' });
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header & Quick Action */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black italic tracking-tight" style={{ color: 'var(--om-text)' }}>
            DAILY PAYMENTS
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--om-text-muted)' }}>
            Supplier Payouts & Settlements
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="ag-btn ag-btn-primary flex items-center gap-2"
        >
          <HiOutlinePlus className="w-4 h-4" /> 
          <span className="hidden sm:inline">Record Payment</span>
          <span className="sm:hidden">Pay</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="glass-card bg-om-card border border-om-border p-6 flex items-center justify-between relative overflow-hidden bg-gradient-to-br from-ag-primary/5 to-transparent">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ag-primary mb-1">Total Payout Today</p>
          <h2 className="text-4xl font-black tracking-tighter text-om-text">₹{totalToday.toLocaleString('en-IN')}</h2>
        </div>
        <HiOutlineCurrencyRupee className="w-20 h-20 absolute -right-4 -bottom-4 text-ag-primary/10" />
      </div>

      {/* Add Payment Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card bg-om-surface border border-om-border p-6 shadow-2xl">
              <h3 className="text-sm font-bold uppercase tracking-widest text-om-text mb-4">New Supplier Payout</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-om-text-muted ml-1">Supplier</label>
                    <select 
                      className="ag-input bg-om-bg"
                      value={formData.supplierId}
                      onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name} (Due: ₹{parseFloat(s.balanceOwed).toLocaleString('en-IN')})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-om-text-muted ml-1">Amount (₹)</label>
                    <input 
                      type="number"
                      className="ag-input bg-om-bg"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-om-text-muted ml-1">Description / Notes</label>
                  <input 
                    className="ag-input bg-om-bg"
                    placeholder="e.g. Cash payment for screen stock"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-om-text-muted hover:text-om-text">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="ag-btn ag-btn-primary px-8">
                    {isSubmitting ? 'Recording...' : 'Confirm Payout'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Logs */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-om-text-muted flex items-center gap-2">
          <HiOutlineClock className="w-4 h-4" /> Today's Payout History
        </h3>
        
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="Search by supplier or notes..."
        />
        
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-om-border border-t-ag-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[10px] uppercase font-bold text-om-text-muted tracking-widest">Loading history...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="glass-card bg-om-card border border-om-border p-12 text-center">
            <HiOutlineShieldCheck className="w-12 h-12 text-om-text-muted opacity-10 mx-auto mb-4" />
            <p className="text-om-text-secondary text-sm">No payments found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPayments.map((p, idx) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card bg-om-card border border-om-border p-4 flex justify-between items-center group hover:border-ag-primary/30 transition-colors"
                style={{ backgroundColor: 'var(--om-surface)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-om-bg border border-om-border flex items-center justify-center text-ag-primary shadow-inner">
                    <HiOutlineUser className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-om-text">{p.distributor?.name}</h4>
                    <p className="text-[10px] text-om-text-muted uppercase font-bold tracking-tight mt-0.5">{p.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[16px] font-black text-om-text">₹{parseFloat(p.amount).toLocaleString('en-IN')}</p>
                  <p className="text-[9px] font-bold text-om-text-muted uppercase tracking-tighter">
                    {new Date(p.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DistributorPayments;
