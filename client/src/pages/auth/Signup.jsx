import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/app');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        {/* Full Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label className="text-[10px] font-bold uppercase ml-1 block"
            style={{ color: 'var(--om-text-muted)', letterSpacing: '0.12em', margin: 0 }}>Full Name</label>
          <div className="relative group">
            <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 group-focus-within:text-[var(--om-orange)]" style={{ color: 'var(--om-text-muted)' }} />
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="John Doe" 
              className="ag-input ag-input-with-icon w-full pl-11 h-12" 
              style={{
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                backgroundColor: 'var(--om-input-bg)',
                borderColor: 'var(--om-input-border)',
                borderRadius: '12px'
              }}
              required 
            />
          </div>
        </div>

        {/* Email Address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label className="text-[10px] font-bold uppercase ml-1 block"
            style={{ color: 'var(--om-text-muted)', letterSpacing: '0.12em', margin: 0 }}>Email Address</label>
          <div className="relative group">
            <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 group-focus-within:text-[var(--om-orange)]" style={{ color: 'var(--om-text-muted)' }} />
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="you@example.com" 
              className="ag-input ag-input-with-icon w-full pl-11 h-12" 
              style={{
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                backgroundColor: 'var(--om-input-bg)',
                borderColor: 'var(--om-input-border)',
                borderRadius: '12px'
              }}
              required 
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label className="text-[10px] font-bold uppercase ml-1 block"
            style={{ color: 'var(--om-text-muted)', letterSpacing: '0.12em', margin: 0 }}>Password</label>
          <div className="relative group">
            <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 group-focus-within:text-[var(--om-orange)]" style={{ color: 'var(--om-text-muted)' }} />
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Min 6 characters" 
              className="ag-input ag-input-with-icon w-full pl-11 pr-12 h-12" 
              style={{
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                backgroundColor: 'var(--om-input-bg)',
                borderColor: 'var(--om-input-border)',
                borderRadius: '12px'
              }}
              required 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-300 hover:text-[var(--om-orange)]" style={{ color: 'var(--om-text-muted)' }}>
              {showPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ paddingTop: '4px' }}>
          <motion.button 
            whileHover={{ scale: 1.01, translateY: -1 }} 
            whileTap={{ scale: 0.99 }} 
            type="submit" 
            disabled={loading} 
            className="ag-btn w-full py-3 h-12 text-sm font-semibold rounded-xl text-white shadow-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--om-orange), #ea580c)',
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)'
            }}
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
          </motion.button>
        </div>
      </form>

      {/* Footer Link */}
      <div className="text-center" style={{ borderTop: '1px solid var(--om-border)', paddingTop: '16px' }}>
        <p className="text-xs font-semibold" style={{ color: 'var(--om-text-secondary)', margin: 0 }}>
          Already have an account?{' '}
          <Link to="/login" className="font-bold transition-colors duration-300 hover:text-[var(--om-orange)]" style={{ color: 'var(--om-accent)' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
