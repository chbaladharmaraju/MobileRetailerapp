import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileBottomNav from './MobileBottomNav';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen" style={{ backgroundColor: 'var(--om-bg)' }}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Page Content — extra bottom padding on mobile for the nav */}
        <main className="flex-1 px-4 sm:px-5 lg:px-8 py-2 pb-24 md:pb-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay (behind sidebar, above content) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 md:hidden z-50"
          style={{ backgroundColor: 'var(--om-overlay)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
