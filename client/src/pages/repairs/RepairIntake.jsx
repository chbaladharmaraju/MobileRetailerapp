import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineCog } from 'react-icons/hi';
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="pb-12">
      <div className="flex items-center gap-4 max-w-2xl mx-auto mb-6">
        <button onClick={() => navigate('/repairs')} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
          <HiOutlineArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Repair Intake</h1>
      </div>

      <div className="flex justify-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 sm:p-8 w-full max-w-2xl border border-white/[0.08]">
          <h2 className="text-lg font-semibold text-white mb-6">Repair Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="text-[11px] font-semibold text-ag-text-dim uppercase tracking-[0.18em] ml-1 mb-1 block">Select or Add Customer</label>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-ag-text-dim uppercase tracking-[0.18em] ml-1 mb-1 block">Device Brand</label>
                <input value={form.deviceBrand} onChange={(e) => setForm({ ...form, deviceBrand: e.target.value })} placeholder="e.g. Samsung" className="ag-input" required />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-ag-text-dim uppercase tracking-[0.18em] ml-1 mb-1 block">Device Model</label>
                <input value={form.deviceModel} onChange={(e) => setForm({ ...form, deviceModel: e.target.value })} placeholder="e.g. Galaxy S23 Ultra" className="ag-input" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-ag-text-dim uppercase tracking-[0.18em] ml-1 mb-1 block">Estimated Cost (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ag-text-dim font-bold">₹</span>
                  <input type="number" min="0" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} placeholder="0.00" className="ag-input pl-10 font-bold" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-ag-text-dim uppercase tracking-[0.18em] ml-1 mb-1 block">Service / Repair Type</label>
                <SearchableItemSelect 
                    items={spareParts}
                    onSelect={setSelectedService}
                    value={selectedService}
                    placeholder="e.g. Screen Replacement..."
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-ag-text-dim uppercase tracking-[0.18em] ml-1 mb-1 block">Issue Description</label>
              <textarea value={form.issueDescription} onChange={(e) => setForm({ ...form, issueDescription: e.target.value })} placeholder="Describe the problem in detail..." className="ag-input resize-none" rows="4" required />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-ag-text-dim uppercase tracking-[0.18em] ml-1 mb-1 block">Additional Notes (IMEI, Condition, etc.)</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="IMEI, cosmetic damage, passcodes..." className="ag-input resize-none" rows="3" />
            </div>

            <PhotoUpload
              label="Device Photos (Before Repair)"
              photos={beforePhotos}
              onChange={setBeforePhotos}
              maxFiles={4}
            />

            <div className="mt-10 pt-8 border-t border-white/[0.08] flex justify-end">
              <button type="submit" disabled={loading} className="ag-btn ag-btn-primary w-full sm:w-64 h-14 text-sm flex items-center justify-center gap-3 font-bold">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                    <>
                        <HiOutlineCheckCircle className="w-5 h-5" />
                        Create Repair Job
                    </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RepairIntake;
