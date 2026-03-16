import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineCurrencyRupee, HiOutlineDeviceMobile } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ResaleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [intake, setIntake] = useState(null);
  const [form, setForm] = useState({ buyerName: '', buyerPhone: '', sellingPrice: '', paymentMode: 'cash' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchIntake = async () => {
      try {
        const { data } = await api.get(`/secondhand/intake/${id}`);
        setIntake(data);
        setForm(prev => ({ ...prev, sellingPrice: (parseFloat(data.buyingPrice) * 1.2).toFixed(0) }));
      } catch (err) {
        toast.error('Failed to load phone details');
        navigate('/secondhand');
      } finally {
        setLoading(false);
      }
    };
    fetchIntake();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/secondhand/resale', {
        intakeId: id,
        ...form
      });
      toast.success('Phone sold successfully!');
      navigate('/secondhand');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record sale');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateProfit = () => {
    if (!intake || !form.sellingPrice) return 0;
    return parseFloat(form.sellingPrice) - parseFloat(intake.buyingPrice);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  if (!intake) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/secondhand" className="p-2.5 rounded-xl bg-om-surface hover:bg-om-border text-om-text transition-all hover:scale-105 active:scale-95 border-om-border">
          <HiOutlineArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-om-text tracking-tight flex items-center gap-2">
            Finalize Sale
            <span className="px-2.5 py-0.5 text-[9px] font-black tracking-widest uppercase bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/20">Checkout</span>
          </h1>
          <p className="text-sm text-om-text-muted mt-1">Recording resale for {intake.brand} {intake.model}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Device Info (Read Only) */}
        <div className="space-y-6">
          <div className="glass-card bg-om-card border border-om-border p-6 border-om-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px] pointer-events-none" />
            <h2 className="text-xs font-bold text-om-text uppercase tracking-widest mb-6 flex items-center gap-2">
              <HiOutlineDeviceMobile className="w-4 h-4 text-orange-400" />
              Device Overview
            </h2>
            
            <div className="space-y-5 relative z-10">
              <div>
                <p className="text-[10px] text-om-text-muted uppercase tracking-widest font-bold mb-1">Brand & Model</p>
                <p className="text-base font-bold text-om-text">{intake.brand} {intake.model}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-om-text-muted uppercase tracking-widest font-bold mb-1">IMEI</p>
                  <p className="text-sm font-mono text-slate-300">{intake.imei}</p>
                </div>
                <div>
                  <p className="text-[10px] text-om-text-muted uppercase tracking-widest font-bold mb-1">Condition</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${
                          intake.condition === 'EXCELLENT' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          intake.condition === 'GOOD' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          intake.condition === 'FAIR' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                    {intake.condition}
                  </span>
                </div>
              </div>
              <div className="pt-5 border-t border-om-border">
                <p className="text-[10px] text-om-text-muted uppercase tracking-widest font-bold mb-1">Initial Buy Price</p>
                <p className="text-2xl font-black text-om-text tracking-tight">₹{parseFloat(intake.buyingPrice).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {intake.notes && (
            <div className="glass-card bg-om-card border border-om-border p-5 border-om-border bg-om-surface">
               <h3 className="text-[10px] text-om-text-muted uppercase tracking-widest font-bold mb-2">Original Intake Notes</h3>
               <p className="text-sm text-slate-300 italic leading-relaxed">"{intake.notes}"</p>
            </div>
          )}
        </div>

        {/* Right: Resale Form */}
        <div className="lg:col-span-2">
          <div className="glass-card bg-om-card border border-om-border p-8 sm:p-10 border-blue-500/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            <h2 className="text-sm font-bold text-om-text uppercase tracking-widest mb-8 flex items-center gap-2 border-b border-om-border pb-4 relative z-10">
              <HiOutlineCurrencyRupee className="w-5 h-5 text-blue-400" />
              Transaction Details
            </h2>

            <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-om-text-muted uppercase tracking-widest ml-1 block">Buyer Full Name</label>
                  <input type="text" value={form.buyerName} onChange={(e) => setForm({ ...form, buyerName: e.target.value })} placeholder="e.g. Vikram Singh" className="ag-input focus:border-blue-500" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-om-text-muted uppercase tracking-widest ml-1 block">Phone Number</label>
                  <input type="tel" value={form.buyerPhone} onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })} placeholder="e.g. 9876543210" className="ag-input focus:border-blue-500" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-om-text-muted uppercase tracking-widest ml-1 block">Final Selling Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-om-text-muted font-bold">₹</span>
                    <input type="number" min={0} value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} placeholder="0.00" className="ag-input pl-10 text-xl font-bold text-om-text focus:border-blue-500" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-om-text-muted uppercase tracking-widest ml-1 block">Payment Method</label>
                  <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} className="ag-input focus:border-blue-500">
                    <option value="cash">Cash Payment</option>
                    <option value="online">Online Transfer (UPI/Card)</option>
                    <option value="credit">Store Credit / Installment</option>
                  </select>
                </div>
              </div>

              {/* Profit Indicator */}
              <div className="bg-om-surface rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-om-border relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                <div className="text-center sm:text-left relative z-10">
                  <p className="text-[10px] text-om-text-muted font-bold uppercase tracking-widest mb-1.5">Net Profit Projection</p>
                  <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                    <p className={`text-4xl font-black tracking-tighter ${calculateProfit() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {calculateProfit() >= 0 ? '+' : '-'}₹{Math.abs(calculateProfit()).toLocaleString('en-IN')}
                    </p>
                    {calculateProfit() > 0 && <span className="text-xs font-bold text-green-500/70 uppercase tracking-wider">Profit</span>}
                  </div>
                </div>
                <div className="hidden sm:block w-px h-16 bg-om-border" />
                <div className="flex items-center gap-4 relative z-10">
                   <div className={`p-4 rounded-2xl border ${calculateProfit() > 0 ? 'bg-green-500/10 border-green-500/20 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]' : 'bg-om-surface border-om-border text-om-text-muted'}`}>
                     <HiOutlineCheckCircle className="w-8 h-8" />
                   </div>
                   <p className="text-[11px] text-om-text-muted max-w-[140px] leading-relaxed hidden md:block">
                     Transactions are recorded securely and linked to the daily ledger.
                   </p>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full sm:w-auto inline-flex justify-center items-center px-10 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-om-text shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-ag-border border-t-white rounded-full animate-spin" />
                  ) : (
                    'Confirm Sale & Collect'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResaleForm;
