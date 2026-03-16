import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiOutlineShoppingCart, 
  HiOutlineAdjustments, 
  HiOutlinePhone, 
  HiOutlineSwitchHorizontal, 
  HiOutlineViewGrid,
  HiOutlineFilter,
  HiOutlineArrowCircleRight,
  HiOutlineCurrencyRupee
} from 'react-icons/hi';
import api from '../../services/api';
import SearchBar from '../../components/common/SearchBar';

const AllTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions/all');
      setTransactions(res.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = (t.customerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                          (t.title?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filter === 'ALL') return true;
    if (filter === 'SALES') return t.type === 'SALE' || t.type === 'SH_SELL';
    if (filter === 'REPAIRS') return t.type === 'REPAIR';
    if (filter === 'INTAKES') return t.type === 'SH_BUY';
    return true;
  });

  const getTypeStyles = (type) => {
    switch (type) {
      case 'SALE': return { icon: HiOutlineShoppingCart, color: '#4F8CFF', label: 'NEW SALE' };
      case 'REPAIR': return { icon: HiOutlineAdjustments, color: '#22C55E', label: 'REPAIR' };
      case 'SH_BUY': return { icon: HiOutlinePhone, color: '#F97316', label: 'BUYBACK' };
      case 'SH_SELL': return { icon: HiOutlineSwitchHorizontal, color: '#3B82F6', label: '2ND HAND' };
      case 'SUPPLIER_PAYMENT': return { icon: HiOutlineCurrencyRupee, color: '#A78BFA', label: 'PAYOUT' };
      default: return { icon: HiOutlineViewGrid, color: '#6875F5', label: 'TRX' };
    }
  };

  const handleTransactionClick = (t) => {
    if (t.type === 'SALE') {
      navigate(`/sales/${t.id}`);
    } else if (t.type === 'REPAIR') {
      navigate(`/repairs/${t.id}`);
    } else if (t.type === 'SH_BUY' || t.type === 'SH_SELL') {
      navigate(`/secondhand/details/${t.id}`);
    } else if (t.type === 'SUPPLIER_PAYMENT') {
      navigate('/payments/daily');
    }
  };

  const BLUE = '#4F8CFF';
  const GREEN = '#22C55E';
  const ORANGE = '#F97316';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black italic tracking-tight flex items-center gap-3" style={{ color: 'var(--om-text)' }}>
            <HiOutlineSwitchHorizontal className="w-8 h-8" style={{ color: 'var(--om-orange)' }} /> ACTIVITY
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--om-text-muted)' }}>Unified Transaction History</p>
        </div>
      </div>

      <SearchBar 
        value={searchQuery} 
        onChange={setSearchQuery} 
        placeholder="Search activity by customer or device..."
        className="mb-8"
      />

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {['ALL', 'SALES', 'REPAIRS', 'INTAKES'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
            style={{
              backgroundColor: filter === f ? 'var(--om-accent)' : 'var(--om-surface)',
              color: filter === f ? '#FFFFFF' : 'var(--om-text-secondary)',
              border: filter === f ? '1px solid transparent' : '1px solid var(--om-border)',
              boxShadow: filter === f ? '0 4px 12px var(--om-shadow)' : 'none'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-20 text-center">
            <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--om-border)', borderTopColor: 'var(--om-orange)' }} />
            <p className="font-bold uppercase tracking-widest text-[10px]" style={{ color: 'var(--om-text-muted)' }}>Loading Activity...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-20 px-10 rounded-2xl" style={{ backgroundColor: 'var(--om-surface)', border: '1px solid var(--om-border)' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'var(--om-bg)' }}>
              <HiOutlineFilter className="w-8 h-8" style={{ color: 'var(--om-text-muted)' }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--om-text)' }}>No activities found</h3>
            <p style={{ color: 'var(--om-text-secondary)' }}>Try changing your filters or start a new transaction.</p>
          </div>
        ) : (
          filteredTransactions.map((t, idx) => {
            const styles = getTypeStyles(t.type);
            return (
              <motion.div
                key={t.id + idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => handleTransactionClick(t)}
                className="p-4 rounded-[16px] cursor-pointer active:scale-[0.98] transition-all"
                style={{
                  backgroundColor: 'var(--om-surface)',
                  border: '1px solid var(--om-border)',
                }}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px]" style={{ backgroundColor: `color-mix(in srgb, var(--om-text) 8%, transparent)`, color: 'var(--om-text)' }}>
                      {(t.customerName && t.customerName !== 'Walk-in') ? t.customerName.charAt(0).toUpperCase() : 'W'}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[14px] font-bold leading-tight" style={{ color: 'var(--om-text)' }}>{t.customerName || 'Walk-in Customer'}</p>
                      <p className="text-[10px] font-semibold tracking-wide uppercase mt-1" style={{ color: 'var(--om-text-muted)' }}>
                        {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[16px] font-bold" style={{ color: 'var(--om-text)' }}>₹{Math.abs(parseFloat(t.amount || 0)).toLocaleString('en-IN')}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider" style={{ backgroundColor: `color-mix(in srgb, ${styles.color} 15%, transparent)`, color: styles.color }}>
                      {styles.label}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px dashed var(--om-border)' }}>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--om-text-muted)' }}>Status:</span>
                     <span className="text-[11px] font-bold" style={{ color: t.status === 'PAID' ? GREEN : ORANGE }}>{t.status}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--om-text-muted)' }}>
                    View <HiOutlineArrowCircleRight className="w-4 h-4 ml-0.5" />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AllTransactions;
