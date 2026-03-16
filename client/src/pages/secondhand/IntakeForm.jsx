import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineArrowLeft,
  HiOutlinePhone,
  HiOutlineUser, 
  HiOutlineCamera, 
  HiOutlineDocumentText, 
  HiOutlineIdentification,
  HiOutlineDeviceMobile
} from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import PhotoUpload from '../../components/common/PhotoUpload';
import SearchableCustomerSelect from '../../components/common/SearchableCustomerSelect';

const IntakeForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    customerId: '', 
    customerName: '', 
    customerPhone: '', 
    brand: '', 
    model: '', 
    imei: '', 
    buyingPrice: '', 
    condition: 'GOOD', 
    notes: '' 
  });
  const [devicePhotos, setDevicePhotos] = useState([]);
  const [kycPhotos, setKycPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data.customers || res.data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="max-w-4xl mx-auto pb-32 md:pb-24">
      
      <div className="flex items-center gap-4 mb-8">
        <Link to="/secondhand" className="p-2.5 rounded-xl bg-om-surface hover:bg-om-border text-om-text transition-all hover:scale-105 active:scale-95 border border-om-border">
          <HiOutlineArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-om-text tracking-tight flex items-center gap-2">
            Device Intake Form
            <span className="px-2.5 py-0.5 text-[9px] font-black tracking-widest uppercase bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/20">New</span>
          </h1>
          <p className="text-sm text-om-text-muted mt-1">Record a pre-owned device purchase from a customer securely.</p>
        </div>
      </div>

      <div className="glass-card bg-om-card border border-om-border p-6 sm:p-10 border-orange-500/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

        <form className="relative z-10 space-y-10">
          
          <div className="space-y-6">
            <h2 className="text-[13px] font-black text-om-text uppercase tracking-[0.2em] flex items-center gap-2.5 border-b border-om-border pb-4">
              <HiOutlineUser className="w-5 h-5 text-orange-400" /> Seller Details
            </h2>
            
            {form.customerId || newCustomer ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card bg-om-card border border-om-border p-5 border-orange-500/30 bg-orange-500/5 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                    <HiOutlineIdentification className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <h3 className="text-[15px] font-black text-om-text">{form.customerName}</h3>
                       {newCustomer && <span className="text-[9px] font-black bg-orange-500 text-om-text px-1.5 rounded italic">NEW</span>}
                    </div>
                    <p className="text-[11px] font-bold text-om-text-muted tracking-wider font-mono">{form.customerPhone || 'NO PHONE ATTACHED'}</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setForm({ ...form, customerId: '', customerName: '', customerPhone: '' });
                    setNewCustomer(null);
                  }}
                  className="p-2 rounded-lg hover:bg-om-border text-om-text-muted hover:text-om-text transition-colors"
                >
                  Change
                </button>
              </motion.div>
            ) : (
              <div className="rounded-2xl p-4 bg-om-surface border-2 border-orange-500/30 focus-within:border-orange-500 transition-all">
                <label className="text-[11px] font-black text-orange-400 uppercase tracking-[0.2em] px-1 mb-2 block">Select or Add Customer *</label>
                <SearchableCustomerSelect 
                  customers={customers}
                  value={form.customerId}
                  onSelect={(id) => {
                      const c = customers.find(cust => cust.id === id);
                      if (c) {
                          setForm({ ...form, customerId: id, customerName: c.name, customerPhone: c.phone });
                          setNewCustomer(null);
                      }
                  }}
                  onNewCustomer={(cust) => {
                      setNewCustomer(cust);
                      if (cust) {
                        setForm({ ...form, customerId: '', customerName: cust.name, customerPhone: cust.phone || '' });
                      }
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-[13px] font-black text-om-text uppercase tracking-[0.2em] flex items-center gap-2.5 border-b border-om-border pb-4">
              <HiOutlineDeviceMobile className="w-5 h-5 text-orange-400" /> Device Specifics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl p-3 bg-om-surface border border-om-border focus-within:border-orange-500/50 transition-all">
                <label className="text-[10px] font-black text-om-text-muted uppercase tracking-widest px-1 mb-1 block">Brand *</label>
                <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Apple, Samsung" className="w-full bg-transparent outline-none text-[15px] font-bold text-om-text px-1" required />
              </div>
              <div className="rounded-2xl p-3 bg-om-surface border border-om-border focus-within:border-orange-500/50 transition-all">
                <label className="text-[10px] font-black text-om-text-muted uppercase tracking-widest px-1 mb-1 block">Model *</label>
                <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="e.g. iPhone 13 Pro" className="w-full bg-transparent outline-none text-[15px] font-bold text-om-text px-1" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl p-3 bg-om-surface border border-om-border focus-within:border-orange-500/50 transition-all">
                <label className="text-[10px] font-black text-om-text-muted uppercase tracking-widest px-1 mb-1 block">IMEI Number *</label>
                <input value={form.imei} onChange={(e) => setForm({ ...form, imei: e.target.value })} placeholder="15-digit IMEI" className="w-full bg-transparent outline-none text-[14px] font-mono font-bold text-om-text px-1" required />
              </div>
              <div className="rounded-2xl p-3 bg-om-surface border border-om-border focus-within:border-orange-500/50 transition-all">
                <label className="text-[10px] font-black text-om-text-muted uppercase tracking-widest px-1 mb-1 block">Condition</label>
                <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="w-full bg-transparent outline-none text-[14px] font-bold text-om-text px-1 appearance-none cursor-pointer">
                  <option value="EXCELLENT">Excellent (Like new)</option>
                  <option value="GOOD">Good (Minor wear)</option>
                  <option value="FAIR">Fair (Visible wear)</option>
                  <option value="POOR">Poor (Damaged)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl p-3 bg-om-surface border-2 border-orange-500/30 focus-within:border-orange-500 transition-all">
                <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest px-1 mb-1 block">Buying Price (INR) *</label>
                <div className="relative flex items-center">
                  <span className="text-om-text-muted font-black mr-2 text-sm">INR</span>
                  <input type="number" min="0" value={form.buyingPrice} onChange={(e) => setForm({ ...form, buyingPrice: e.target.value })} placeholder="0.00" className="w-full bg-transparent outline-none text-[20px] font-black text-om-text" required />
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-3 bg-om-surface border border-om-border focus-within:border-orange-500/50 transition-all">
              <label className="text-[10px] font-black text-om-text-muted uppercase tracking-widest px-1 mb-1 block">Notes & Included Items</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="E.g. Includes original box..." className="w-full bg-transparent outline-none text-[14px] font-medium text-om-text px-1 resize-none" rows="2" />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-[13px] font-black text-om-text uppercase tracking-[0.2em] flex items-center gap-2.5 border-b border-om-border pb-4">
              <HiOutlineCamera className="w-5 h-5 text-orange-400" /> Verification Photos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-5 rounded-2xl bg-om-surface border border-om-border">
                <PhotoUpload label="Device Photos" photos={devicePhotos} onChange={setDevicePhotos} maxFiles={4} />
              </div>
              <div className="p-5 rounded-2xl bg-om-surface border border-om-border">
                <PhotoUpload label="KYC Proof" photos={kycPhotos} onChange={setKycPhotos} maxFiles={2} />
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="fixed bottom-20 md:bottom-0 left-0 right-0 z-[45] md:left-auto md:right-0 md:w-[calc(100%-280px)]"
        style={{
          background: '#0f0f23',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex flex-row items-center justify-between gap-4 md:pb-4">
          <div className="hidden sm:block">
            <p className="text-[10px] font-black text-om-text-muted uppercase tracking-widest flex items-center gap-2">
              <HiOutlineDocumentText className="w-4 h-4" /> SECURE INTAKE SYSTEM
            </p>
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={loading} 
            className="w-full sm:w-auto inline-flex justify-center items-center px-10 h-14 rounded-2xl font-black text-[15px] uppercase tracking-wider bg-[#22C55E] text-om-text shadow-xl shadow-green-500/20 hover:shadow-green-500/40 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none border-t-2 border-ag-border"
          >
            {loading ? <div className="w-6 h-6 border-3 border-ag-border border-t-white rounded-full animate-spin" /> : 'Confirm Device Intake'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default IntakeForm;
