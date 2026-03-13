import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineDeviceMobile, HiOutlineReceiptRefund, HiOutlineCash, HiOutlineChartBar, HiOutlineArrowRight, HiOutlineCheck } from 'react-icons/hi';
import ParticleBackground from '../../components/common/ParticleBackground';

const featureCards = [
  {
    icon: HiOutlineDeviceMobile,
    title: 'Smart Inventory',
    body: 'Manage new phones, used intakes, and accessories. Track stock levels with real-time alerts and low-stock indicators.',
    iconBg: 'rgba(79, 140, 255, 0.15)',
    iconColor: '#4F8CFF',
  },
  {
    icon: HiOutlineReceiptRefund,
    title: 'Repair Specialist',
    body: 'Full lifecycle repair tracking: intake, status updates, parts used, and automated invoicing.',
    iconBg: 'rgba(34, 197, 94, 0.15)',
    iconColor: '#22C55E',
  },
  {
    icon: HiOutlineCash,
    title: 'Financial Ledger',
    body: 'Automated credit management for customers and debt tracking for suppliers. Track every Rupee.',
    iconBg: 'rgba(249, 115, 22, 0.15)',
    iconColor: '#F97316',
  },
  {
    icon: HiOutlineChartBar,
    title: 'Shop Analytics',
    body: 'Beautifully visualized daily, monthly, and yearly insights. Understand profit margins instantly.',
    iconBg: 'rgba(167, 139, 250, 0.15)',
    iconColor: '#A78BFA',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } },
};

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: '#0B0F14', color: '#F8FAFC' }}
    >
      {/* ─── Animated Particle Hero Background ─── */}
      <div className="absolute inset-0 z-0">
        <ParticleBackground />
        {/* Radial gradient glow behind hero */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 35%, rgba(255,138,0,0.18), transparent 60%)' }} />
        {/* Additional ambient blobs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(79, 140, 255, 0.1), transparent 70%)' }} />
        <div className="absolute top-1/2 -right-20 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(167, 139, 250, 0.08), transparent 70%)' }} />
      </div>

      {/* ─── Header ─── */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 lg:px-14 pt-6 sm:pt-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-10 sm:w-16 sm:h-12 rounded-xl flex items-center justify-center p-1 overflow-hidden">
            <img src="https://res.cloudinary.com/dogxrczp3/image/upload/v1773350425/logo_2_qlc6y5.png" alt="Orange Mobile Logo" className="w-full h-full object-contain" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold tracking-[0.32em] text-orange-400 uppercase">Orange Mobile Retail</p>
            <p className="text-[11px] text-slate-500 mt-0.5 tracking-wide">Next-Gen Retail OS</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link to="/login"
            className="px-7 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold text-slate-300 border border-white/10 hover:border-orange-500/40 hover:bg-orange-500/[0.04] transition-all duration-500 ease-in-out"
            style={{ backdropFilter: 'blur(12px)' }}>
            Log in
          </Link>
          <Link to="/signup"
            className="px-7 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/50 hover:scale-[1.05] active:scale-[0.98] transition-all duration-500 ease-in-out">
            Get started
          </Link>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-5 sm:px-8 lg:px-14 pt-16 sm:pt-24 pb-14 overflow-y-auto">

        {/* ─── Hero Section ─── */}
        <section className="w-full max-w-4xl text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
          >
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[12px] font-semibold border border-orange-500/20 text-slate-300 mb-8"
              style={{ background: 'rgba(249, 115, 22, 0.05)', backdropFilter: 'blur(12px)' }}
            >
              <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse" />
              Build For Retail Mobile Shops
            </motion.div>

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
              className="flex justify-center mb-8"
            >
              <div className="w-24 h-20 sm:w-32 sm:h-24 flex items-center justify-center p-2 overflow-hidden">
                <img src="https://res.cloudinary.com/dogxrczp3/image/upload/v1773350425/logo_2_qlc6y5.png" alt="Orange Mobile Logo" className="w-full h-full object-contain" />
              </div>
            </motion.div>

            {/* Headline */}
            <h1 className="text-[2rem] sm:text-[2.8rem] lg:text-[3.4rem] font-bold tracking-tight text-white leading-[1.1] max-w-3xl mx-auto">
              Run your entire{' '}
              <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                mobile store
              </span>{' '}
              from one premium dashboard.
            </h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-8 text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium"
            >
              Experience the future of shop management. Orange Mobile Retail simplifies sales, repairs,
              and finance into one intuitive and powerful ecosystem.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="mt-12 sm:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/signup"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-4 px-12 py-5 rounded-lg text-base sm:text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_10px_40px_-10px_rgba(249,115,22,0.5)] hover:shadow-[0_15px_50px_-10px_rgba(249,115,22,0.6)] hover:scale-[1.05] active:scale-[0.96] transition-all duration-500 ease-in-out"
              >
                Start For Your Shop
                <HiOutlineArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-500" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-12 py-5 rounded-lg text-sm sm:text-base font-semibold text-slate-300 border border-white/10 hover:border-orange-500/40 hover:bg-orange-500/[0.04] transition-all duration-500 ease-in-out"
                style={{ backdropFilter: 'blur(12px)' }}
              >
                Already using Orange Mobile Retail?
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* ─── Trust & Security Section ─── */}
        <section className="w-full max-w-5xl mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
              className="space-y-8"
            >
              <h2 className="text-[2.2rem] sm:text-[2.8rem] font-bold text-white tracking-tight leading-[1.1]">
                Verified <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">Secure</span>.
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed font-medium">
                Your shop data is protected by industry-leading security protocols, ensuring absolute privacy and reliability.
              </p>
              <ul className="space-y-5">
                {[
                  'Cloud-native data synchronization',
                  'Encrypted financial ledgers',
                  'Secure customer records',
                  'High-availability infrastructure'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-sm sm:text-base text-slate-300 font-medium">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)' }}>
                      <HiOutlineCheck className="w-4 h-4 text-orange-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
  
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
              className="rounded-2xl overflow-hidden relative aspect-video border border-white/[0.08]"
              style={{
                background: 'rgba(18, 24, 33, 0.6)',
                backdropFilter: 'blur(32px) saturate(180%)',
                WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 50px rgba(0,0,0,0.4)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.1] to-transparent" />
              <div className="relative flex flex-col items-center justify-center h-full p-8 text-center">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-28 h-24 sm:w-36 sm:h-28 flex items-center justify-center p-3 mb-6 overflow-hidden"
                >
                  <img src="https://res.cloudinary.com/dogxrczp3/image/upload/v1773350425/logo_2_qlc6y5.png" alt="Orange Mobile Logo" className="w-full h-full object-contain" />
                </motion.div>
                <p className="text-sm font-bold text-white tracking-[0.4em] uppercase opacity-90">Verified Secure</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── Optimized Experience ─── */}
        <section className="w-full max-w-5xl mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="rounded-3xl border border-white/[0.08] p-8 sm:p-12 text-center"
            style={{
              background: 'rgba(18, 24, 33, 0.5)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 40px rgba(0,0,0,0.3)',
            }}
          >
            <p className="text-xs font-bold text-orange-500 uppercase tracking-[0.4em] mb-8">
              How the app was
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 leading-relaxed">
              Experience absolute precision in inventory, sales, and analytics with Orange Mobile Retail’s premium management ecosystem.
            </h3>
            <div className="flex justify-center gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-orange-500/20" />
              ))}
            </div>
          </motion.div>
        </section>

        {/* ─── Features Grid (Moved Down) ─── */}
        <section className="w-full max-w-6xl mb-20">
          <div className="text-center mb-16">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-bold text-orange-400 uppercase tracking-[0.4em] mb-4"
            >
              Core Modules
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight"
            >
              Everything Your Shop Needs.
            </motion.h2>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {featureCards.map((card) => (
              <motion.div
                key={card.title}
                variants={itemVariants}
                className="relative overflow-hidden rounded-2xl p-8 border border-white/[0.08] group cursor-default transition-all duration-500"
                style={{
                  background: 'rgba(18, 24, 33, 0.4)',
                  backdropFilter: 'blur(32px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.2)',
                }}
              >
                {/* Top glow accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-10 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700"
                  style={{ backgroundColor: card.iconColor }} />
                <div className="relative">
                  <div
                    className="mb-8 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/[0.1] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg"
                    style={{ backgroundColor: card.iconBg, color: card.iconColor }}
                  >
                    <card.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 tracking-tight">{card.title}</h3>
                  <p className="text-[14px] text-slate-400 leading-relaxed font-medium">{card.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 px-5 sm:px-8 py-6 text-center border-t border-white/[0.06]">
        <p className="text-[12px] text-slate-500 tracking-[0.4em] uppercase font-bold">
          Orange Mobile Retail • Premium Shop OS
        </p>
      </footer>
    </div>
  );
};

export default Landing;
