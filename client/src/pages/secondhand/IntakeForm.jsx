import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiOutlineDeviceMobile, HiOutlineUser, HiOutlineCamera, HiOutlineDocumentText } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import PhotoUpload from '../../components/common/PhotoUpload';

const IntakeForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ customerName: '', customerPhone: '', brand: '', model: '', imei: '', buyingPrice: '', condition: 'GOOD', notes: '' });
  const [devicePhotos, setDevicePhotos] = useState([]);
  const [kycPhotos, setKycPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/secondhand/intake', {
        ...form,
        devicePhotos,
        kycPhotos,
      });
      toast.success('Phone intake recorded successfully');
      navigate('/secondhand');
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to record intake'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="max-w-4xl mx-auto pb-12">
      
      <div className="flex items-center gap-4 mb-8">
        <Link to="/secondhand" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all hover:scale-105 active:scale-95 border border-white/5">
          <HiOutlineArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Device Intake Form
            <span className="px-2.5 py-0.5 text-[9px] font-black tracking-widest uppercase bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/20">New</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Record a pre-owned device purchase from a customer securely.</p>
        </div>
      </div>

      <div className="glass-card p-6 sm:p-10 border-orange-500/10 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

        <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
          
          {/* Section: Seller Info */}
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
              <HiOutlineUser className="w-5 h-5 text-orange-400" /> Seller Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1 block">Full Name</label>
                <input type="text" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="e.g. Rahul Sharma" className="ag-input focus:border-orange-500 focus:ring-orange-500/20" required />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1 block">Phone Number (Optional)</label>
                <input type="tel" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} placeholder="e.g. 9876543210" className="ag-input focus:border-orange-500 focus:ring-orange-500/20" />
              </div>
            </div>
          </div>

          {/* Section: Device Info */}
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
              <HiOutlineDeviceMobile className="w-5 h-5 text-orange-400" /> Device Specifics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1 block">Brand</label>
                <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Apple, Samsung" className="ag-input focus:border-orange-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1 block">Model</label>
                <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="e.g. iPhone 13 Pro 128GB" className="ag-input focus:border-orange-500" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1 block">IMEI Number</label>
                <input value={form.imei} onChange={(e) => setForm({ ...form, imei: e.target.value })} placeholder="15-digit IMEI" className="ag-input font-mono text-sm focus:border-orange-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1 block">Condition</label>
                <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="ag-input focus:border-orange-500">
                  <option value="EXCELLENT">Excellent (Like new, no scratches)</option>
                  <option value="GOOD">Good (Minor signs of wear)</option>
                  <option value="FAIR">Fair (Visible scratches or dents)</option>
                  <option value="POOR">Poor (Requires repairs)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1 block">Agreed Buying Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                  <input type="number" min="0" value={form.buyingPrice} onChange={(e) => setForm({ ...form, buyingPrice: e.target.value })} placeholder="0.00" className="ag-input pl-10 text-lg font-bold text-white focus:border-orange-500" required />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1 block">Notes & Included Items</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="E.g. Includes original box, charger, bill..." className="ag-input resize-none focus:border-orange-500" rows="3" />
            </div>
          </div>

          {/* Section: Photos */}
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
              <HiOutlineCamera className="w-5 h-5 text-orange-400" /> Verification Photos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <PhotoUpload
                  label="Device Photos (Front/Back)"
                  photos={devicePhotos}
                  onChange={setDevicePhotos}
                  maxFiles={4}
                />
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <PhotoUpload
                  label="KYC / Aadhar Card Proof"
                  photos={kycPhotos}
                  onChange={setKycPhotos}
                  maxFiles={2}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <HiOutlineDocumentText className="w-4 h-4" /> Ensure all details are accurate for compliance.
            </p>
            <button type="submit" disabled={loading} className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Device Intake'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default IntakeForm;
