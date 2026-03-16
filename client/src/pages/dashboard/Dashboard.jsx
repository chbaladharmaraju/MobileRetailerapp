import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  HiOutlineCurrencyRupee,
  HiOutlineShoppingCart,
  HiOutlineCube,
  HiOutlineExclamation,
  HiOutlinePhone,
  HiOutlineTruck,
  HiOutlineEye,
  HiOutlineShare,
  HiOutlineDocumentReport,
  HiOutlineCog,
  HiOutlineArrowCircleRight,
  HiOutlineUserGroup,
  HiOutlineAdjustments,
} from 'react-icons/hi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const StatCard = ({ icon: Icon, label, value, subValue, color = 'var(--om-accent)' }) => (
  <motion.div
    variants={itemVariants}
    className="glass-card px-6 py-5 group relative overflow-hidden"
    whileHover={{ y: -2 }}
  >
    {/* Subtle gradient accent */}
    <div
      className="absolute top-0 left-0 right-0 h-1 rounded-t-[14px]"
      style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
    />
    <div className="relative flex items-start justify-between z-10">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: 'var(--om-text-muted)' }}>{label}</p>
        <p className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--om-text)' }}>{value}</p>
        {subValue && (
          <p className="text-[11px] font-medium" style={{ color: 'var(--om-text-secondary)' }}>{subValue}</p>
        )}
      </div>
      <div
        className="p-3 rounded-[14px] transition-all duration-300 group-hover:scale-110"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, color: color }}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  const isAnalytics = location.pathname === '/app/analytics';

  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const tickColor = isDark ? '#64748B' : '#94A3B8';
  const tooltipBg = isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const tooltipText = isDark ? '#F8FAFC' : '#0F172A';

  useEffect(() => { fetchData(); }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: analytics } = await api.get(`/analytics?period=${period}`);
      setData(analytics);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const pieData = data ? [
    { name: 'New Sales', value: parseFloat(data.summary.newSales.profit) || 0 },
    { name: 'Used Sales', value: parseFloat(data.summary.secondHandSales.profit) || 0 },
    { name: 'Repairs', value: parseFloat(data.summary.repairs.profit) || 0 },
  ] : [];

  const hasData = data && (data.summary.totalRevenue > 0 || data.summary.totalRepairsInPeriod > 0);

  // Color-coded palette
  const BLUE = '#4F8CFF';
  const GREEN = '#22C55E';
  const ORANGE = '#F97316';
  const PURPLE = '#A78BFA';
  const PIE_COLORS = [BLUE, GREEN, ORANGE];

  const [mobileTab, setMobileTab] = useState('transactions');
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ customerId: null, amount: '', paymentMode: 'cash', notes: '' });

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        const { data } = await api.get('/transactions/all');
        setRecentTransactions(data.slice(0, 5));
      } catch (err) { /* silently fail */ }
    };
    const fetchCustomersList = async () => {
      try {
        const { data } = await api.get('/customers');
        setCustomersList(data.customers || []);
      } catch (err) { /* silently fail */ }
    };
    fetchRecentTransactions();
    fetchCustomersList();
  }, []);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      if (parseFloat(paymentForm.amount) <= 0) return toast.error('Amount must be positive');
      
      await api.post('/credit/payment', {
        customerId: paymentForm.customerId,
        amount: parseFloat(paymentForm.amount),
        paymentMode: paymentForm.paymentMode,
        notes: paymentForm.notes
      });
      
      toast.success('Payment recorded successfully');
      setShowPaymentModal(false);
      setPaymentForm({ customerId: null, amount: '', paymentMode: 'cash', notes: '' });
      // Refresh context
      fetchData();
      const { data } = await api.get('/customers');
      setCustomersList(data.customers || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants}>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0a0a0a] border border-ag-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <h3 className="text-lg font-semibold text-ag-text mb-6">Receive Payment</h3>
              
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-ag-text-dim uppercase tracking-wider ml-1 mb-1 block">Amount (₹)</label>
                  <input type="number" step="0.01" className="ag-input" value={paymentForm.amount} onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-ag-text-dim uppercase tracking-wider ml-1 mb-1 block">Mode</label>
                  <select className="ag-input" value={paymentForm.paymentMode} onChange={(e) => setPaymentForm({...paymentForm, paymentMode: e.target.value})}>
                    <option value="cash">Cash</option><option value="upi">UPI</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowPaymentModal(false)} className="ag-btn bg-ag-bg-card text-ag-text flex-1">Cancel</button>
                  <button type="submit" className="ag-btn ag-btn-primary flex-1">Clear Balance</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ═══ MOBILE DASHBOARD ═══════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="md:hidden -mx-4 -mt-2 pb-24">

        {isAnalytics ? (
          /* Mobile Analytics (Dashboard) View */
          <>
            {/* Mobile Header with Period Filter */}
            <div className="flex justify-between items-center px-4 pt-4 pb-2">
              <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--om-text)' }}>Overview</h2>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg outline-none"
                style={{
                  backgroundColor: 'var(--om-card)',
                  color: 'var(--om-text)',
                  border: '1px solid var(--om-border)'
                }}
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {/* Mobile Charts */}
            {data && (
              <div className="px-4 py-2 space-y-4">
                <motion.div variants={itemVariants} className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--om-card)', border: '1px solid var(--om-border)' }}>
                  <h3 className="text-xs font-bold mb-4 tracking-wider uppercase" style={{ color: 'var(--om-text-secondary)' }}>Trend (Revenue & Profit)</h3>
                  <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.salesTrend} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorProfitMob" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={GREEN} stopOpacity={0.2} /><stop offset="95%" stopColor={GREEN} stopOpacity={0} /></linearGradient>
                      <linearGradient id="colorSecondHandMob" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={ORANGE} stopOpacity={0.2} /><stop offset="95%" stopColor={ORANGE} stopOpacity={0} /></linearGradient>
                      <linearGradient id="colorRepairMob" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={BLUE} stopOpacity={0.2} /><stop offset="95%" stopColor={BLUE} stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 10 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', fontSize: '11px', color: tooltipText }} formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                    <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="totalProfit" stroke={GREEN} strokeWidth={2} fill="url(#colorProfitMob)" name="Profit" />
                    <Area type="monotone" dataKey="secondHandRevenue" stroke={ORANGE} strokeWidth={2} fill="url(#colorSecondHandMob)" name="Used Sales" />
                    <Area type="monotone" dataKey="repairRevenue" stroke={BLUE} strokeWidth={2} fill="url(#colorRepairMob)" name="Repairs" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--om-card)', border: '1px solid var(--om-border)' }}>
              <h3 className="text-xs font-bold mb-2 tracking-wider uppercase" style={{ color: 'var(--om-text-secondary)' }}>Profit Breakdown</h3>
              <div className="flex items-center h-[140px]">
                <div className="w-[140px] h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: tooltipBg, border: 'none', borderRadius: '8px', fontSize: '11px', color: tooltipText }} formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 pl-4 space-y-3">
                  {pieData.map((item, i) => {
                    const total = pieData.reduce((sum, d) => sum + d.value, 0);
                    const percent = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
                    return (
                      <div key={i} className="flex flex-col">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-[10px] uppercase font-bold text-slate-400">{item.name} ({percent}%)</span>
                        </div>
                        <span className="text-xs font-bold pl-4" style={{ color: 'var(--om-text)' }}>₹{item.value.toLocaleString('en-IN')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
            
            {/* Summary Stats on Mobile */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <motion.div variants={itemVariants} className="p-4 rounded-2xl flex flex-col items-center text-center" style={{ backgroundColor: 'var(--om-card)', border: '1px solid var(--om-border)' }}>
                <HiOutlineShoppingCart className="w-5 h-5 mb-2" style={{ color: BLUE }} />
                <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--om-text-muted)' }}>Revenue</p>
                <p className="text-lg font-bold" style={{ color: 'var(--om-text)' }}>{formatCurrency(data.summary.totalRevenue)}</p>
              </motion.div>
              <motion.div variants={itemVariants} className="p-4 rounded-2xl flex flex-col items-center text-center" style={{ backgroundColor: 'var(--om-card)', border: '1px solid var(--om-border)' }}>
                <HiOutlineCube className="w-5 h-5 mb-2" style={{ color: PURPLE }} />
                <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--om-text-muted)' }}>Pending</p>
                <p className="text-lg font-bold text-red-400">{formatCurrency(data.summary.outstandingCredit)}</p>
              </motion.div>
              <motion.div 
                variants={itemVariants} 
                onClick={() => navigate('/payments/daily')}
                className="p-4 rounded-2xl flex flex-col items-center text-center col-span-2 mt-2" 
                style={{ backgroundColor: 'var(--om-card)', border: '1px solid var(--om-border)' }}
              >
                <div className="flex items-center gap-3 mb-1">
                  <HiOutlineCurrencyRupee className="w-5 h-5" style={{ color: ORANGE }} />
                  <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--om-text-muted)' }}>Today's Paid Out</p>
                </div>
                <p className="text-2xl font-black text-om-text">₹{(data.summary.todayPayment || 0).toLocaleString('en-IN')}</p>
                <div className="flex items-center gap-1 mt-2 text-[9px] font-bold text-ag-primary uppercase tracking-widest">
                  View Breakdown <HiOutlineArrowCircleRight className="w-3 h-3" />
                </div>
              </motion.div>
            </div>
          </div>
        )}
        </>
      ) : (
        /* Mobile Home View */
        <>
        {/* Quick Links */}
        <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--om-border)' }}>
          <p className="text-[13px] font-semibold mb-4" style={{ color: 'var(--om-text-secondary)' }}>Quick Links</p>
          <div className="flex items-center gap-5">
            {[
              { icon: HiOutlineShoppingCart, label: 'New Sale', path: '/sales/new', color: '#EF4444' },
              { icon: HiOutlineAdjustments, label: 'Repairs', path: '/repairs', color: '#22C55E' },
              { icon: HiOutlinePhone, label: 'Second Hand', path: '/secondhand', color: '#F97316' },
              { icon: HiOutlineArrowCircleRight, label: 'Show All', path: '__menu__', color: '#3B82F6' },
            ].map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  if (link.path === '__menu__') window.dispatchEvent(new Event('openMobileMenu'));
                  else navigate(link.path);
                }}
                className="flex flex-col items-center gap-2 flex-1"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform active:scale-95"
                  style={{ backgroundColor: `color-mix(in srgb, ${link.color} 12%, transparent)` }}
                >
                  <link.icon className="w-5 h-5" style={{ color: link.color }} />
                </div>
                <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: 'var(--om-text-secondary)' }}>{link.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 px-4 py-3">
          <button
            onClick={() => setMobileTab('transactions')}
            className="px-5 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300"
            style={{
              backgroundColor: mobileTab === 'transactions' ? '#EF4444' : 'var(--om-surface)',
              color: mobileTab === 'transactions' ? '#FFFFFF' : 'var(--om-text-secondary)',
              border: mobileTab === 'transactions' ? 'none' : '1px solid var(--om-border)',
            }}
          >
            Transaction Details
          </button>
          <button
            onClick={() => setMobileTab('customers')}
            className="px-5 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300"
            style={{
              backgroundColor: mobileTab === 'customers' ? '#EF4444' : 'var(--om-surface)',
              color: mobileTab === 'customers' ? '#FFFFFF' : 'var(--om-text-secondary)',
              border: mobileTab === 'customers' ? 'none' : '1px solid var(--om-border)',
            }}
          >
            Party Details
          </button>
        </div>

        {/* Transaction Cards / Customer Cards */}
        <div className="px-4 py-4 space-y-4">
          {mobileTab === 'transactions' ? (
            loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-ag-primary/20"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-ag-primary border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-ag-primary border-t-transparent animate-[spin_2s_linear_infinite_reverse] opacity-50 scale-75"></div>
                </div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-ag-primary animate-pulse">Loading Activity...</p>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm font-medium" style={{ color: 'var(--om-text-muted)' }}>No recent transactions</p>
              </div>
            ) : (
              recentTransactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate('/app/transactions')}
                  className="p-4 rounded-[16px] cursor-pointer active:scale-[0.98] transition-all"
                  style={{
                    backgroundColor: 'var(--om-surface)',
                    border: '1px solid var(--om-border)',
                  }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px]" style={{ backgroundColor: `color-mix(in srgb, var(--om-text) 8%, transparent)`, color: 'var(--om-text)' }}>
                        {(tx.customerName && tx.customerName !== 'Walk-in') ? tx.customerName.charAt(0).toUpperCase() : 'W'}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[14px] font-bold leading-tight" style={{ color: 'var(--om-text)' }}>{tx.customerName || 'Walk-in Customer'}</p>
                        <p className="text-[10px] font-semibold tracking-wide uppercase mt-1" style={{ color: 'var(--om-text-muted)' }}>
                          {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[16px] font-bold" style={{ color: 'var(--om-text)' }}>₹{Math.abs(parseFloat(tx.amount || 0)).toLocaleString('en-IN')}</p>
                      <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider" style={{ backgroundColor: `color-mix(in srgb, ${BLUE} 15%, transparent)`, color: BLUE }}>
                        {tx.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px dashed var(--om-border)' }}>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--om-text-muted)' }}>Status:</span>
                       <span className="text-[11px] font-bold" style={{ color: tx.status === 'PAID' ? GREEN : ORANGE }}>{tx.status}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--om-text-muted)' }}>
                      View <HiOutlineArrowCircleRight className="w-4 h-4 ml-0.5" />
                    </div>
                  </div>
                </motion.div>
              ))
            )
          ) : (
            /* Customer Tab */
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1 mb-2">
                <h3 className="text-sm font-bold" style={{ color: 'var(--om-text-secondary)' }}>All Customers</h3>
                <button
                  onClick={() => navigate('/customers')}
                  className="text-xs font-bold"
                  style={{ color: '#EF4444' }}
                >
                  Manage
                </button>
              </div>

              {customersList.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm font-medium mb-3" style={{ color: 'var(--om-text-muted)' }}>No customers found</p>
                </div>
              ) : (
                customersList.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate(`/customers/${c.id}/ledger`)}
                    className="p-4 rounded-2xl flex items-center justify-between active:scale-95 transition-transform"
                    style={{
                      backgroundColor: 'var(--om-card)',
                      border: '1px solid var(--om-border)',
                      boxShadow: '0 2px 12px var(--om-shadow)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[16px]" style={{ backgroundColor: `color-mix(in srgb, var(--om-text) 10%, transparent)`, color: 'var(--om-text)' }}>
                        {c.name ? c.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <p className="font-bold text-[15px]" style={{ color: 'var(--om-text)' }}>{c.name}</p>
                        <p className="text-[11px] font-medium" style={{ color: 'var(--om-text-muted)' }}>{c.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {parseFloat(c.creditBalance) > 0 ? (
                        <div className="flex flex-col items-end">
                          <span 
                            onClick={(e) => { e.stopPropagation(); setPaymentForm({ ...paymentForm, customerId: c.id, amount: parseFloat(c.creditBalance) }); setShowPaymentModal(true); }}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold px-3 py-1.5 cursor-pointer rounded-xl text-[10px] uppercase border border-red-500/20 active:scale-95 transition-all">
                            Clear
                          </span>
                          <span className="text-[13px] font-bold text-red-400 mt-1">₹{parseFloat(c.creditBalance).toLocaleString('en-IN')}</span>
                        </div>
                      ) : (
                        <span className="text-green-500 font-bold bg-green-500/10 px-3 py-1.5 rounded-xl text-[12px] uppercase">
                          Clear
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
        </>
      )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ═══ DESKTOP DASHBOARD (unchanged) ══════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      {/* Period Filter */}
      <motion.div variants={itemVariants} className="hidden md:flex gap-1 mb-8 p-1 rounded-[14px] w-fit" style={{ backgroundColor: 'var(--om-surface)', border: '1px solid var(--om-border)' }}>
        {['daily', 'monthly', 'yearly'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="px-5 py-2 rounded-[12px] text-xs font-semibold transition-all duration-300"
            style={{
              backgroundColor: period === p ? 'var(--om-accent)' : 'transparent',
              color: period === p ? '#FFFFFF' : 'var(--om-text-secondary)',
            }}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </motion.div>

      <div className="hidden md:block">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-[20px] bg-gradient-to-tr from-orange-500/20 to-blue-500/20 blur-xl animate-pulse"></div>
            <div className="absolute inset-0 rounded-[20px] border border-ag-border bg-om-surface/50 backdrop-blur-sm shadow-xl flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-ag-primary/30 border-t-ag-primary animate-spin"></div>
            </div>
          </div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-ag-primary animate-pulse">Fetching Insights...</p>
        </div>
      ) : data ? (
        <>


            <>
              {/* Stats Grid */}
              <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                <StatCard icon={HiOutlineCurrencyRupee} label="Total Revenue" value={formatCurrency(data.summary.totalRevenue)} subValue={`${data.summary.newSales.count + data.summary.secondHandSales.count + data.summary.repairs.count} transactions`} color={BLUE} />
                <StatCard icon={HiOutlineShoppingCart} label="Purchase Costs" value={formatCurrency(data.summary.totalPurchaseCost)} subValue="Cost of Goods Sold" color={ORANGE} />
                <StatCard icon={HiOutlineCurrencyRupee} label="Net Profit" value={formatCurrency(data.summary.totalProfit)} subValue="Total Revenue - COGS" color={GREEN} />
                <StatCard icon={HiOutlineCurrencyRupee} label="Today's Paid Out" value={`₹${(data.summary.todayPayment || 0).toLocaleString('en-IN')}`} subValue="Settlements to Suppliers" color={ORANGE} />
                <StatCard icon={HiOutlineCube} label="Outstanding Credit" value={formatCurrency(data.summary.outstandingCredit)} subValue="Expected from Customers" color={PURPLE} />
              </motion.div>

              <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                <StatCard icon={HiOutlineTruck} label="Supplier Dues" value={formatCurrency(data.summary.supplierDues)} subValue="Amount owed to suppliers" color={ORANGE} />
                <StatCard icon={HiOutlineAdjustments} label="Repairs & Services" value={data.summary.totalRepairsInPeriod} subValue={`${data.summary.repairs.count} completed`} color={GREEN} />
                <StatCard icon={HiOutlinePhone} label="Products in Stock" value={data.inventory.totalProductsInStock} subValue={`${data.inventory.unresolvedAlerts} Actionable Alerts`} color={BLUE} />
              </motion.div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                {/* Revenue Trend */}
                <motion.div variants={itemVariants} className="glass-card p-6 pb-2 xl:col-span-2 flex flex-col">
                  <h3 className="text-sm font-semibold mb-6 tracking-wide" style={{ color: 'var(--om-text)' }}>Revenue & Profit Trend</h3>
                  <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.salesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={BLUE} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={GREEN} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11, fontWeight: 500 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11, fontWeight: 500 }} tickFormatter={(v) => formatCurrency(v)} />
                        <Tooltip
                          contentStyle={{ background: tooltipBg, backdropFilter: 'blur(16px)', border: `1px solid ${tooltipBorder}`, borderRadius: '12px', fontSize: '12px', color: tooltipText }}
                          formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                        />
                        <Area type="monotone" dataKey="totalRevenue" stroke={BLUE} strokeWidth={2} fill="url(#colorRevenue)" name="Revenue" />
                        <Area type="monotone" dataKey="totalProfit" stroke={GREEN} strokeWidth={2} fill="url(#colorProfit)" name="Profit" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Pie Chart */}
                <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col">
                  <h3 className="text-sm font-semibold mb-6 tracking-wide" style={{ color: 'var(--om-text)' }}>Profit Breakdown</h3>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px', fontSize: '12px', color: tooltipText }}
                            formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full space-y-2 mt-4">
                      {pieData.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-[11px]">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span style={{ color: 'var(--om-text-secondary)' }}>{item.name}</span>
                          </div>
                          <span className="font-semibold" style={{ color: 'var(--om-text)' }}>₹{item.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bar Chart */}
              <div className="grid grid-cols-1 gap-6 mb-10">
                <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col">
                  <h3 className="text-sm font-semibold mb-6 tracking-wide" style={{ color: 'var(--om-text)' }}>Performance Comparison</h3>
                  <div className="flex-1 min-h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.salesTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11, fontWeight: 500 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11, fontWeight: 500 }} tickFormatter={(v) => formatCurrency(v)} />
                        <Tooltip
                          cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                          contentStyle={{ background: tooltipBg, backdropFilter: 'blur(16px)', border: `1px solid ${tooltipBorder}`, borderRadius: '12px', fontSize: '12px', color: tooltipText }}
                          formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                        />
                        <Legend
                          verticalAlign="top" align="right" iconType="circle" iconSize={8}
                          wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: tickColor }}
                        />
                        <Bar dataKey="totalRevenue" name="Revenue" fill={BLUE} radius={[6, 6, 0, 0]} barSize={18} />
                        <Bar dataKey="purchaseCost" name="Costs" fill={ORANGE} radius={[6, 6, 0, 0]} barSize={18} />
                        <Bar dataKey="totalProfit" name="Profit" fill={GREEN} radius={[6, 6, 0, 0]} barSize={18} />
                        <Bar dataKey="customerPending" name="Pending" fill={PURPLE} radius={[6, 6, 0, 0]} barSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>

              {/* Inventory Alerts */}
              <motion.div variants={itemVariants} className="glass-card p-6">
                <h3 className="text-sm font-bold mb-6 flex items-center gap-3 tracking-widest uppercase" style={{ color: 'var(--om-text)' }}>
                  <HiOutlineExclamation className="w-5 h-5" style={{ color: 'var(--om-orange)' }} />
                  Inventory Status
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'In Stock', value: data.inventory.totalProductsInStock },
                    { label: 'Sold (Period)', value: data.inventory.totalSoldItems },
                    { label: 'Used Phones', value: data.inventory.secondHandInStock },
                    { label: 'Low Stock', value: data.inventory.lowStockProducts, alert: data.inventory.lowStockProducts > 0 },
                    { label: 'Unread Alerts', value: data.inventory.unresolvedAlerts, alert: data.inventory.unresolvedAlerts > 0 },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-[14px] transition-all duration-300"
                      style={{
                        backgroundColor: stat.alert ? 'var(--om-badge-danger-bg)' : 'var(--om-surface)',
                        border: `1px solid ${stat.alert ? 'var(--om-red)' : 'var(--om-border)'}`,
                      }}
                    >
                      <p className="text-2xl font-bold tracking-tight" style={{ color: stat.alert ? 'var(--om-red)' : 'var(--om-text)' }}>
                        {stat.value}
                      </p>
                      <p className="text-[10px] font-semibold mt-2 tracking-widest uppercase" style={{ color: 'var(--om-text-muted)' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>

          {/* Quick Actions */}
          <h3 className="text-sm font-bold mb-6 tracking-widest uppercase mt-10" style={{ color: 'var(--om-text)' }}>Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {[
              { icon: HiOutlineShoppingCart, label: 'New Sale', path: '/sales/new', color: BLUE },
              { icon: HiOutlineAdjustments, label: 'New Service', path: '/repairs/new', color: GREEN },
              { icon: HiOutlinePhone, label: 'Second-Hand', path: '/secondhand/intake', color: ORANGE },
            ].map((action) => (
              <motion.div
                key={action.label}
                variants={itemVariants}
                onClick={() => navigate(action.path)}
                className="glass-card p-8 flex flex-col items-center justify-center min-h-[140px] cursor-pointer group"
                whileHover={{ y: -2 }}
              >
                <div
                  className="p-4 rounded-[14px] mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: `color-mix(in srgb, ${action.color} 12%, transparent)`, color: action.color }}
                >
                  <action.icon className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--om-text)' }}>{action.label}</h3>
              </motion.div>
            ))}
          </div>
        </>
      ) : null}
      </div>
    </motion.div>
  );
};

export default Dashboard;
