import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineShoppingCart,
  HiOutlineDeviceMobile,
  HiOutlineCog,
  HiOutlineCube,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineLogout,
  HiOutlineX,
  HiOutlineTruck,
} from 'react-icons/hi';

const navItems = [
  { path: '/app', icon: HiOutlineViewGrid, label: 'Dashboard' },
  { path: '/sales', icon: HiOutlineShoppingCart, label: 'Sales' },
  { path: '/secondhand', icon: HiOutlineDeviceMobile, label: 'Second-Hand' },
  { path: '/repairs', icon: HiOutlineCog, label: 'Repairs' },
  { path: '/customers', icon: HiOutlineUserGroup, label: 'Customers' },
  { path: '/inventory', icon: HiOutlineCube, label: 'Inventory' },
  { path: '/suppliers', icon: HiOutlineTruck, label: 'Suppliers' },
  { path: '/invoices', icon: HiOutlineDocumentText, label: 'Invoices' },
  { path: '/analytics', icon: HiOutlineChartBar, label: 'Analytics', adminOnly: true },
];

const Sidebar = ({ open, setOpen }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    setOpen(false);
  };

  const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex fixed md:relative h-screen z-50 flex-col w-[260px] shrink-0"
        style={{
          background: 'var(--om-glass)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRight: '1px solid var(--om-border)',
          boxShadow: 'inset -1px 0 0 var(--om-glass-border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 pt-7">
          <div className="w-16 h-10 flex items-center justify-center shrink-0 overflow-hidden">
            <img src="https://res.cloudinary.com/dogxrczp3/image/upload/v1773350425/logo_2_qlc6y5.png" alt="Orange Mobile Logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-wide truncate" style={{ color: 'var(--om-text)' }}>Orange Mobile</h1>
            <p className="text-[10px] uppercase tracking-widest font-medium mt-0.5" style={{ color: 'var(--om-text-muted)' }}>Retail OS</p>
          </div>
        </div>

        <SidebarContent
          filteredItems={filteredItems}
          user={user}
          isAdmin={isAdmin}
          handleLogout={handleLogout}
          onNavClick={() => {}}
        />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="md:hidden fixed left-0 top-0 h-screen z-[60] flex flex-col w-[280px]"
            style={{
              background: 'var(--om-glass)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              borderRight: '1px solid var(--om-border)',
              boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
            }}
          >
            {/* Close Button */}
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--om-border)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-8 flex items-center justify-center shrink-0 overflow-hidden">
                  <img src="https://res.cloudinary.com/dogxrczp3/image/upload/v1773350425/logo_2_qlc6y5.png" alt="Orange Mobile Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-sm font-bold tracking-wide truncate" style={{ color: 'var(--om-text)' }}>Orange Mobile</h1>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl transition-colors shrink-0"
                style={{ color: 'var(--om-text-muted)' }}
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <SidebarContent
              filteredItems={filteredItems}
              user={user}
              isAdmin={isAdmin}
              handleLogout={handleLogout}
              onNavClick={handleNavClick}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

const SidebarContent = ({ filteredItems, user, isAdmin, handleLogout, onNavClick }) => {
  const handleLogoutClick = () => {
    handleLogout();
    onNavClick();
  };

  return (
    <>
      <div className="px-4 py-2 mt-3">
        <p className="text-[10px] font-semibold px-3 mb-1 tracking-widest uppercase" style={{ color: 'var(--om-text-muted)' }}>Menu</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/app'}
            onClick={onNavClick}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200"
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'var(--om-accent-glow)' : 'transparent',
              color: isActive ? 'var(--om-accent)' : 'var(--om-text-secondary)',
              borderLeft: isActive ? '3px solid var(--om-accent)' : '3px solid transparent',
            })}
          >
            <item.icon className="w-[18px] h-[18px] shrink-0 transition-colors" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-3 mx-3 mb-4 rounded-xl" style={{
        background: 'var(--om-surface)',
        border: '1px solid var(--om-border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div className="flex items-center gap-3 mb-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--om-accent), var(--om-purple))' }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate" style={{ color: 'var(--om-text)' }}>{user?.name}</p>
            <p className="text-[10px] truncate" style={{ color: 'var(--om-text-muted)' }}>{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogoutClick}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-[11px] font-medium transition-all duration-200"
          style={{ color: 'var(--om-text-muted)', border: '1px solid transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--om-red)'; e.currentTarget.style.backgroundColor = 'var(--om-badge-danger-bg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--om-text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <HiOutlineLogout className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
