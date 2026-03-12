import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  HiOutlineCurrencyRupee,
  HiOutlineShoppingCart,
  HiOutlineCube,
  HiOutlineExclamation,
  HiOutlineDeviceMobile,
  HiOutlineTruck,
} from 'react-icons/hi';
import { HiOutlineWrenchScrewdriver } from 'react-icons/hi2';
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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

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

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants}>

      {/* Period Filter */}
      <motion.div variants={itemVariants} className="flex gap-1 mb-8 p-1 rounded-[14px] w-fit" style={{ backgroundColor: 'var(--om-surface)', border: '1px solid var(--om-border)' }}>
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

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--om-border)', borderTopColor: 'var(--om-accent)' }} />
        </div>
      ) : data ? (
        <>
          {!hasData && (
            <motion.div variants={itemVariants} className="glass-card p-8 text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--om-text)' }}>Welcome{user?.name ? `, ${user.name}` : ''}! 👋</h2>
              <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--om-text-secondary)' }}>
                Your dashboard will populate once you start recording transactions. Use the quick actions below to get started!
              </p>
            </motion.div>
          )}

          {hasData && (
            <>
              {/* Stats Grid */}
              <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                <StatCard icon={HiOutlineCurrencyRupee} label="Total Revenue" value={formatCurrency(data.summary.totalRevenue)} subValue={`${data.summary.newSales.count + data.summary.secondHandSales.count + data.summary.repairs.count} transactions`} color={BLUE} />
                <StatCard icon={HiOutlineShoppingCart} label="Purchase Costs" value={formatCurrency(data.summary.totalPurchaseCost)} subValue="Cost of Goods Sold" color={ORANGE} />
                <StatCard icon={HiOutlineCurrencyRupee} label="Net Profit" value={formatCurrency(data.summary.totalProfit)} subValue="Total Revenue - COGS" color={GREEN} />
                <StatCard icon={HiOutlineCube} label="Outstanding Credit" value={formatCurrency(data.summary.outstandingCredit)} subValue="Expected from Customers" color={PURPLE} />
              </motion.div>

              <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                <StatCard icon={HiOutlineTruck} label="Supplier Dues" value={formatCurrency(data.summary.supplierDues)} subValue="Amount owed to suppliers" color={ORANGE} />
                <StatCard icon={HiOutlineWrenchScrewdriver} label="Repairs & Services" value={data.summary.totalRepairsInPeriod} subValue={`${data.summary.repairs.count} completed`} color={GREEN} />
                <StatCard icon={HiOutlineDeviceMobile} label="Products in Stock" value={data.inventory.totalProductsInStock} subValue={`${data.inventory.unresolvedAlerts} Actionable Alerts`} color={BLUE} />
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
          )}

          {/* Quick Actions */}
          <h3 className="text-sm font-bold mb-6 tracking-widest uppercase mt-10" style={{ color: 'var(--om-text)' }}>Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {[
              { icon: HiOutlineShoppingCart, label: 'New Sale', path: '/sales/new', color: BLUE },
              { icon: HiOutlineWrenchScrewdriver, label: 'New Service', path: '/repairs/new', color: GREEN },
              { icon: HiOutlineDeviceMobile, label: 'Second-Hand', path: '/secondhand/intake', color: ORANGE },
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
    </motion.div>
  );
};

export default Dashboard;
