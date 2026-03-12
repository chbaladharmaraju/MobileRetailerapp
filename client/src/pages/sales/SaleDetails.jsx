import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiOutlineDocumentDownload, HiOutlinePrinter, HiOutlineDocumentAdd } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SaleDetails = () => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchSale = async () => {
    try {
      const { data } = await api.get(`/sales/${id}`);
      setSale(data);
    } catch (err) {
      toast.error('Failed to load sale details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSale();
  }, [id]);

  const generateInvoice = async () => {
    try {
      setGenerating(true);
      await api.post('/invoices/sale', { saleId: id, tax: 0 }); // tax is 0 by default or handled elsewhere
      toast.success('Invoice generated successfully! Prefix: ORANGE-');
      fetchSale(); // Refresh to get the new invoice object
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setGenerating(false);
    }
  };

  const viewInvoicePDF = () => {
    if (!sale?.invoice?.id) return;
    const token = localStorage.getItem('ag_token');
    
    // Create an invisible link to download/view the PDF
    fetch(`${import.meta.env.VITE_API_URL || '/api'}/invoices/${sale.invoice.id}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('target', '_blank'); // Open in new tab
      // Optionally to force download: link.setAttribute('download', `${sale.invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    })
    .catch(err => {
      console.error(err);
      toast.error('Failed to open PDF');
    });
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount).toLocaleString('en-IN')}`;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!sale) return <div className="p-8 text-center text-white">Sale not found.</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link to="/sales" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
            <HiOutlineArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Sale Details</h1>
            <p className="text-sm text-ag-text-muted">{new Date(sale.createdAt).toLocaleString('en-IN')}</p>
          </div>
        </div>
        
        {sale.invoice ? (
          <button onClick={viewInvoicePDF} className="ag-btn ag-btn-primary flex items-center gap-2">
            <HiOutlinePrinter className="w-5 h-5" /> View Invoice PDF
          </button>
        ) : (
          <button onClick={generateInvoice} disabled={generating} className="ag-btn ag-btn-primary flex items-center gap-2 disabled:opacity-50">
            {generating ? <span className="animate-pulse">Generating...</span> : <><HiOutlineDocumentAdd className="w-5 h-5" /> Generate Invoice</>}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 border border-white/5 md:col-span-2">
          <h3 className="text-sm font-semibold text-white tracking-wide border-b border-white/10 pb-4 mb-4">Customer Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-ag-text-dim uppercase tracking-wider mb-1">Name</p>
              <p className="text-base font-medium text-white">{sale.customer?.name}</p>
            </div>
            <div>
              <p className="text-xs text-ag-text-dim uppercase tracking-wider mb-1">Phone</p>
              <p className="text-base font-medium text-white">{sale.customer?.phone}</p>
            </div>
            <div>
              <p className="text-xs text-ag-text-dim uppercase tracking-wider mb-1">Payment Mode</p>
              <span className="ag-badge ag-badge-info">{sale.paymentMode}</span>
            </div>
            <div>
              <p className="text-xs text-ag-text-dim uppercase tracking-wider mb-1">Billed By</p>
              <p className="text-base font-medium text-white">{sale.user?.name}</p>
            </div>
          </div>

          {sale.invoice && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center bg-white/5 rounded-lg p-4 border border-white/5">
                <div>
                  <p className="text-xs text-ag-text-dim tracking-wider uppercase mb-1">Generated Invoice</p>
                  <p className="text-lg font-bold text-ag-primary tracking-widest">{sale.invoice.invoiceNumber}</p>
                </div>
                <HiOutlineDocumentDownload className="w-8 h-8 text-white/20" />
              </div>
            </div>
          )}
        </div>
        
        <div className="glass-card p-6 flex flex-col justify-center border border-white/5 bg-black/40">
           <h3 className="text-sm font-semibold text-white tracking-wide border-b border-white/10 pb-4 mb-4">Financials</h3>
           <div className="space-y-4">
             <div className="flex justify-between items-center">
               <span className="text-sm text-ag-text-muted">Sub Total</span>
               <span className="text-base font-medium text-white">{formatCurrency(parseFloat(sale.totalAmount) + parseFloat(sale.discount))}</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm text-ag-text-muted">Discount</span>
               <span className="text-base font-medium text-red-400">-{formatCurrency(sale.discount)}</span>
             </div>
             <div className="h-px bg-white/10 w-full" />
             <div className="flex justify-between items-center">
               <span className="text-sm font-semibold text-white">Grand Total</span>
               <span className="text-xl font-bold tracking-tight text-white">{formatCurrency(sale.totalAmount)}</span>
             </div>
           </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/5 bg-black/20 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-white tracking-wide">Purchased Items</h3>
          <span className="text-xs font-medium text-ag-text-muted px-2.5 py-1 bg-white/5 rounded-full">{sale.items?.length || 0} items</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="ag-table w-full">
            <thead>
              <tr>
                <th>Product</th>
                <th className="text-center">Quantity</th>
                <th className="text-right">Unit Price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items?.map((item, i) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td>
                    <p className="font-semibold text-white tracking-tight">{item.product?.name}</p>
                    <p className="text-xs text-ag-text-muted">{item.product?.brand} {item.product?.model}</p>
                  </td>
                  <td className="text-center text-white font-medium">{item.quantity}</td>
                  <td className="text-right text-ag-text-muted">{formatCurrency(item.unitPrice)}</td>
                  <td className="text-right font-semibold text-white">{formatCurrency(parseFloat(item.unitPrice) * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </motion.div>
  );
};

export default SaleDetails;
