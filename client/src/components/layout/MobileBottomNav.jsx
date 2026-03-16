import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiOutlineViewGrid,
  HiOutlineChartBar,
  HiOutlineCube,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineShoppingCart,
  HiOutlineDeviceMobile,
  HiOutlinePhone,
  HiOutlineTruck,
  HiOutlineDocumentText,
  HiOutlineDocumentReport,
  HiOutlineAdjustments,
  HiOutlineCurrencyRupee
} from 'react-icons/hi';

const tabs = [
  { path: '/app', icon: HiOutlineViewGrid, label: 'HOME', end: true },
  { path: '/app/analytics', icon: HiOutlineChartBar, label: 'DASHBOARD' },
  { path: '__menu__', icon: HiOutlineMenu, label: 'ALL' },
  { path: '/inventory', icon: HiOutlineCube, label: 'ITEMS' },
  { path: '/app/transactions', icon: HiOutlineDocumentReport, label: 'TRANSACTIONS' },
];

const menuItems = [
  { icon: HiOutlineShoppingCart, label: 'New Sale', path: '/sales/new', color: '#EF4444' },
  { icon: HiOutlinePhone, label: 'Second Hand', path: '/secondhand', color: '#3B82F6' },
  { icon: HiOutlineAdjustments, label: 'Repairs', path: '/repairs', color: '#22C55E' },
  { icon: HiOutlineCube, label: 'Inventory', path: '/inventory', color: '#8B5CF6' },
  { icon: HiOutlineTruck, label: 'Suppliers', path: '/suppliers', color: '#f97316' },
  { icon: HiOutlineDocumentText, label: 'Invoices', path: '/invoices', color: '#ec4899' },
  { icon: HiOutlineCurrencyRupee, label: 'Daily Pay', path: '/payments/daily', color: '#EF4444' },
];

const MobileBottomNav = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpenMenu = () => setShowMenu(true);
    window.addEventListener('openMobileMenu', handleOpenMenu);
    return () => window.removeEventListener('openMobileMenu', handleOpenMenu);
  }, []);

  return (
    <>
      {/* Menu Overlay */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-[55]"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setShowMenu(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute left-4 right-4 rounded-3xl px-5 pt-5 pb-6 shadow-2xl"
              style={{ bottom: '85px', backgroundColor: 'var(--om-card)', border: '1px solid var(--om-border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-[15px] font-bold" style={{ color: 'var(--om-text)' }}>All Menu</h3>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ color: 'var(--om-text-muted)' }}
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { navigate(item.path); setShowMenu(false); }}
                    className="flex flex-col items-center gap-2 py-3 rounded-2xl transition-all active:scale-95"
                    style={{ backgroundColor: 'var(--om-surface)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `color-mix(in srgb, ${item.color} 15%, transparent)` }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: 'var(--om-text-secondary)' }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'var(--om-card)',
          borderTop: '1px solid var(--om-border)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex items-stretch justify-around safe-area-bottom">
          {tabs.map((tab) => {
            if (tab.path === '__menu__') {
              return (
                <button
                  key="menu"
                  onClick={() => setShowMenu(true)}
                  className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 flex-1 transition-all duration-200"
                  style={{ color: showMenu ? '#EF4444' : 'var(--om-text-muted)', borderTop: showMenu ? '2px solid #EF4444' : '2px solid transparent' }}
                >
                  <tab.icon className="w-5 h-5 shrink-0" />
                  <span className="text-[8px] font-bold tracking-wider uppercase leading-none">{tab.label}</span>
                </button>
              );
            }
            if (tab.path === '__desktop__') {
              return (
                <button
                  key="desktop"
                  onClick={() => { /* Future: show desktop mode */ }}
                  className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 flex-1 transition-all duration-200"
                  style={{ color: 'var(--om-text-muted)', borderTop: '2px solid transparent' }}
                >
                  <tab.icon className="w-5 h-5 shrink-0" />
                  <span className="text-[8px] font-bold tracking-wider uppercase leading-none">{tab.label}</span>
                </button>
              );
            }
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                end={tab.end}
                className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 flex-1 transition-all duration-200"
                style={({ isActive }) => ({
                  color: isActive ? '#EF4444' : 'var(--om-text-muted)',
                  borderTop: isActive ? '2px solid #EF4444' : '2px solid transparent',
                })}
              >
                <tab.icon className="w-5 h-5 shrink-0" />
                <span className="text-[8px] font-bold tracking-wider uppercase leading-none">{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
