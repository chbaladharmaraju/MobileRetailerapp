import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlineCheckCircle, HiOutlineUserGroup, HiOutlineShieldExclamation } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import SearchBar from '../../components/common/SearchBar';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const DistributorsList = () => {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const navigate = useNavigate();

  // Create Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDistributor, setNewDistributor] = useState({ name: '', phone: '', email: '', address: '', type: 'BOTH' });

  useEffect(() => {
    fetchDistributors();
  }, [activeTab]);

  const fetchDistributors = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/suppliers?type=${activeTab}`);
      setDistributors(data);
    } catch (err) {
      toast.error('Failed to load distributors');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post('/suppliers', newDistributor);
      toast.success('Distributor added successfully');
      setIsAddModalOpen(false);
      setNewDistributor({ name: '', phone: '', email: '', address: '', type: 'BOTH' });
      fetchDistributors();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add distributor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDistributors = distributors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.phone.includes(searchTerm)
  );

  const totalDebt = distributors.reduce((sum, d) => sum + parseFloat(d.balanceOwed), 0);

  const typeLabels = {
    MOBILE_SUPPLIER: 'Mobile Phones',
    SPARE_PART_SUPPLIER: 'Spare Parts',
    BOTH: 'General / Both'
  };

  const typeColors = {
    MOBILE_SUPPLIER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    SPARE_PART_SUPPLIER: 'bg-green-500/10 text-green-400 border-green-500/20',
    BOTH: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="space-y-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-om-text tracking-tight">Suppliers & Distributors</h1>
          <p className="text-sm text-om-text-secondary mt-1">Manage your inventory suppliers and track outstanding debt.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('/inventory/receive')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-om-border text-om-text rounded-lg font-medium hover:bg-ag-bg-card transition-all text-sm border border-ag-border"
          >
            <HiOutlineCheckCircle className="w-5 h-5" /> Receive Stock
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-ag-primary text-black rounded-lg font-medium hover:bg-ag-primary/90 transition-all shadow-[0_0_20px_rgba(255,165,0,0.3)] text-sm whitespace-nowrap"
          >
            <HiOutlinePlus className="w-5 h-5" /> New Supplier
          </button>
        </div>
      </div>

      {/* Summary KPI */}
      <motion.div variants={itemVariants} className="glass-card bg-om-card border border-om-border p-6 flex items-center justify-between border-red-500/20 bg-gradient-to-r from-red-500/5 to-transparent">
        <div>
          <p className="text-xs font-semibold text-red-400 uppercase tracking-widest flex items-center gap-2">
            <HiOutlineShieldExclamation className="w-4 h-4" /> Total Outstanding Debt
          </p>
          <h2 className="text-3xl font-bold text-om-text mt-2">₹{totalDebt.toLocaleString('en-IN')}</h2>
        </div>
      </motion.div>

      {/* Tabs & Search */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex p-1 bg-om-surface rounded-xl border border-om-border w-full sm:w-auto">
          {['ALL', 'MOBILE_SUPPLIER', 'SPARE_PART_SUPPLIER', 'BOTH'].map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeTab === type 
                  ? 'bg-om-border text-om-text shadow-lg' 
                  : 'text-om-text-secondary hover:text-om-text'
              }`}
            >
              {type === 'ALL' ? 'All' : type.split('_')[0]}
            </button>
          ))}
        </div>
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Search suppliers by name or phone..."
          className="flex-1"
        />
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants} className="glass-card bg-om-card border border-om-border overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-ag-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredDistributors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-om-text-secondary">
              <HiOutlineUserGroup className="w-12 h-12 mb-4 opacity-20 text-om-text" />
              <p>No suppliers found matching your filter.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-om-border bg-om-surface">
                  <th className="py-4 px-6 text-xs font-semibold text-om-text-muted uppercase tracking-wider">Supplier Profile</th>
                  <th className="py-4 px-6 text-xs font-semibold text-om-text-muted uppercase tracking-wider hidden sm:table-cell">Type</th>
                  <th className="py-4 px-6 text-xs font-semibold text-om-text-muted uppercase tracking-wider text-right">Outstanding</th>
                  <th className="py-4 px-6 text-xs font-semibold text-om-text-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDistributors.map((dist) => (
                  <tr key={dist.id} className="hover:bg-om-surface transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-om-surface flex items-center justify-center text-om-text">
                          <HiOutlineUserGroup className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-om-text group-hover:text-ag-primary transition-colors">{dist.name}</p>
                          <p className="text-xs text-om-text-secondary">{dist.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeColors[dist.type]}`}>
                        {typeLabels[dist.type]}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {parseFloat(dist.balanceOwed) > 0 ? (
                        <span className="text-sm font-semibold text-red-400">
                          ₹{parseFloat(dist.balanceOwed).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          SETTLED
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => navigate(`/suppliers/${dist.id}/ledger`)}
                        className="text-[10px] font-bold text-ag-primary hover:text-om-text transition-colors bg-ag-primary/10 hover:bg-ag-primary/20 px-3 py-1.5 rounded-lg border border-ag-primary/20 uppercase"
                      >
                        View Ledger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Add Distributor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card bg-om-card border border-om-border w-full max-w-md p-6 border border-om-border shadow-2xl relative"
          >
            <h2 className="text-xl font-bold text-om-text mb-6">Add New Supplier</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-om-text-muted mb-1 ml-1 uppercase tracking-wider">Distributor/Company Name</label>
                <input
                  type="text" required
                  value={newDistributor.name}
                  onChange={(e) => setNewDistributor({...newDistributor, name: e.target.value})}
                  className="ag-input"
                  placeholder="e.g. Samsung Distributors Ltd"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-om-text-muted mb-1 ml-1 uppercase tracking-wider">Phone</label>
                  <input
                    type="tel" required
                    value={newDistributor.phone}
                    onChange={(e) => setNewDistributor({...newDistributor, phone: e.target.value})}
                    className="ag-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-om-text-muted mb-1 ml-1 uppercase tracking-wider">Type</label>
                  <select
                    value={newDistributor.type}
                    onChange={(e) => setNewDistributor({...newDistributor, type: e.target.value})}
                    className="ag-input appearance-none bg-om-surface"
                  >
                    <option value="MOBILE_SUPPLIER">Mobile Phones</option>
                    <option value="SPARE_PART_SUPPLIER">Spare Parts</option>
                    <option value="BOTH">General / Both</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-om-text-muted mb-1 ml-1 uppercase tracking-wider">Email (Optional)</label>
                <input
                  type="email"
                  value={newDistributor.email}
                  onChange={(e) => setNewDistributor({...newDistributor, email: e.target.value})}
                  className="ag-input"
                />
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-om-text hover:bg-om-border rounded-lg transition-colors border border-om-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ag-btn ag-btn-primary px-6 h-10"
                >
                  {isSubmitting ? 'Adding...' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};

export default DistributorsList;
