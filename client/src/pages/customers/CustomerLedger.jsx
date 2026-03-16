import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineArrowLeft, HiOutlineCurrencyRupee, HiOutlineCash, HiOutlineDocumentText } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CustomerLedger = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', paymentMode: 'cash', notes: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate totals from transactions
  const totalCredit = transactions.filter(t => t.type === 'CREDIT').reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const totalPaid = transactions.filter(t => t.type === 'PAYMENT').reduce((acc, t) => acc + parseFloat(t.amount), 0);


  const fetchLedger = async () => {
    try {
      const { data } = await api.get(`/credit/${id}`);
      setCustomer(data.customer);
      setTransactions(data.transactions);
    } catch (err) {
      toast.error('Failed to load credit ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [id]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      if (parseFloat(paymentForm.amount) <= 0) return toast.error('Amount must be positive');
      if (parseFloat(paymentForm.amount) > parseFloat(customer.creditBalance)) return toast.error('Payment exceeds outstanding balance');

      await api.post('/credit/payment', {
        customerId: id,
        ...paymentForm
      });

      toast.success('Payment recorded successfully');
      setShowPaymentModal(false);
      setPaymentForm({ amount: '', paymentMode: 'cash', notes: '' });
      fetchLedger();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    }
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount).toLocaleString('en-IN')}`;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-ag-border border-t-white rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      
      <div className="flex items-center gap-4 mb-6">
        <Link to="/customers" className="p-2 rounded-lg bg-ag-bg-card hover:bg-ag-bg-card text-ag-text transition-colors">
          <HiOutlineArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-ag-text tracking-tight">{customer?.name}</h1>
          <p className="text-sm text-ag-text-muted">{customer?.phone}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 border border-ag-border md:col-span-2 flex flex-col justify-center">
          <p className="text-sm font-medium text-ag-text-muted tracking-widest uppercase mb-6 flex items-center gap-2">
            Party Balance Summary
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-ag-text-dim mb-1">Total Credit Given</p>
              <h3 className="text-2xl font-bold tracking-tight text-ag-text">{formatCurrency(totalCredit)}</h3>
            </div>
            <div className="border-l border-ag-border pl-6">
              <p className="text-[10px] font-bold tracking-widest uppercase text-ag-text-dim mb-1">Total Paid to Us</p>
              <h3 className="text-2xl font-bold tracking-tight text-green-400">{formatCurrency(totalPaid)}</h3>
            </div>
            <div className="border-l border-ag-border pl-6 rounded-r-xl bg-gradient-to-r from-white/[0.02] to-transparent">
              <p className="text-[10px] font-bold tracking-widest uppercase text-ag-text-dim mb-1">Current Due</p>
              <h2 className={`text-4xl font-bold tracking-tight ${parseFloat(customer?.creditBalance) > 0 ? 'text-red-400' : 'text-ag-text'}`}>
                {formatCurrency(customer?.creditBalance || 0)}
              </h2>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6 flex flex-col justify-center border-t-2 border-ag-primary bg-black/40">
           <button 
              onClick={() => setShowPaymentModal(true)} 
              disabled={parseFloat(customer?.creditBalance) <= 0}
              className="ag-btn ag-btn-primary w-full py-4 text-base shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <HiOutlineCurrencyRupee className="w-5 h-5" /> Receive Payment
           </button>
           <p className="text-xs text-ag-text-dim text-center mt-3">Record money received against the outstanding credit balance.</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-ag-border bg-black/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-semibold text-ag-text tracking-wide flex items-center gap-2">
               <HiOutlineDocumentText className="w-4 h-4" /> Transaction History
            </h3>
            <span className="text-xs font-medium text-ag-text-muted px-2.5 py-1 bg-ag-bg-card rounded-full">{transactions.length} records</span>
          </div>
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Search transactions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-ag-bg-card border border-ag-border rounded-lg px-3 py-1.5 text-xs text-ag-text focus:border-ag-primary outline-none transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="ag-table w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.filter(tx => 
                tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                tx.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.amount?.toString().includes(searchTerm)
              ).length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-ag-text-dim text-sm italic">No transactions found matching your search</td>
                </tr>
              ) : (
                transactions.filter(tx => 
                  tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  tx.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  tx.amount?.toString().includes(searchTerm)
                ).map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="text-sm text-ag-text-muted whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td>
                      <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded ${
                        tx.type === 'CREDIT' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 border border-green-500/20 text-green-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="text-sm text-ag-text max-w-[200px] truncate">{tx.description}</td>
                    <td className={`text-right font-semibold tracking-wide ${tx.type === 'CREDIT' ? 'text-red-400' : 'text-green-400'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0a0a0a] border border-ag-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <h3 className="text-lg font-semibold text-ag-text mb-6">Receive Credit Payment</h3>
              
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-ag-text-dim uppercase tracking-wider ml-1 mb-1 block">Amount Received (₹)</label>
                  <div className="relative">
                    <HiOutlineCash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ag-text-dim" />
                    <input 
                      type="number" 
                      step="0.01"
                      className="ag-input pl-10" 
                      placeholder="e.g. 5000" 
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                      required
                    />
                  </div>
                  <p className="text-[11px] text-ag-text-muted mt-1 ml-1">Max acceptable: {formatCurrency(customer?.creditBalance)}</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-ag-text-dim uppercase tracking-wider ml-1 mb-1 block">Payment Mode</label>
                  <select 
                    className="ag-input"
                    value={paymentForm.paymentMode}
                    onChange={(e) => setPaymentForm({...paymentForm, paymentMode: e.target.value})}
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI / Online</option>
                    <option value="card">Card</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-ag-text-dim uppercase tracking-wider ml-1 mb-1 block">Reference / Notes (Optional)</label>
                  <textarea 
                    className="ag-input min-h-[80px] py-3" 
                    placeholder="Transaction ID or notes..."
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowPaymentModal(false)} className="ag-btn bg-ag-bg-card hover:bg-ag-bg-card text-ag-text flex-1 border border-ag-border">
                    Cancel
                  </button>
                  <button type="submit" className="ag-btn ag-btn-primary flex-1">
                    Process Payment
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CustomerLedger;
