import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineBell, HiOutlineSearch, HiOutlineMenu, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const Topbar = ({ sidebarOpen, setSidebarOpen }) => {
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const getPageTitle = (path) => {
    if (path === '/') return 'Overview';
    if (path.startsWith('/sales/new')) return 'New Sale';
    if (path.startsWith('/sales/')) return 'Sale Details';
    if (path.startsWith('/sales')) return 'Sales Management';
    if (path.startsWith('/secondhand/intake')) return 'Device Intake';
    if (path.startsWith('/secondhand')) return 'Second-Hand Phones';
    if (path.startsWith('/repairs/new')) return 'New Service';
    if (path.startsWith('/repairs')) return 'Repair Center';
    if (path.startsWith('/inventory')) return 'Inventory Management';
    if (path.startsWith('/invoices')) return 'Invoices Tracker';
    if (path.startsWith('/customers/') && path.includes('ledger')) return 'Customer Ledger';
    if (path.startsWith('/customers')) return 'Customers';
    if (path.startsWith('/analytics')) return 'Analytics';
    return 'Dashboard';
  };

  const title = getPageTitle(location.pathname);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data } = await api.get('/inventory/alerts?isRead=false');
        setAlerts(data);
      } catch (error) {
        // silently fail
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full"
      style={{
        background: 'var(--om-topbar-bg)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      <div className="flex items-center justify-between gap-3 py-4 px-4 sm:px-6"
        style={{ borderBottom: '1px solid var(--om-border)' }}
      >
        {/* Left: Menu Toggle & Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-xl transition-all shrink-0 active:scale-95"
            style={{
              background: 'var(--om-glass)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--om-border)',
              color: 'var(--om-text)',
            }}
          >
            <HiOutlineMenu className="w-5 h-5" />
          </button>

          <div className="hidden md:block min-w-0">
            <h1 className="text-xl font-bold tracking-tight leading-none truncate" style={{ color: 'var(--om-text)' }}>{title}</h1>
            <p className="text-[10px] mt-1 font-medium uppercase tracking-widest" style={{ color: 'var(--om-text-muted)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="md:hidden flex-1 min-w-0">
            <h1 className="text-base font-bold truncate" style={{ color: 'var(--om-text)' }}>{title}</h1>
          </div>
        </div>

        {/* Right: Search + Theme Toggle + Alerts */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Search Bar (desktop only) */}
          <div className={`relative hidden lg:flex items-center transition-all duration-400 ${searchFocused ? 'w-[320px]' : 'w-48'}`}>
            <div
              className="relative flex items-center w-full rounded-xl overflow-hidden transition-all duration-300"
              style={{
                background: 'var(--om-glass)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${searchFocused ? 'var(--om-accent)' : 'var(--om-border)'}`,
                boxShadow: searchFocused ? '0 0 0 3px var(--om-accent-glow)' : 'none',
              }}
            >
              <HiOutlineSearch className="absolute left-3 w-4 h-4" style={{ color: searchFocused ? 'var(--om-accent)' : 'var(--om-text-muted)' }} />
              <input
                type="text"
                placeholder="Search..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full bg-transparent border-none py-2 pl-9 pr-3 text-[13px] focus:outline-none focus:ring-0 font-medium"
                style={{ color: 'var(--om-text)' }}
              />
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl transition-all duration-300 active:scale-95"
            style={{
              background: 'var(--om-glass)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--om-border)',
              color: 'var(--om-text-secondary)',
            }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <HiOutlineSun className="w-[18px] h-[18px]" /> : <HiOutlineMoon className="w-[18px] h-[18px]" />}
          </button>

          {/* Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative p-2 rounded-xl transition-all"
              style={{
                background: 'var(--om-glass)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--om-border)',
                color: 'var(--om-text-secondary)',
              }}
            >
              <HiOutlineBell className="w-[18px] h-[18px]" />
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full shadow-lg" style={{ backgroundColor: 'var(--om-red)' }} />
              )}
            </button>

            {/* Alert Dropdown */}
            <AnimatePresence>
              {showAlerts && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-[calc(100%+8px)] w-72 glass-card p-4 z-50"
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-[13px] font-bold" style={{ color: 'var(--om-text)' }}>Notifications</h3>
                    <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--om-accent-glow)', color: 'var(--om-accent)' }}>
                      {alerts.length} New
                    </span>
                  </div>

                  {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <HiOutlineBell className="w-7 h-7 mb-2" style={{ color: 'var(--om-text-muted)' }} />
                      <p className="text-[13px] font-medium" style={{ color: 'var(--om-text-secondary)' }}>All caught up!</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
                      {alerts.slice(0, 5).map((alert, index) => (
                        <motion.div
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                          key={alert.id}
                          className="p-2.5 rounded-lg cursor-pointer transition-colors"
                          style={{ backgroundColor: 'var(--om-surface)' }}
                        >
                          <div className="flex gap-2">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--om-red)' }} />
                            <div>
                              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--om-text)' }}>{alert.message}</p>
                              <p className="text-[10px] mt-1 font-medium" style={{ color: 'var(--om-text-muted)' }}>
                                {new Date(alert.createdAt).toLocaleString('en-IN', {
                                  hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short'
                                })}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
