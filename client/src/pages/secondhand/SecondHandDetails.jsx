import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineArrowLeft, 
  HiOutlineIdentification, 
  HiOutlinePhotograph, 
  HiOutlineCurrencyRupee,
  HiOutlineDeviceMobile,
  HiOutlineUserCircle,
  HiOutlineCalendar,
  HiOutlineX,
  HiOutlineDocumentText
} from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUrl';

const SecondHandDetails = () => {
  const { id } = useParams();
  const [intake, setIntake] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await api.get(`/secondhand/intake/${id}`);
        setIntake(data);
      } catch (err) {
        toast.error('Failed to load device history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--om-border)', borderTopColor: 'var(--om-accent)' }} />
    </div>
  );

  if (!intake) return (
    <div className="p-8 text-center" style={{ color: 'var(--om-text)' }}>
      <p className="font-bold">Device record not found.</p>
      <Link to="/app/transactions" className="mt-4 inline-block text-om-accent font-bold uppercase tracking-widest text-[11px]">Back to Activity</Link>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pt-4">
        <Link to="/app/transactions" className="p-2.5 rounded-xl transition-colors" style={{ backgroundColor: 'var(--om-surface)', color: 'var(--om-text)', border: '1px solid var(--om-border)' }}>
          <HiOutlineArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: 'var(--om-text)' }}>
            Device Lifecycle
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ml-2 ${intake.isSold ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
              {intake.isSold ? 'SOLD' : 'INSTOCK'}
            </span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1" style={{ color: 'var(--om-text-muted)' }}>
            ID: {intake.id.split('-')[0].toUpperCase()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Device Identification Card */}
        <div className="rounded-[24px] p-6 border-om-border" style={{ backgroundColor: 'var(--om-card)', border: '1px solid var(--om-border)', boxShadow: '0 8px 32px var(--om-shadow)' }}>
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--om-surface)', color: 'var(--om-orange)' }}>
                <HiOutlineDeviceMobile className="w-5 h-5" />
             </div>
             <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--om-text)' }}>Device Spec</h3>
          </div>
          
          <div className="space-y-5">
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--om-text-muted)' }}>Brand</p>
                  <p className="text-base font-black" style={{ color: 'var(--om-text)' }}>{intake.brand}</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--om-text-muted)' }}>Model</p>
                  <p className="text-base font-black" style={{ color: 'var(--om-text)' }}>{intake.model}</p>
               </div>
             </div>
             <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--om-text-muted)' }}>IMEI/Serial</p>
                <p className="text-sm font-mono tracking-tight" style={{ color: 'var(--om-text-secondary)' }}>{intake.imei}</p>
             </div>
             <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--om-text-muted)' }}>Condition</p>
                <span className="inline-block px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider" style={{ backgroundColor: 'var(--om-surface)', color: 'var(--om-accent)' }}>
                  {intake.condition}
                </span>
             </div>
             {intake.notes && (
               <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--om-text-muted)' }}>Internal Notes</p>
                  <p className="text-[13px] italic leading-relaxed" style={{ color: 'var(--om-text-secondary)' }}>"{intake.notes}"</p>
               </div>
             )}
          </div>
        </div>

        {/* Financial Flow Card */}
        <div className="rounded-[24px] p-6" style={{ backgroundColor: 'var(--om-card)', border: '1px solid var(--om-border)', boxShadow: '0 8px 32px var(--om-shadow)' }}>
           <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--om-surface)', color: 'var(--om-green)' }}>
                <HiOutlineCurrencyRupee className="w-5 h-5" />
             </div>
             <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--om-text)' }}>Financials</h3>
          </div>

          <div className="space-y-6">
             <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--om-surface)', border: '1px solid var(--om-border)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--om-text-muted)' }}>Purchase Cost</p>
                <p className="text-2xl font-black text-red-500">{formatCurrency(intake.buyingPrice)}</p>
             </div>

             {intake.isSold ? (
               <>
                 <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--om-surface)', border: '1px solid var(--om-border)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--om-text-muted)' }}>Resale Revenue</p>
                    <p className="text-2xl font-black text-green-500">{formatCurrency(intake.sale?.sellingPrice)}</p>
                 </div>
                 <div className="flex justify-between items-center px-4">
                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--om-text-muted)' }}>Net Profit</span>
                    <span className="text-xl font-black" style={{ color: 'var(--om-accent)' }}>{formatCurrency(intake.sale?.profit)}</span>
                 </div>
               </>
             ) : (
               <div className="p-8 text-center rounded-2xl border border-dashed border-om-border">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--om-text-muted)' }}>Item in Inventory</p>
                  <Link to={`/secondhand/resale/${intake.id}`} className="mt-4 inline-block px-6 py-2 rounded-xl bg-om-accent text-ag-text text-[11px] font-black tracking-widest uppercase shadow-lg shadow-om-accent/20">
                    Resell Now
                  </Link>
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Intake Party Details */}
        <div className="rounded-[24px] p-6" style={{ backgroundColor: 'var(--om-card)', border: '1px solid var(--om-border)' }}>
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-8 pb-4 border-b border-dashed border-om-border" style={{ color: 'var(--om-text-muted)' }}>
            Acquisition History
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--om-surface)', color: 'var(--om-text-secondary)' }}>
                  <HiOutlineIdentification className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--om-text-muted)' }}>Original Owner</p>
                   <p className="text-[15px] font-black" style={{ color: 'var(--om-text)' }}>{intake.customer?.name}</p>
                   <p className="text-xs font-semibold" style={{ color: 'var(--om-text-secondary)' }}>{intake.customer?.phone}</p>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--om-surface)', color: 'var(--om-text-secondary)' }}>
                  <HiOutlineCalendar className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--om-text-muted)' }}>Purchase Date</p>
                   <p className="text-[15px] font-black" style={{ color: 'var(--om-text)' }}>{new Date(intake.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                   <p className="text-xs font-semibold" style={{ color: 'var(--om-text-secondary)' }}>{new Date(intake.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--om-surface)', color: 'var(--om-text-secondary)' }}>
                  <HiOutlineUserCircle className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--om-text-muted)' }}>Handled By</p>
                   <p className="text-[15px] font-black" style={{ color: 'var(--om-text)' }}>{intake.user?.name}</p>
                   <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--om-orange)' }}>Orange Admin</p>
                </div>
             </div>
          </div>
        </div>

        {/* Resale Details Section */}
        {intake.isSold && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="rounded-[24px] p-6" style={{ backgroundColor: 'var(--om-card)', border: '1px solid var(--om-border)' }}>
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-8 pb-4 border-b border-dashed border-om-border" style={{ color: 'var(--om-text-muted)' }}>
              Outward (Sale) History
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--om-surface)', color: 'var(--om-accent)' }}>
                    <HiOutlineIdentification className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--om-text-muted)' }}>New Buyer</p>
                     <p className="text-[15px] font-black" style={{ color: 'var(--om-text)' }}>{intake.sale?.buyerName}</p>
                     <p className="text-xs font-semibold" style={{ color: 'var(--om-text-secondary)' }}>{intake.sale?.buyerPhone}</p>
                  </div>
               </div>
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--om-surface)', color: 'var(--om-accent)' }}>
                    <HiOutlineDocumentText className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--om-text-muted)' }}>Sale Details</p>
                     <p className="text-[15px] font-black" style={{ color: 'var(--om-text)' }}>Payment via {intake.sale?.paymentMode.toUpperCase()}</p>
                     <p className="text-xs font-semibold" style={{ color: 'var(--om-text-secondary)' }}>{new Date(intake.sale?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {/* Media / Photos */}
        {(intake.kycPhotos?.length > 0 || intake.devicePhotos?.length > 0) && (
          <div className="rounded-[24px] p-6" style={{ backgroundColor: 'var(--om-card)', border: '1px solid var(--om-border)' }}>
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-2" style={{ color: 'var(--om-text-muted)' }}>
               <HiOutlinePhotograph className="w-4 h-4" /> Media Documentation
             </h3>
             
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[...(intake.devicePhotos || []), ...(intake.kycPhotos || [])].map((url, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedPhoto(url)}
                    className="aspect-square rounded-2xl overflow-hidden border-2 border-om-border cursor-zoom-in relative group"
                  >
                    <img src={getImageUrl(url)} alt={`Photo ${idx}`} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                  </motion.div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Photo Overlay */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
             <button className="absolute top-8 right-8 text-ag-text/50 hover:text-ag-text transition-colors" onClick={() => setSelectedPhoto(null)}>
                <HiOutlineX className="w-8 h-8" />
             </button>
             <motion.img 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               src={getImageUrl(selectedPhoto)} 
               className="max-w-full max-h-full object-contain rounded-xl shadow-2xl shadow-black/50"
             />
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default SecondHandDetails;
