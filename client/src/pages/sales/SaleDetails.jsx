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
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--om-border)', borderTopColor: 'var(--om-accent)' }} />
    </div>
  );

  if (!sale) return <div className="p-8 text-center" style={{ color: 'var(--om-text)' }}>Sale not found.</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      
      <div className="flex items-center justify-between gap-4 mb-6 pt-4">
        <div className="flex items-center gap-4">
          <Link to="/app/transactions" className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--om-surface)', color: 'var(--om-text)', border: '1px solid var(--om-border)' }}>
            <HiOutlineArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--om-text)' }}>Sale Details</h1>
            <p className="text-[11px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--om-text-muted)' }}>{new Date(sale.createdAt).toLocaleString('en-IN')}</p>
          </div>
        </div>
        
        {sale.invoice ? (
          <button onClick={viewInvoicePDF} className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ backgroundColor: 'var(--om-accent)', color: '#FFFFFF' }}>
            <HiOutlinePrinter className="w-4 h-4" /> Invoice
          </button>
        ) : (
          <button onClick={generateInvoice} disabled={generating} className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-50" style={{ backgroundColor: 'var(--om-accent)', color: '#FFFFFF' }}>
            {generating ? <span className="animate-pulse">Wait...</span> : <><HiOutlineDocumentAdd className="w-4 h-4" /> Generate</>}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 mb-6 gap-6">
        <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--om-card)', border: '1px solid var(--om-border)', boxShadow: '0 4px 12px var(--om-shadow)' }}>
          <h3 className="text-sm font-bold tracking-wide uppercase mb-6" style={{ color: 'var(--om-text-secondary)', borderBottom: '1px dashed var(--om-border)', paddingBottom: '12px' }}>Customer Details</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--om-text-muted)' }}>Name</p>
              <p className="text-[15px] font-bold leading-tight" style={{ color: 'var(--om-text)' }}>{sale.customer?.name || 'Walk-in'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--om-text-muted)' }}>Phone</p>
              <p className="text-[15px] font-bold leading-tight" style={{ color: 'var(--om-text)' }}>{sale.customer?.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--om-text-muted)' }}>Payment Mode</p>
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded" style={{ backgroundColor: `color-mix(in srgb, var(--om-accent) 15%, transparent)`, color: 'var(--om-accent)' }}>
                {sale.paymentMode}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--om-text-muted)' }}>Billed By</p>
              <p className="text-[15px] font-bold leading-tight" style={{ color: 'var(--om-text)' }}>{sale.user?.name}</p>
            </div>
          </div>

          {sale.invoice && (
            <div className="mt-8 pt-6" style={{ borderTop: '1px dashed var(--om-border)' }}>
              <div className="flex justify-between items-center rounded-xl p-5" style={{ backgroundColor: 'var(--om-surface)', border: '1px solid var(--om-border)' }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--om-text-muted)' }}>Generated Invoice</p>
                  <p className="text-[16px] font-bold tracking-widest" style={{ color: 'var(--om-accent)' }}>{sale.invoice.invoiceNumber}</p>
                </div>
                <div className="w-10 h-10 rounded-full flex justify-center items-center" style={{ backgroundColor: `color-mix(in srgb, var(--om-accent) 10%, transparent)`, color: 'var(--om-accent)' }}>
                  <HiOutlineDocumentDownload className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden mb-8" style={{ backgroundColor: 'var(--om-card)', border: '1px solid var(--om-border)', boxShadow: '0 4px 12px var(--om-shadow)' }}>
        <div className="p-5 flex justify-between items-center" style={{ borderBottom: '1px dashed var(--om-border)', backgroundColor: 'var(--om-surface)' }}>
          <h3 className="text-sm font-bold tracking-wide uppercase" style={{ color: 'var(--om-text-secondary)' }}>Purchased Items</h3>
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--om-bg)', color: 'var(--om-text-muted)', border: '1px solid var(--om-border)' }}>{sale.items?.length || 0} items</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left font-bold text-[10px] uppercase tracking-widest p-4 pb-2" style={{ color: 'var(--om-text-muted)', borderBottom: '1px solid var(--om-border)' }}>Product</th>
                <th className="text-center font-bold text-[10px] uppercase tracking-widest p-4 pb-2 whitespace-nowrap" style={{ color: 'var(--om-text-muted)', borderBottom: '1px solid var(--om-border)' }}>Quantity</th>
                <th className="text-right font-bold text-[10px] uppercase tracking-widest p-4 pb-2 whitespace-nowrap" style={{ color: 'var(--om-text-muted)', borderBottom: '1px solid var(--om-border)' }}>Unit Price</th>
                <th className="text-right font-bold text-[10px] uppercase tracking-widest p-4 pb-2" style={{ color: 'var(--om-text-muted)', borderBottom: '1px solid var(--om-border)' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items?.map((item, i) => (
                <tr key={item.id} className="transition-colors group hover:bg-black/5 dark:hover:bg-ag-bg-card">
                  <td className="p-4" style={{ borderBottom: i === sale.items.length - 1 ? 'none' : '1px solid var(--om-border)' }}>
                    <p className="font-bold text-[14px]" style={{ color: 'var(--om-text)' }}>{item.product?.name}</p>
                    <p className="text-[11px] font-medium" style={{ color: 'var(--om-text-muted)' }}>{item.product?.brand} {item.product?.model}</p>
                  </td>
                  <td className="text-center p-4 font-bold text-[14px]" style={{ color: 'var(--om-text)', borderBottom: i === sale.items.length - 1 ? 'none' : '1px solid var(--om-border)' }}>
                    {item.quantity}
                  </td>
                  <td className="text-right p-4 font-semibold text-[13px]" style={{ color: 'var(--om-text-muted)', borderBottom: i === sale.items.length - 1 ? 'none' : '1px solid var(--om-border)' }}>
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="text-right p-4 font-bold text-[15px]" style={{ color: 'var(--om-text)', borderBottom: i === sale.items.length - 1 ? 'none' : '1px solid var(--om-border)' }}>
                    {formatCurrency(parseFloat(item.unitPrice) * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl p-6 md:p-8 ml-auto max-w-md w-full" style={{ backgroundColor: 'var(--om-card)', border: '1px solid var(--om-border)', boxShadow: '0 4px 12px var(--om-shadow)' }}>
         <h3 className="text-[12px] font-bold uppercase tracking-widest mb-6" style={{ color: 'var(--om-text-secondary)', borderBottom: '1px dashed var(--om-border)', paddingBottom: '12px' }}>Financials</h3>
         <div className="space-y-4">
           <div className="flex justify-between items-center">
             <span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--om-text-muted)' }}>Sub Total</span>
             <span className="text-[15px] font-bold" style={{ color: 'var(--om-text)' }}>{formatCurrency(parseFloat(sale.totalAmount) + parseFloat(sale.discount))}</span>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--om-text-muted)' }}>Discount</span>
             <span className="text-[15px] font-bold text-red-500">-{formatCurrency(sale.discount)}</span>
           </div>
           <div style={{ height: '1px', backgroundColor: 'var(--om-border)', margin: '16px 0' }} />
           <div className="flex justify-between items-center">
             <span className="text-[16px] font-black uppercase tracking-wider" style={{ color: 'var(--om-text)' }}>Grand Total</span>
             <span className="text-2xl font-black tracking-tight" style={{ color: 'var(--om-accent)' }}>{formatCurrency(sale.totalAmount)}</span>
           </div>
         </div>
      </div>

    </motion.div>
  );
};

export default SaleDetails;
