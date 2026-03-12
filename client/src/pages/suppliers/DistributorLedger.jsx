import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiOutlineCurrencyRupee, HiOutlineDocumentText } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

const DistributorLedger = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [distributor, setDistributor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDesc, setPaymentDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDistributorDetails();
  }, [id]);

  const fetchDistributorDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/suppliers/${id}`);
      setDistributor(data);
    } catch (err) {
      toast.error('Failed to load supplier details');
      navigate('/suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post(`/suppliers/${id}/payment`, {
        amount: parseFloat(paymentAmount),
        description: paymentDesc
      });
      toast.success('Payment recorded successfully');
      setIsPaymentModalOpen(false);
      setPaymentAmount('');
      setPaymentDesc('');
      fetchDistributorDetails();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-ag-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/suppliers')}
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{distributor.name}</h1>
            <p className="text-sm text-ag-text-dim mt-1">{distributor.phone}</p>
          </div>
        </div>
        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-ag-primary text-black rounded-lg font-medium hover:bg-ag-primary/90 transition-all shadow-[0_0_20px_rgba(255,165,0,0.3)] text-sm"
        >
          <HiOutlineCurrencyRupee className="w-5 h-5" /> Record Payment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Profile */}
        <div className="space-y-6">
          <motion.div variants={itemVariants} className="glass-card p-6 border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
            <p className="text-xs font-semibold text-red-400 uppercase tracking-widest">To Pay (Credit Balance)</p>
            <h2 className="text-4xl font-bold text-white mt-2 tracking-tight">
              ₹{parseFloat(distributor.balanceOwed).toLocaleString('en-IN')}
            </h2>
            <p className="text-xs text-ag-text-dim mt-2">Total outstanding debt to this supplier</p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-6 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Supplier Profile</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[11px] text-ag-text-dim uppercase tracking-wider mb-1">Total Purchases</p>
                <p className="text-sm font-medium text-white">{distributor.purchases.length} Shipments Processed</p>
              </div>
              <div>
                <p className="text-[11px] text-ag-text-dim uppercase tracking-wider mb-1">Email</p>
                <p className="text-sm font-medium text-white">{distributor.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[11px] text-ag-text-dim uppercase tracking-wider mb-1">Address</p>
                <p className="text-sm font-medium text-white">{distributor.address || 'N/A'}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Transaction History */}
        <motion.div variants={itemVariants} className="glass-card lg:col-span-2 overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <h3 className="font-semibold text-white tracking-wide">Ledger History</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[600px] p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
            {distributor.transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 opacity-50">
                <HiOutlineDocumentText className="w-12 h-12 text-white mb-3" />
                <p className="text-sm text-white font-medium">No transactions recorded yet.</p>
              </div>
            ) : (
              distributor.transactions.map((tx) => (
                <div key={tx.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-full ${tx.type === 'CREDIT' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                      {tx.type === 'CREDIT' ? <HiOutlineDocumentText className="w-5 h-5" /> : <HiOutlineCurrencyRupee className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {tx.type === 'CREDIT' ? 'Stock Intake (Purchased)' : 'Payment Sent'}
                      </p>
                      <p className="text-xs text-ag-text-dim mt-0.5">{tx.description}</p>
                      {tx.user?.name && (
                        <p className="text-[10px] text-ag-text-muted mt-1 uppercase tracking-wider flex items-center gap-1">
                          Logged by {tx.user.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-semibold ${tx.type === 'CREDIT' ? 'text-red-400' : 'text-green-400'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'} ₹{parseFloat(tx.amount).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-ag-text-dim mt-1 tracking-wider uppercase">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-card w-full max-w-md p-6 border border-white/10 shadow-2xl relative"
          >
            <h2 className="text-xl font-bold text-white mb-2">Record Payment</h2>
            <p className="text-sm text-ag-text-dim mb-6">Log money sent to settle your debt with this supplier.</p>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-ag-text-muted mb-2 uppercase tracking-wider">Payment Amount (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-white sm:text-lg">₹</span>
                  </div>
                  <input
                    type="number" required min="1" step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    max={parseFloat(distributor.balanceOwed)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder-ag-text-dim focus:border-ag-primary outline-none transition-all font-medium"
                    placeholder="0.00"
                  />
                </div>
                {parseFloat(distributor.balanceOwed) > 0 && (
                  <p className="text-[11px] font-medium text-red-400/80 mt-2 tracking-wide text-right">
                    Max to pay: ₹{parseFloat(distributor.balanceOwed).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-ag-text-muted mb-2 uppercase tracking-wider">Notes / Reference (Optional)</label>
                <input
                  type="text"
                  value={paymentDesc}
                  onChange={(e) => setPaymentDesc(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-ag-text-dim focus:border-ag-primary outline-none transition-all"
                  placeholder="e.g. Bank Transfer Ref #1234"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !paymentAmount || parseFloat(paymentAmount) <= 0}
                  className="px-5 py-2.5 text-sm font-semibold bg-ag-primary text-black rounded-lg hover:bg-ag-primary/90 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(255,165,0,0.2)]"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};

export default DistributorLedger;
