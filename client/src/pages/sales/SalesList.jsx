import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlineEye, HiOutlineDocumentText } from 'react-icons/hi';
import api from '../../services/api';

import SearchBar from '../../components/common/SearchBar';

const SalesList = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const { data } = await api.get('/sales');
        setSales(data.sales || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchSales();
  }, []);

  const filteredSales = sales.filter(sale => 
    sale.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.items?.some(item => item.product?.model?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      
      <div className="mb-6">
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="Search sales by customer or model..."
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <p className="text-sm font-medium text-om-text-muted tracking-wide px-1">
          {filteredSales.length} total sales
        </p>
        <Link to="/sales/new" className="w-full sm:w-auto">
          <button className="ag-btn ag-btn-primary w-full">
            <HiOutlinePlus className="w-4 h-4" /> New Sale
          </button>
        </Link>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block glass-card bg-om-card border border-om-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="ag-table w-full">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Profit</th>
                <th>Payment</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-12 text-om-text-secondary text-sm">Loading...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-12 text-om-text-secondary text-sm">No sales yet</td></tr>
              ) : (
                filteredSales.map((sale, i) => (
                  <motion.tr key={sale.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <td className="font-medium text-om-text tracking-tight">{sale.customer?.name}</td>
                    <td className="text-om-text-muted">{sale.items?.length || 0}</td>
                    <td className="text-om-text font-semibold tracking-tight">₹{parseFloat(sale.totalAmount).toLocaleString('en-IN')}</td>
                    <td className="text-om-text-muted font-medium">₹{parseFloat(sale.totalProfit).toLocaleString('en-IN')}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="ag-badge ag-badge-info">{sale.paymentMode}</span>
                        {sale.invoice && <HiOutlineDocumentText className="w-4 h-4 text-ag-primary" title="Invoice Generated" />}
                      </div>
                    </td>
                    <td className="text-om-text-muted text-sm tracking-wide">
                      {new Date(sale.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="text-right">
                      <Link to={`/sales/${sale.id}`} className="inline-flex p-2 rounded-lg hover:bg-om-surface text-om-text-muted hover:text-om-text transition-colors">
                        <HiOutlineEye className="w-4 h-4" />
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="text-center py-12 text-om-text-secondary text-sm">Loading...</div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12 text-om-text-secondary text-sm">No sales yet</div>
        ) : (
          filteredSales.map((sale, i) => (
            <motion.div
              key={sale.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card bg-om-card border border-om-border p-5"
            >
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-om-border">
                <div>
                  <p className="font-semibold text-om-text tracking-tight">{sale.customer?.name}</p>
                  <p className="text-xs text-om-text-muted tracking-wide mt-1">
                    {new Date(sale.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <Link to={`/sales/${sale.id}`} className="p-2 -mt-2 -mr-2 rounded-lg hover:bg-om-surface text-om-text-muted hover:text-om-text transition-colors">
                  <HiOutlineEye className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div>
                  <p className="text-om-text-secondary text-[10px] font-medium tracking-wider uppercase mb-1">Items</p>
                  <p className="text-om-text font-medium">{sale.items?.length || 0}</p>
                </div>
                <div>
                  <p className="text-om-text-secondary text-[10px] font-medium tracking-wider uppercase mb-1">Payment</p>
                  <div className="flex items-center gap-2">
                    <span className="ag-badge ag-badge-info text-xs">{sale.paymentMode}</span>
                    {sale.invoice && <HiOutlineDocumentText className="w-4 h-4 text-ag-primary" />}
                  </div>
                </div>
                <div>
                  <p className="text-om-text-secondary text-[10px] font-medium tracking-wider uppercase mb-1">Total</p>
                  <p className="text-om-text font-semibold tracking-tight">₹{parseFloat(sale.totalAmount).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-om-text-secondary text-[10px] font-medium tracking-wider uppercase mb-1">Profit</p>
                  <p className="text-om-text-muted font-medium tracking-tight">₹{parseFloat(sale.totalProfit).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default SalesList;
