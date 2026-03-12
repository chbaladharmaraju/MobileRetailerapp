import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineEye } from 'react-icons/hi';
import api from '../../services/api';

const InvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/invoices')
      .then(({ data }) => setInvoices(data.invoices || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const typeLabels = { new_sale: 'New Sale', secondhand_sale: 'Used Sale', repair: 'Repair' };
  const typeColors = { new_sale: 'ag-badge-info', secondhand_sale: 'ag-badge-warning', repair: 'ag-badge-success' };

  const filteredInvoices = invoices.filter(inv => {
    const custName = inv.sale?.customer?.name || inv.repair?.customer?.name || inv.secondHandSale?.intake?.customer?.name || '';
    return inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
           custName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const InvoiceCard = ({ inv }) => {
    const customer = inv.sale?.customer?.name || inv.repair?.customer?.name || inv.secondHandSale?.intake?.customer?.name || '—';
    return (
      <Link to={`/invoices/${inv.id}`} className="glass-card p-4 block hover:bg-white/[0.04] transition-all border-white/5 active:scale-[0.98]">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-mono text-xs text-white bg-white/5 px-2 py-1 rounded inline-block">{inv.invoiceNumber}</p>
            <p className="text-[10px] text-ag-text-dim mt-1 uppercase tracking-widest leading-none">
              {new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          </div>
          <span className={`ag-badge ${typeColors[inv.type]} scale-90 origin-right`}>{typeLabels[inv.type]}</span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-ag-text-muted mb-0.5">Customer</p>
            <p className="text-sm font-semibold text-white tracking-tight leading-tight">{customer}</p>
          </div>
          <p className="text-base font-bold text-white tracking-tighter">₹{parseFloat(inv.grandTotal).toLocaleString('en-IN')}</p>
        </div>
      </Link>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Invoice History</h1>
          <p className="text-xs text-ag-text-dim mt-1 uppercase tracking-widest">{invoices.length} total generated</p>
        </div>
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search invoice or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ag-input text-xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
           <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="glass-card p-20 text-center text-ag-text-dim text-sm">
          No matching invoices found.
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="grid grid-cols-1 gap-4 sm:hidden">
            {filteredInvoices.map((inv) => (
              <InvoiceCard key={inv.id} inv={inv} />
            ))}
          </div>

          {/* Desktop View */}
          <div className="glass-card overflow-hidden hidden sm:block">
            <div className="overflow-x-auto">
              <table className="ag-table w-full">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Type</th>
                    <th>Customer</th>
                    <th className="text-right">Total Amount</th>
                    <th>Date</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv, i) => {
                    const customer = inv.sale?.customer?.name || inv.repair?.customer?.name || inv.secondHandSale?.intake?.customer?.name || '—';
                    return (
                      <motion.tr key={inv.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                        <td className="font-mono text-white text-xs tracking-tight">{inv.invoiceNumber}</td>
                        <td><span className={`ag-badge ${typeColors[inv.type]} scale-90 origin-left`}>{typeLabels[inv.type]}</span></td>
                        <td className="text-white font-medium">{customer}</td>
                        <td className="text-right text-white font-bold tracking-tighter">₹{parseFloat(inv.grandTotal).toLocaleString('en-IN')}</td>
                        <td className="text-ag-text-muted text-xs tracking-wide">
                          {new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="text-right">
                          <Link to={`/invoices/${inv.id}`} className="ag-btn bg-white/5 hover:bg-white/10 text-white p-2 h-auto inline-flex">
                            <HiOutlineEye className="w-4 h-4" />
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default InvoicesList;
