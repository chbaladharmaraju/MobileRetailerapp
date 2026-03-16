import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlineShoppingCart, HiOutlineDeviceMobile, HiOutlineX, HiOutlinePhotograph, HiOutlineArrowRight } from 'react-icons/hi';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
};

import SearchBar from '../../components/common/SearchBar';

const SecondHandList = () => {
  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get('/secondhand/intake')
      .then(({ data }) => setIntakes(data.intakes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredIntakes = intakes.filter(item => 
    item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.imei?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold tracking-tight text-om-text flex items-center gap-3">
              Second-Hand Market
            </h1>
            <p className="text-sm text-om-text-muted mt-2">Manage pre-owned device inventory, intakes, and sales securely.</p>
          </motion.div>
        </div>
      </div>

      <SearchBar 
        value={searchQuery} 
        onChange={setSearchQuery} 
        placeholder="Search by brand, model, imei or customer..."
      />

      {/* Action Buttons (Reference Inspired) */}
      <div className="flex flex-row gap-6 justify-center items-center py-4">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 max-w-[280px]">
          <Link to="/secondhand/intake" className="block w-full">
            <div className="relative group overflow-hidden rounded-[20px] p-1 bg-gradient-to-b from-slate-200 to-slate-400 shadow-[0_6px_0_#94a3b8,0_12px_20px_rgba(0,0,0,0.3)]">
              <div className="bg-[#22C55E] rounded-[16px] py-4 px-6 flex items-center justify-center border-t-2 border-ag-border">
                <span className="text-2xl font-black text-om-text tracking-widest uppercase italic drop-shadow-md">BUY</span>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 max-w-[280px]">
          <button 
            onClick={() => document.getElementById('inventory-table').scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="block w-full outline-none"
          >
             <div className="relative group overflow-hidden rounded-[20px] p-1 bg-gradient-to-b from-slate-200 to-slate-400 shadow-[0_6px_0_#94a3b8,0_12px_20px_rgba(0,0,0,0.3)]">
              <div className="bg-[#EF4444] rounded-[16px] py-4 px-6 flex items-center justify-center border-t-2 border-ag-border">
                <span className="text-2xl font-black text-om-text tracking-widest uppercase italic drop-shadow-md">SELL</span>
              </div>
            </div>
          </button>
        </motion.div>
      </div>

      {/* Inventory Section */}
      <div id="inventory-table" className="pt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-om-surface border border-om-border flex items-center justify-center shadow-inner">
            <HiOutlineDeviceMobile className="w-5 h-5 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-om-text tracking-tight">Active Inventory</h2>
        </div>
        
        <div className="glass-card bg-om-card border border-om-border overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-4 px-6 text-xs font-semibold text-om-text-muted uppercase tracking-widest border-b border-om-border bg-om-surface">Device</th>
                  <th className="py-4 px-6 text-xs font-semibold text-om-text-muted uppercase tracking-widest border-b border-om-border bg-om-surface">IMEI</th>
                  <th className="py-4 px-6 text-xs font-semibold text-om-text-muted uppercase tracking-widest border-b border-om-border bg-om-surface">Condition</th>
                  <th className="py-4 px-6 text-xs font-semibold text-om-text-muted uppercase tracking-widest border-b border-om-border bg-om-surface">Buy Price</th>
                  <th className="py-4 px-6 text-xs font-semibold text-om-text-muted uppercase tracking-widest border-b border-om-border bg-om-surface">Status</th>
                  <th className="py-4 px-6 text-right text-xs font-semibold text-om-text-muted uppercase tracking-widest border-b border-om-border bg-om-surface">Actions</th>
                </tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="show">
                  {loading ? (
                  <tr><td colSpan="6" className="text-center py-16 text-om-text-muted"><div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" /></td></tr>
                ) : filteredIntakes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-16">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-om-surface mb-4">
                        <HiOutlineDeviceMobile className="w-8 h-8 text-om-text-muted" />
                      </div>
                      <p className="text-om-text-muted font-medium">No second-hand inventory found</p>
                      <Link to="/secondhand/intake" className="text-orange-400 hover:text-orange-300 text-sm font-semibold mt-2 inline-block">Record first intake →</Link>
                    </td>
                  </tr>
                ) : (
                  filteredIntakes.map((item) => (
                    <motion.tr key={item.id} variants={itemVariants} className="group hover:bg-om-surface transition-colors border-b border-om-border last:border-0">
                      <td className="py-4 px-6">
                        <p className="font-bold text-om-text tracking-tight">{item.brand} {item.model}</p>
                        <p className="text-xs text-om-text-muted mt-1">From: {item.customer?.name}</p>
                      </td>
                      <td className="py-4 px-6 text-om-text-muted font-mono text-xs">{item.imei}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                          item.condition === 'EXCELLENT' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          item.condition === 'GOOD' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          item.condition === 'FAIR' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {item.condition}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-om-text font-medium">₹{parseFloat(item.buyingPrice).toLocaleString('en-IN')}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${item.isSold ? 'text-green-400' : 'text-orange-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isSold ? 'bg-green-400' : 'bg-orange-400 animate-pulse'}`} />
                          {item.isSold ? 'Sold' : 'Available'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {item.devicePhotos && item.devicePhotos.length > 0 && (
                            <button 
                              onClick={() => setSelectedPhotos(item.devicePhotos)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-om-surface hover:bg-om-border text-om-text-muted hover:text-om-text transition-colors"
                              title="View Photos"
                            >
                              <HiOutlinePhotograph className="w-4 h-4" />
                            </button>
                          )}
                          {!item.isSold && (
                            <Link to={`/secondhand/resale/${item.id}`} className="ag-btn ag-btn-primary !px-5 !py-2 !text-xs shadow-lg shadow-orange-500/20">
                              Sell Device
                            </Link>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </motion.tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Photo Viewer Modal */}
      <AnimatePresence>
        {selectedPhotos && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
            onClick={() => setSelectedPhotos(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-[90vh] glass-card bg-om-card border border-om-border p-4 overflow-hidden border border-ag-border shadow-2xl"
            >
              <div className="absolute top-6 right-6 z-10">
                <button
                  onClick={() => setSelectedPhotos(null)}
                  className="p-2 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-om-text/70 hover:text-om-text transition-all hover:scale-110 active:scale-95"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="overflow-y-auto p-2 custom-scrollbar max-h-[calc(90vh-2rem)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPhotos.map((url, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden bg-om-surface border border-om-border relative group aspect-[4/3]">
                      <img 
                        src={getImageUrl(url)} 
                        alt={`Device view ${i + 1}`} 
                        className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default SecondHandList;
