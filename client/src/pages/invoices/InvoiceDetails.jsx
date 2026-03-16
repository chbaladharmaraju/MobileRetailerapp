import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiOutlinePrinter, HiOutlineDocumentDownload } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const typeLabels = { new_sale: 'New Sale', secondhand_sale: 'Second-Hand Sale', repair: 'Repair / Service' };
const typeColors = {
  new_sale: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  secondhand_sale: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  repair: 'bg-green-500/10 text-green-400 border-green-500/20',
};

const InvoiceDetails = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/invoices/${id}`)
      .then(({ data }) => setInvoice(data))
      .catch(() => toast.error('Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [id]);

  const viewPDF = () => {
    const token = localStorage.getItem('ag_token');
    fetch(`${import.meta.env.VITE_API_URL || '/api'}/invoices/${id}/pdf`, {
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

  const fmt = (v) => `₹${parseFloat(v || 0).toLocaleString('en-IN')}`;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-ag-border border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!invoice) return <div className="text-center py-20 text-ag-text-dim">Invoice not found.</div>;

  // Determine customer and items based on type
  const customer = invoice.sale?.customer || invoice.repair?.customer || invoice.secondHandSale?.intake?.customer;
  const saleItems = invoice.sale?.items || [];
  const repairParts = invoice.repair?.parts || [];
  const secondHandIntake = invoice.secondHandSale?.intake;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/invoices" className="p-2.5 rounded-xl bg-ag-bg-card hover:bg-ag-bg-card text-ag-text transition-colors border border-ag-border">
            <HiOutlineArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-ag-text tracking-tight">{invoice.invoiceNumber}</h1>
            <p className="text-sm text-ag-text-muted mt-0.5">
              {new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <button onClick={viewPDF} className="ag-btn ag-btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
          <HiOutlinePrinter className="w-5 h-5" /> Download / Print PDF
        </button>
      </div>

      {/* Invoice Card (Beautified Bill View) */}
      <div className="glass-card border border-white/[0.12] shadow-2xl overflow-hidden">
        {/* Invoice Top Bar */}
        <div className="bg-gradient-to-r from-white/[0.04] to-transparent p-6 sm:p-8 border-b border-white/[0.06]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <span className="text-ag-text font-extrabold text-sm tracking-tighter">OM</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--om-text)' }}>Orange Mobile</h2>
                  <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--om-text-muted)' }}>Retail OS</p>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-2xl font-bold text-ag-text tracking-wider">{invoice.invoiceNumber}</p>
              <span className={`inline-flex items-center px-3 py-1 mt-2 text-[10px] font-bold tracking-wider uppercase rounded-full border ${typeColors[invoice.type]}`}>
                {typeLabels[invoice.type]}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Date Section */}
        <div className="p-6 sm:p-8 border-b border-white/[0.06]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] text-ag-text-dim uppercase tracking-widest font-bold mb-2">Billed To</p>
              <p className="text-base font-semibold text-ag-text">{customer?.name || 'N/A'}</p>
              {customer?.phone && <p className="text-sm text-ag-text-muted mt-1">{customer.phone}</p>}
              {customer?.email && <p className="text-sm text-ag-text-muted">{customer.email}</p>}
              {customer?.address && <p className="text-sm text-ag-text-muted">{customer.address}</p>}
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] text-ag-text-dim uppercase tracking-widest font-bold mb-2">Invoice Date</p>
              <p className="text-sm text-ag-text">
                {new Date(invoice.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs text-ag-text-muted mt-1">
                {new Date(invoice.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* Items / Details */}
        <div className="p-6 sm:p-8 border-b border-white/[0.06]">
          {invoice.type === 'new_sale' && saleItems.length > 0 && (
            <>
              <p className="text-[10px] text-ag-text-dim uppercase tracking-widest font-bold mb-4">Items Purchased</p>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ag-border">
                    <th className="text-left text-[10px] text-ag-text-dim uppercase tracking-wider font-bold pb-3">#</th>
                    <th className="text-left text-[10px] text-ag-text-dim uppercase tracking-wider font-bold pb-3">Product</th>
                    <th className="text-center text-[10px] text-ag-text-dim uppercase tracking-wider font-bold pb-3">Qty</th>
                    <th className="text-right text-[10px] text-ag-text-dim uppercase tracking-wider font-bold pb-3">Unit Price</th>
                    <th className="text-right text-[10px] text-ag-text-dim uppercase tracking-wider font-bold pb-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {saleItems.map((item, i) => (
                    <tr key={item.id} className="border-b border-ag-border">
                      <td className="py-3 text-sm text-ag-text-muted">{i + 1}</td>
                      <td className="py-3">
                        <p className="text-sm font-medium text-ag-text">{item.product?.name}</p>
                        <p className="text-xs text-ag-text-dim">{item.product?.brand} {item.product?.model}</p>
                      </td>
                      <td className="py-3 text-center text-sm text-ag-text">{item.quantity}</td>
                      <td className="py-3 text-right text-sm text-ag-text-muted">{fmt(item.unitPrice)}</td>
                      <td className="py-3 text-right text-sm font-semibold text-ag-text">{fmt(parseFloat(item.unitPrice) * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {invoice.type === 'secondhand_sale' && secondHandIntake && (
            <>
              <p className="text-[10px] text-ag-text-dim uppercase tracking-widest font-bold mb-4">Second-Hand Phone Sale</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-ag-border">
                  <p className="text-[10px] text-ag-text-dim uppercase tracking-widest font-bold mb-1">Device</p>
                  <p className="text-sm font-medium text-ag-text">{secondHandIntake.brand} {secondHandIntake.model}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-ag-border">
                  <p className="text-[10px] text-ag-text-dim uppercase tracking-widest font-bold mb-1">IMEI</p>
                  <p className="text-xs font-mono text-ag-text/80">{secondHandIntake.imei}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-ag-border">
                  <p className="text-[10px] text-ag-text-dim uppercase tracking-widest font-bold mb-1">Condition</p>
                  <p className="text-sm text-ag-text">{secondHandIntake.condition}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-ag-border">
                  <p className="text-[10px] text-ag-text-dim uppercase tracking-widest font-bold mb-1">Buyer</p>
                  <p className="text-sm text-ag-text">{invoice.secondHandSale?.buyerName}</p>
                </div>
              </div>
            </>
          )}

          {invoice.type === 'repair' && (
            <>
              <p className="text-[10px] text-ag-text-dim uppercase tracking-widest font-bold mb-4">Repair / Service Details</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-ag-border">
                  <p className="text-[10px] text-ag-text-dim uppercase tracking-widest font-bold mb-1">Device</p>
                  <p className="text-sm font-medium text-ag-text">{invoice.repair?.deviceBrand} {invoice.repair?.deviceModel}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-ag-border">
                  <p className="text-[10px] text-ag-text-dim uppercase tracking-widest font-bold mb-1">Issue</p>
                  <p className="text-xs text-ag-text-muted truncate">{invoice.repair?.issueDescription}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-ag-border">
                  <p className="text-[10px] text-ag-text-dim uppercase tracking-widest font-bold mb-1">Status</p>
                  <p className="text-sm text-green-400 font-medium">{invoice.repair?.status?.replace('_', ' ')}</p>
                </div>
              </div>
              {repairParts.length > 0 && (
                <table className="w-full mt-4">
                  <thead>
                    <tr className="border-b border-ag-border">
                      <th className="text-left text-[10px] text-ag-text-dim uppercase tracking-wider font-bold pb-3">Part</th>
                      <th className="text-center text-[10px] text-ag-text-dim uppercase tracking-wider font-bold pb-3">Qty</th>
                      <th className="text-right text-[10px] text-ag-text-dim uppercase tracking-wider font-bold pb-3">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairParts.map((p) => (
                      <tr key={p.id} className="border-b border-ag-border">
                        <td className="py-3 text-sm text-ag-text">{p.sparePart?.name}</td>
                        <td className="py-3 text-center text-sm text-ag-text">{p.quantity}</td>
                        <td className="py-3 text-right text-sm text-ag-text">{fmt(parseFloat(p.unitCost) * p.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>

        {/* Totals */}
        <div className="p-6 sm:p-8 bg-black/30">
          <div className="max-w-xs ml-auto space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-ag-text-muted">Subtotal</span>
              <span className="text-ag-text font-medium">{fmt(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ag-text-muted">Tax</span>
              <span className="text-ag-text font-medium">{fmt(invoice.tax)}</span>
            </div>
            <div className="h-px bg-ag-bg-card w-full" />
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold text-ag-text">Grand Total</span>
              <span className="text-2xl font-bold text-ag-text tracking-tight">{fmt(invoice.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 sm:p-8 bg-white/[0.01] border-t border-white/[0.06] text-center">
          <p className="text-xs text-ag-text-dim">Thank you for your business!</p>
          <p className="text-[10px] text-ag-text-dim mt-1 uppercase tracking-widest">Orange Mobile Retail • Retail OS • Powered by Neon Postgres</p>
        </div>
      </div>
    </motion.div>
  );
};

export default InvoiceDetails;
