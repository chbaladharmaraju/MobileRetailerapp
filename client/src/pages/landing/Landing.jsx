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
            <p className="text-xs font-semibold tracking-[0.28em] text-slate-400 uppercase">Orange Mobile</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Retail OS</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login"
            className="px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300"
            style={{ backdropFilter: 'blur(8px)' }}>
            Log in
          </Link>
          <Link to="/signup"
            className="px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all duration-300">
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
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-medium border border-white/10 text-slate-400 mb-7"
              style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(8px)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)] animate-pulse" />
              Built for retail mobile shops • Powered by Neon Postgres
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
              className="mt-6 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
            >
              Orange Mobile Retail brings together new phone sales, second‑hand deals, repairs,
              customer credit and supplier payments into one smooth, premium interface.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="mt-9 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Link
                to="/signup"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm sm:text-base font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Start for your shop
                <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300"
                style={{ backdropFilter: 'blur(8px)' }}
              >
                Already using Orange Mobile?
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* ─── Features Grid ─── */}
        <section className="w-full max-w-6xl mb-28">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold text-orange-400 uppercase tracking-[0.3em] mb-3">Core Modules</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Everything your shop needs.</h2>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {featureCards.map((card) => (
              <motion.div
                key={card.title}
                variants={itemVariants}
                className="relative overflow-hidden rounded-2xl p-6 border border-white/[0.08] group cursor-default"
                style={{
                  background: 'rgba(18, 24, 33, 0.5)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.2)',
                }}
              >
                {/* Top glow accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                  style={{ backgroundColor: card.iconColor }} />
                <div className="relative">
                  <div
                    className="mb-5 w-12 h-12 rounded-xl flex items-center justify-center border border-white/[0.06] group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: card.iconBg, color: card.iconColor }}
                  >
                    <card.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{card.title}</h3>
                  <p className="text-[13px] text-slate-400 leading-relaxed">{card.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ─── Trust Section ─── */}
        <section className="w-full max-w-5xl mb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">
                Built on trust. Managed on{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">Orange Mobile</span>.
              </h2>
              <p className="text-base text-slate-400 leading-relaxed">
                For a mobile retailer, your data is your lifeline. That's why we built a system as reliable as it is beautiful.
              </p>
              <ul className="space-y-4">
                {[
                  'Cloud-first architecture with Neon PostgreSQL',
                  'Real-time stock synchronization across devices',
                  'Encrypted financial ledgers and customer data',
                  'Optimized for rapid intake and checkout'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)' }}>
                      <HiOutlineCheck className="w-3 h-3 text-orange-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-2xl overflow-hidden relative aspect-video border border-white/[0.08]"
              style={{
                background: 'rgba(18, 24, 33, 0.5)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.06] to-transparent" />
              <div className="relative flex flex-col items-center justify-center h-full">
                <div className="w-24 h-20 sm:w-32 sm:h-24 flex items-center justify-center p-2 mb-4 overflow-hidden">
                  <img src="https://res.cloudinary.com/dogxrczp3/image/upload/v1773350425/logo_2_qlc6y5.png" alt="Orange Mobile Logo" className="w-full h-full object-contain" />
                </div>
                <p className="text-xs font-bold text-white/80 tracking-widest uppercase">Verified Secure</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="w-full max-w-5xl mb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-white/[0.08] p-6 sm:p-8"
            style={{
              background: 'rgba(18, 24, 33, 0.5)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.2)',
            }}
          >
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.22em] mb-5">
              How your day flows
            </p>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 text-sm">
              <div className="space-y-3 text-slate-400 sm:max-w-sm">
                <p>1. Open Orange Mobile and glance at your dashboard: today&apos;s sales, repairs and credit.</p>
                <p>2. Tap <span className="text-white font-medium">New Sale</span>, <span className="text-white font-medium">Second‑Hand</span> or <span className="text-white font-medium">New Service</span> from the home tiles.</p>
                <p>3. Everything writes to Neon Postgres behind the scenes — ready for tax, audit and growth.</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-4 text-[13px] text-slate-400 flex-1 max-w-xs">
                <p className="font-semibold text-white mb-2">Designed for owners, not accountants.</p>
                <p className="leading-relaxed">
                  The app stays focused on what you do daily in the shop, while keeping the data structured and
                  clean for serious reporting.
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 px-5 sm:px-8 py-6 text-center border-t border-white/[0.06]">
        <p className="text-[11px] text-slate-500 tracking-widest uppercase">
          Orange Mobile Retail • Retail OS
        </p>
      </footer>
    </div>
  );
};

export default Landing;
