import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineCurrencyRupee,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
  HiOutlineTruck,
  HiOutlineCog,
  HiOutlineClipboardCheck,
} from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import PhotoUpload from '../../components/common/PhotoUpload';
import { getImageUrl } from '../../utils/imageUrl';

const STATUS_FLOW = ['INTAKE', 'DIAGNOSING', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'DELIVERED'];

const statusColors = {
  INTAKE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  DIAGNOSING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  IN_PROGRESS: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  WAITING_PARTS: 'bg-red-500/10 text-red-400 border-red-500/20',
  COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
  DELIVERED: 'bg-green-500/10 text-green-400 border-green-500/20',
};

const RepairDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);

  // Complete modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeForm, setCompleteForm] = useState({ finalCost: '', serviceCharge: '', notes: '' });
  const [afterPhotos, setAfterPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Invoice generation
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  const fetchRepair = async () => {
    try {
      const { data } = await api.get(`/repairs/${id}`);
      setRepair(data);
    } catch (err) {
      toast.error('Failed to load repair details');
      navigate('/repairs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepair();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await api.put(`/repairs/${id}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
      fetchRepair();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!completeForm.serviceCharge) return toast.error('Service charge is required');
    try {
      setSubmitting(true);
      await api.put(`/repairs/${id}`, {
        status: 'COMPLETED',
        finalCost: parseFloat(completeForm.finalCost || 0),
        serviceCharge: parseFloat(completeForm.serviceCharge),
        afterPhotos,
        notes: completeForm.notes || undefined,
      });
      toast.success('Repair marked as completed!');
      setShowCompleteModal(false);
      fetchRepair();
    } catch (err) {
      toast.error('Failed to complete repair');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeliver = async () => {
    try {
      setUpdatingStatus(true);
      await api.put(`/repairs/${id}`, { status: 'DELIVERED' });
      toast.success('Repair delivered to customer!');
      fetchRepair();
    } catch (err) {
      toast.error('Failed to mark as delivered');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      setGeneratingInvoice(true);
      await api.post('/invoices/repair', { repairId: id, tax: 0 });
      toast.success('Invoice generated with ORANGE prefix!');
      fetchRepair();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const viewInvoicePDF = () => {
    if (!repair?.invoice?.id) return;
    const token = localStorage.getItem('ag_token');
    fetch(`${import.meta.env.VITE_API_URL || '/api'}/invoices/${repair.invoice.id}/pdf`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    })
    .catch(() => toast.error('Failed to open PDF'));
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;

  const currentIdx = repair ? STATUS_FLOW.indexOf(repair.status) : 0;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-ag-border border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!repair) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/repairs" className="p-2.5 rounded-xl bg-om-surface hover:bg-om-border text-om-text transition-colors border-om-border">
            <HiOutlineArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-om-text tracking-tight">
              {repair.deviceBrand} {repair.deviceModel}
            </h1>
            <p className="text-sm text-om-text-muted mt-0.5">
              {new Date(repair.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          {repair.status !== 'COMPLETED' && repair.status !== 'DELIVERED' && (
            <button
              onClick={() => {
                setCompleteForm({
                  finalCost: repair.estimatedCost || '',
                  serviceCharge: repair.estimatedCost || '',
                  notes: ''
                });
                setAfterPhotos([]);
                setShowCompleteModal(true);
              }}
              className="flex-1 sm:flex-none ag-btn ag-btn-primary flex items-center justify-center gap-2 text-sm"
            >
              <HiOutlineCheckCircle className="w-5 h-5" /> Mark Completed
            </button>
          )}

          {repair.status === 'COMPLETED' && (
            <button
              onClick={handleDeliver}
              disabled={updatingStatus}
              className="flex-1 sm:flex-none ag-btn ag-btn-primary flex items-center justify-center gap-2 text-sm"
            >
              <HiOutlineTruck className="w-5 h-5" /> {updatingStatus ? 'Processing...' : 'Mark Delivered'}
            </button>
          )}

          {(repair.status === 'COMPLETED' || repair.status === 'DELIVERED') && !repair.invoice && (
            <button
              onClick={handleGenerateInvoice}
              disabled={generatingInvoice}
              className="flex-1 sm:flex-none ag-btn ag-btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              <HiOutlineDocumentText className="w-5 h-5" /> {generatingInvoice ? 'Generating...' : 'Generate Invoice'}
            </button>
          )}

          {repair.invoice && (
            <button onClick={viewInvoicePDF} className="flex-1 sm:flex-none ag-btn ag-btn-secondary flex items-center justify-center gap-2 text-sm">
              <HiOutlineDocumentText className="w-5 h-5" /> View Invoice PDF
            </button>
          )}
        </div>
      </div>

      {/* Status Progress Bar */}
      <div className="glass-card bg-om-card border border-om-border p-6 mb-8 border-om-border">
        <h3 className="text-[10px] font-bold text-om-text-secondary uppercase tracking-[0.25em] mb-5">Repair Status</h3>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {STATUS_FLOW.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1 min-w-0">
              <button
                onClick={() => i > currentIdx && i !== 4 && handleStatusUpdate(s)}
                disabled={i <= currentIdx || i === 4 || updatingStatus}
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border ${
                  i < currentIdx ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  i === currentIdx ? 'bg-ag-bg-card text-om-text border-ag-border scale-110 shadow-[0_0_15px_rgba(255,255,255,0.1)]' :
                  'bg-om-surface text-om-text-secondary border-om-border hover:bg-white/[0.06] cursor-pointer disabled:cursor-default disabled:hover:bg-om-surface'
                }`}
              >
                {i < currentIdx ? '✓' : i + 1}
              </button>
              {i < STATUS_FLOW.length - 1 && (
                <div className={`flex-1 h-px ${i < currentIdx ? 'bg-green-500/30' : 'bg-om-border'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 overflow-x-auto">
          {STATUS_FLOW.map((s) => (
            <p key={s} className="text-[9px] text-om-text-secondary uppercase tracking-wider flex-1 text-center min-w-0 truncate px-1">
              {s.replace('_', ' ')}
            </p>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Device Info */}
          <div className="glass-card bg-om-card border border-om-border p-6 border-om-border">
            <h3 className="text-sm font-semibold text-om-text uppercase tracking-wider mb-5 flex items-center gap-2">
              <HiOutlineCog className="w-4 h-4" /> Device Info
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-om-text-secondary uppercase tracking-widest font-bold mb-1">Brand & Model</p>
                <p className="text-base font-medium text-om-text">{repair.deviceBrand} {repair.deviceModel}</p>
              </div>
              {repair.imei && (
                <div>
                  <p className="text-[10px] text-om-text-secondary uppercase tracking-widest font-bold mb-1">IMEI</p>
                  <p className="text-sm font-mono text-om-text/80">{repair.imei}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-om-text-secondary uppercase tracking-widest font-bold mb-1">Status</p>
                <span className={`inline-flex items-center px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full border ${statusColors[repair.status]}`}>
                  {repair.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="glass-card bg-om-card border border-om-border p-6 border-om-border">
            <h3 className="text-sm font-semibold text-om-text uppercase tracking-wider mb-5">Customer</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-om-text-secondary uppercase tracking-widest font-bold mb-1">Name</p>
                <p className="text-sm font-medium text-om-text">{repair.customer?.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-om-text-secondary uppercase tracking-widest font-bold mb-1">Phone</p>
                <p className="text-sm text-om-text/80">{repair.customer?.phone}</p>
              </div>
              <div>
                <p className="text-[10px] text-om-text-secondary uppercase tracking-widest font-bold mb-1">Handled By</p>
                <p className="text-sm text-om-text/80">{repair.user?.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue & Notes */}
          <div className="glass-card bg-om-card border border-om-border p-6 border-om-border">
            <h3 className="text-sm font-semibold text-om-text uppercase tracking-wider mb-5 flex items-center gap-2">
              <HiOutlineClipboardCheck className="w-4 h-4" /> Issue Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-om-text-secondary uppercase tracking-widest font-bold mb-2">Issue Description</p>
                <p className="text-sm text-om-text leading-relaxed bg-om-surface rounded-xl p-4 border-om-border">
                  {repair.issueDescription}
                </p>
              </div>
              {repair.notes && (
                <div>
                  <p className="text-[10px] text-om-text-secondary uppercase tracking-widest font-bold mb-2">Additional Notes</p>
                  <p className="text-sm text-om-text-muted italic">{repair.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Financials */}
          <div className="glass-card bg-om-card border border-om-border p-6 border-om-border bg-om-surface">
            <h3 className="text-sm font-semibold text-om-text uppercase tracking-wider mb-5 flex items-center gap-2">
              <HiOutlineCurrencyRupee className="w-4 h-4" /> Financials
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-om-surface border-om-border">
                <p className="text-[10px] text-om-text-secondary uppercase tracking-widest font-bold mb-2">Estimated</p>
                <p className="text-lg font-bold text-om-text">{formatCurrency(repair.estimatedCost)}</p>
              </div>
              <div className="p-4 rounded-xl bg-om-surface border-om-border">
                <p className="text-[10px] text-om-text-secondary uppercase tracking-widest font-bold mb-2">Parts Cost</p>
                <p className="text-lg font-bold text-om-text">
                  {formatCurrency(repair.parts?.reduce((sum, p) => sum + parseFloat(p.unitCost) * p.quantity, 0) || 0)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-om-surface border-om-border">
                <p className="text-[10px] text-om-text-secondary uppercase tracking-widest font-bold mb-2">Service Charge</p>
                <p className="text-lg font-bold text-om-text">{formatCurrency(repair.serviceCharge)}</p>
              </div>
              <div className="p-4 rounded-xl bg-om-surface border-om-border">
                <p className="text-[10px] text-om-text-secondary uppercase tracking-widest font-bold mb-2">Profit</p>
                <p className={`text-lg font-bold ${parseFloat(repair.totalProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(repair.totalProfit)}
                </p>
              </div>
            </div>
          </div>

          {/* Parts Used */}
          {repair.parts && repair.parts.length > 0 && (
            <div className="glass-card bg-om-card border border-om-border overflow-hidden border-om-border">
              <div className="p-5 border-b border-om-border bg-om-surface">
                <h3 className="text-sm font-semibold text-om-text tracking-wide">Parts Used</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="ag-table w-full">
                  <thead>
                    <tr>
                      <th>Part Name</th>
                      <th>Category</th>
                      <th className="text-center">Qty</th>
                      <th className="text-right">Unit Cost</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repair.parts.map((part) => (
                      <tr key={part.id}>
                        <td className="font-medium text-om-text">{part.sparePart?.name}</td>
                        <td className="text-om-text-muted">{part.sparePart?.category}</td>
                        <td className="text-center text-om-text">{part.quantity}</td>
                        <td className="text-right text-om-text-muted">{formatCurrency(part.unitCost)}</td>
                        <td className="text-right font-semibold text-om-text">{formatCurrency(parseFloat(part.unitCost) * part.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Photos */}
          {(repair.beforePhotos?.length > 0 || repair.afterPhotos?.length > 0) && (
            <div className="glass-card bg-om-card border border-om-border p-6 border-om-border">
              <h3 className="text-sm font-semibold text-om-text uppercase tracking-wider mb-5 flex items-center gap-2">
                <HiOutlinePhotograph className="w-4 h-4" /> Photos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {repair.beforePhotos?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-om-text-secondary uppercase tracking-widest font-bold mb-3">Before</p>
                    <div className="grid grid-cols-2 gap-2">
                      {repair.beforePhotos.map((url, i) => (
                        <img key={i} src={getImageUrl(url)} alt={`Before ${i+1}`} className="rounded-lg border-om-border w-full h-32 object-cover" />
                      ))}
                    </div>
                  </div>
                )}
                {repair.afterPhotos?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-om-text-secondary uppercase tracking-widest font-bold mb-3">After</p>
                    <div className="grid grid-cols-2 gap-2">
                      {repair.afterPhotos.map((url, i) => (
                        <img key={i} src={getImageUrl(url)} alt={`After ${i+1}`} className="rounded-lg border-om-border w-full h-32 object-cover" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invoice Info */}
          {repair.invoice && (
            <div className="glass-card bg-om-card border border-om-border p-6 border-om-border bg-gradient-to-br from-green-500/5 to-transparent">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-om-text-secondary uppercase tracking-widest font-bold mb-1">Invoice Number</p>
                  <p className="text-xl font-bold text-om-text tracking-wider">{repair.invoice.invoiceNumber}</p>
                  <p className="text-xs text-om-text-muted mt-1">
                    Generated on {new Date(repair.invoice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button onClick={viewInvoicePDF} className="ag-btn ag-btn-secondary text-sm">
                  View PDF
                </button>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="glass-card bg-om-card border border-om-border p-6 border-om-border">
            <h3 className="text-sm font-semibold text-om-text uppercase tracking-wider mb-5">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-om-text font-medium">Intake Created</p>
                  <p className="text-xs text-om-text-muted">{new Date(repair.createdAt).toLocaleString('en-IN')}</p>
                </div>
              </div>
              {repair.completedAt && (
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-om-text font-medium">Completed</p>
                    <p className="text-xs text-om-text-muted">{new Date(repair.completedAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}
              {repair.deliveredAt && (
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-om-text font-medium">Delivered to Customer</p>
                    <p className="text-xs text-om-text-muted">{new Date(repair.deliveredAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Complete Repair Modal */}
      <AnimatePresence>
        {showCompleteModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-om-bg border-om-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-green-400/30 to-transparent" />
              <h3 className="text-lg font-semibold text-om-text mb-2">Complete Repair</h3>
              <p className="text-sm text-om-text-muted mb-6">Enter the final costs and service charge to mark this repair as completed.</p>

              <form onSubmit={handleComplete} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-om-text-secondary uppercase tracking-wider ml-1 mb-1 block">Final Parts Cost (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-om-text-secondary font-bold">₹</span>
                    <input
                      type="number" step="0.01" min="0"
                      value={completeForm.finalCost}
                      onChange={(e) => setCompleteForm({...completeForm, finalCost: e.target.value})}
                      className="ag-input pl-10"
                      placeholder="Total parts cost"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-om-text-secondary uppercase tracking-wider ml-1 mb-1 block">Service Charge (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-om-text-secondary font-bold">₹</span>
                    <input
                      type="number" step="0.01" min="0" required
                      value={completeForm.serviceCharge}
                      onChange={(e) => setCompleteForm({...completeForm, serviceCharge: e.target.value})}
                      className="ag-input pl-10"
                      placeholder="Amount charged to customer"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-om-text-secondary uppercase tracking-wider ml-1 mb-1 block">Notes (Optional)</label>
                  <textarea
                    value={completeForm.notes}
                    onChange={(e) => setCompleteForm({...completeForm, notes: e.target.value})}
                    className="ag-input resize-none"
                    rows="3"
                    placeholder="Any additional notes..."
                  />
                </div>

                <PhotoUpload
                  label="After Repair Photos"
                  photos={afterPhotos}
                  onChange={setAfterPhotos}
                  maxFiles={4}
                />

                {/* Profit Preview */}
                <div className="bg-om-surface rounded-xl p-4 border-om-border">
                  <p className="text-xs text-om-text-secondary uppercase tracking-wider mb-1">Estimated Profit</p>
                  <p className={`text-xl font-bold ${
                    (parseFloat(completeForm.serviceCharge || 0) - parseFloat(completeForm.finalCost || 0)) >= 0
                      ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ₹{(parseFloat(completeForm.serviceCharge || 0) - parseFloat(completeForm.finalCost || 0)).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowCompleteModal(false)} className="ag-btn bg-om-surface hover:bg-om-border text-om-text flex-1 border-om-border">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="ag-btn ag-btn-primary flex-1">
                    {submitting ? 'Saving...' : 'Complete Repair'}
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

export default RepairDetails;
