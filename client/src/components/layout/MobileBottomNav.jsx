import { NavLink } from 'react-router-dom';
import {
  HiOutlineViewGrid,
  HiOutlineShoppingCart,
  HiOutlineCube,
  HiOutlineDeviceMobile,
  HiOutlineUserGroup,
} from 'react-icons/hi';

const tabs = [
  { path: '/app', icon: HiOutlineViewGrid, label: 'Home' },
  { path: '/sales', icon: HiOutlineShoppingCart, label: 'Sales' },
  { path: '/inventory', icon: HiOutlineCube, label: 'Inventory' },
  { path: '/secondhand', icon: HiOutlineDeviceMobile, label: 'Second-Hand' },
  { path: '/customers', icon: HiOutlineUserGroup, label: 'Customers' },
];

const MobileBottomNav = () => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'var(--om-glass)',
        borderTop: '1px solid var(--om-glass-border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-around py-2 px-1 safe-area-bottom">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === '/app'}
            className="flex flex-col items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[64px]"
            style={({ isActive }) => ({
              color: isActive ? 'var(--om-accent)' : 'var(--om-text-muted)',
              backgroundColor: isActive ? 'var(--om-accent-glow)' : 'transparent',
            })}
          >
            <tab.icon className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-bold tracking-tight uppercase">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
