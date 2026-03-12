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

const SecondHandList = () => {
  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState(null);

  useEffect(() => {
    api.get('/secondhand/intake')
      .then(({ data }) => setIntakes(data.intakes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Second-Hand Market
              <span className="px-3 py-1 text-[10px] font-black tracking-widest uppercase bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/20">
                Premium
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-2">Manage pre-owned device inventory, intakes, and sales securely.</p>
          </motion.div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
          <Link to="/secondhand/intake" className="block h-full group">
            <div className="glass-card h-full p-8 relative overflow-hidden flex flex-col justify-between border-orange-500/20 group-hover:border-orange-500/40">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-500" />
              
              <div className="relative z-10 flex justify-between items-start mb-12">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                  <HiOutlinePlus className="w-7 h-7" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                  <HiOutlineArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
              </div>

              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-orange-400 transition-colors">Buy Device</h2>
                <p className="text-sm text-slate-400 leading-relaxed">Record a new pre-owned phone intake from a customer, verified securely.</p>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
          <button 
            onClick={() => document.getElementById('inventory-table').scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="block h-full w-full text-left group outline-none"
          >
            <div className="glass-card h-full p-8 relative overflow-hidden flex flex-col justify-between border-blue-500/20 group-hover:border-blue-500/40">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500" />
              
              <div className="relative z-10 flex justify-between items-start mb-12">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                  <HiOutlineShoppingCart className="w-7 h-7" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                  <HiOutlineArrowRight className="w-5 h-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300" />
                </div>
              </div>

              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors">Sell Device</h2>
                <p className="text-sm text-slate-400 leading-relaxed">Browse active inventory below, finalize sale, and calculate profits instantly.</p>
              </div>
            </div>
          </button>
        </motion.div>
      </div>

      {/* Inventory Section */}
      <div id="inventory-table" className="pt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
            <HiOutlineDeviceMobile className="w-5 h-5 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Active Inventory</h2>
        </div>
        
        <div className="glass-card overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-white/[0.08] bg-black/20">Device</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-white/[0.08] bg-black/20">IMEI</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-white/[0.08] bg-black/20">Condition</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-white/[0.08] bg-black/20">Buy Price</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-white/[0.08] bg-black/20">Status</th>
                  <th className="py-4 px-6 text-right text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-white/[0.08] bg-black/20">Actions</th>
                </tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="show">
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-16 text-slate-400"><div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" /></td></tr>
                ) : intakes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-16">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                        <HiOutlineDeviceMobile className="w-8 h-8 text-slate-500" />
                      </div>
                      <p className="text-slate-400 font-medium">No second-hand inventory found</p>
                      <Link to="/secondhand/intake" className="text-orange-400 hover:text-orange-300 text-sm font-semibold mt-2 inline-block">Record first intake →</Link>
                    </td>
                  </tr>
                ) : (
                  intakes.map((item) => (
                    <motion.tr key={item.id} variants={itemVariants} className="group hover:bg-white/[0.02] transition-colors border-b border-white/[0.04] last:border-0">
                      <td className="py-4 px-6">
                        <p className="font-bold text-white tracking-tight">{item.brand} {item.model}</p>
                        <p className="text-xs text-slate-500 mt-1">From: {item.customer?.name}</p>
                      </td>
                      <td className="py-4 px-6 text-slate-400 font-mono text-xs">{item.imei}</td>
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
                      <td className="py-4 px-6 text-white font-medium">₹{parseFloat(item.buyingPrice).toLocaleString('en-IN')}</td>
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
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
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
              className="relative max-w-5xl w-full max-h-[90vh] glass-card p-4 overflow-hidden border border-white/20 shadow-2xl"
            >
              <div className="absolute top-6 right-6 z-10">
                <button
                  onClick={() => setSelectedPhotos(null)}
                  className="p-2 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white/70 hover:text-white transition-all hover:scale-110 active:scale-95"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="overflow-y-auto p-2 custom-scrollbar max-h-[calc(90vh-2rem)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPhotos.map((url, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden bg-black/40 border border-white/5 relative group aspect-[4/3]">
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
