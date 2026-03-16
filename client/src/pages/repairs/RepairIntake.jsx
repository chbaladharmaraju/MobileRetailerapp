import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineAdjustments,
  HiOutlineCheckCircle,
  HiOutlineArrowLeft,
  HiOutlineIdentification,
  HiOutlineUser,
  HiOutlinePhone,
} from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import SearchableCustomerSelect from '../../components/common/SearchableCustomerSelect';
import SearchableItemSelect from '../../components/common/SearchableItemSelect';
import PhotoUpload from '../../components/common/PhotoUpload';

const RepairIntake = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    deviceBrand: '',
    deviceModel: '',
    imei: '',
    issueDescription: '',
    estimatedCost: '',
    notes: ''
  });
  const [customers, setCustomers] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [newCustomer, setNewCustomer] = useState(null);
  const [beforePhotos, setBeforePhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/customers'),
      api.get('/inventory/parts')
    ]).then(([cRes, pRes]) => {
      setCustomers(cRes.data.customers || []);
      setSpareParts(pRes.data.parts || []);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // If a service was selected/typed, prepend it to the issue description
      let finalIssue = form.issueDescription;
      if (selectedService) {
        const serviceName = typeof selectedService === 'string' ?
          spareParts.find(p => p.id === selectedService)?.name :
          selectedService.name;
        if (serviceName) finalIssue = `[${serviceName}] ${finalIssue}`;
      }

      const submissionData = {
        ...form,
        issueDescription: finalIssue,
        customerName: newCustomer ? newCustomer.name : form.customerName,
        customerPhone: newCustomer ? newCustomer.phone : form.customerPhone,
        beforePhotos,
      };
      await api.post('/repairs', submissionData);
      toast.success('Repair job created successfully');
      navigate('/repairs');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create repair job'); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="pb-32 md:pb-24">
      <div className="flex items-center gap-4 max-w-2xl mx-auto mb-6">
        <button onClick={() => navigate('/repairs')} className="p-2 bg-om-surface border border-om-border rounded-lg hover:bg-om-border transition-colors">
          <HiOutlineArrowLeft className="w-5 h-5 text-om-text" />
        </button>
        <h1 className="text-xl font-bold text-om-text">Repair Intake</h1>
      </div>

      <div className="flex justify-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card bg-om-card border border-om-border p-6 sm:p-8 w-full max-w-2xl border border-om-border">
          <h2 className="text-lg font-semibold text-om-text mb-6">Repair Details</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {form.customerId || newCustomer ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card bg-om-card border border-om-border p-5 border-ag-neon/30 bg-ag-neon/5 flex items-center justify-between mb-8 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-ag-neon/20 flex items-center justify-center text-ag-neon">
                    <HiOutlineIdentification className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-black text-om-text uppercase italic">{form.customerName}</h3>
                      {newCustomer && <span className="text-[9px] font-black bg-ag-neon text-black px-1.5 rounded italic">NEW</span>}
                    </div>
                    <p className="text-[12px] font-bold text-om-text-secondary tracking-wider font-mono">{form.customerPhone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setForm({ ...form, customerId: '', customerName: '', customerPhone: '' });
                    setNewCustomer(null);
                  }}
                  className="p-2 rounded-lg hover:bg-om-border text-om-text-secondary hover:text-om-text transition-colors"
                >
                  Change
                </button>
              </motion.div>
            ) : (
              <div className="rounded-2xl p-4 bg-om-surface border-2 border-ag-neon/30 focus-within:border-ag-neon transition-all mb-8">
                <label className="text-[11px] font-black text-ag-neon uppercase tracking-[0.2em] px-1 mb-2 block">Select or Add Customer *</label>
                <SearchableCustomerSelect
                  customers={customers}
                  value={form.customerId}
                  onSelect={(id) => {
                    const c = customers.find(cust => cust.id === id);
                    if (c) {
                      setForm({ ...form, customerId: id, customerName: c.name, customerPhone: c.phone });
                      setNewCustomer(null);
                    } else {
                      setForm({ ...form, customerId: '', customerName: '', customerPhone: '' });
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-2xl p-3 bg-om-surface border border-om-border focus-within:border-ag-neon/50 transition-all">
                <label className="text-[10px] font-black text-om-text-secondary uppercase tracking-widest px-1 mb-1 block">Device Brand *</label>
                <input value={form.deviceBrand} onChange={(e) => setForm({ ...form, deviceBrand: e.target.value })} placeholder="e.g. Samsung" className="w-full bg-transparent outline-none text-[15px] font-bold text-om-text px-1" required />
              </div>
              <div className="rounded-2xl p-3 bg-om-surface border border-om-border focus-within:border-ag-neon/50 transition-all">
                <label className="text-[10px] font-black text-om-text-secondary uppercase tracking-widest px-1 mb-1 block">Device Model *</label>
                <input value={form.deviceModel} onChange={(e) => setForm({ ...form, deviceModel: e.target.value })} placeholder="e.g. Galaxy S23 Ultra" className="w-full bg-transparent outline-none text-[15px] font-bold text-om-text px-1" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-2xl p-3 bg-om-surface border border-om-border focus-within:border-ag-neon/50 transition-all">
                <label className="text-[10px] font-black text-om-text-secondary uppercase tracking-widest px-1 mb-1 block">Estimated Cost ({"\u20B9"})</label>
                <div className="relative flex items-center">
                  <span className="text-om-text-secondary font-black mr-2">{"\u20B9"}</span>
                  <input type="number" min="0" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} placeholder="0.00" className="w-full bg-transparent outline-none text-[16px] font-black text-om-text" />
                </div>
              </div>
              <div className="rounded-2xl p-3 bg-om-surface border border-om-border focus-within:border-ag-neon/50 transition-all">
                <label className="text-[10px] font-black text-om-text-secondary uppercase tracking-widest px-1 mb-1 block">Service / Repair Type</label>
                <SearchableItemSelect
                  items={spareParts}
                  onSelect={setSelectedService}
                  value={selectedService}
                  placeholder="e.g. Screen Replacement..."
                />
              </div>
            </div>

            <div className="rounded-2xl p-3 bg-om-surface border border-om-border focus-within:border-ag-neon/50 transition-all">
              <label className="text-[10px] font-black text-om-text-secondary uppercase tracking-widest px-1 mb-1 block">Issue Description *</label>
              <textarea value={form.issueDescription} onChange={(e) => setForm({ ...form, issueDescription: e.target.value })} placeholder="Describe the problem in detail..." className="w-full bg-transparent outline-none text-[14px] font-medium text-om-text px-1 resize-none" rows="3" required />
            </div>

            <div className="rounded-2xl p-3 bg-om-surface border border-om-border focus-within:border-ag-neon/50 transition-all">
              <label className="text-[10px] font-black text-om-text-secondary uppercase tracking-widest px-1 mb-1 block">Additional Notes (IMEI, passcodes, etc.)</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="IMEI, cosmetic damage, passcodes..." className="w-full bg-transparent outline-none text-[14px] font-medium text-om-text px-1 resize-none" rows="2" />
            </div>

            <PhotoUpload
              label="Device Photos (Before Repair)"
              photos={beforePhotos}
              onChange={setBeforePhotos}
              maxFiles={4}
            />
          </form>
        </motion.div>
      </div>

      <div className="fixed bottom-20 md:bottom-0 left-0 right-0 z-[45] md:left-auto md:right-0 md:w-[calc(100%-280px)]"
        style={{
          background: 'var(--om-card)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '1px solid var(--om-border)',
        }}
      >
        <div className="max-w-2xl mx-auto px-6 py-4 flex flex-row items-center justify-end md:pb-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto inline-flex justify-center items-center px-10 h-14 rounded-2xl font-black text-[15px] uppercase tracking-wider bg-[#22C55E] text-om-text shadow-xl shadow-green-500/20 hover:shadow-green-500/40 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none border-t-2 border-ag-border"
          >
            {loading ? <div className="w-5 h-5 border-3 border-ag-border border-t-white rounded-full animate-spin" /> : (
              <>
                <HiOutlineCheckCircle className="w-6 h-6 mr-2" />
                Create Repair Job
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RepairIntake;
