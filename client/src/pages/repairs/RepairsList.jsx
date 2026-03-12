import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlineEye, HiOutlineDocumentText } from 'react-icons/hi';
import api from '../../services/api';

const RepairsList = () => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const url = statusFilter ? `/repairs?status=${statusFilter}` : '/repairs';
    api.get(url).then(({ data }) => setRepairs(data.repairs || [])).catch(console.error).finally(() => setLoading(false));
  }, [statusFilter]);

  const statusColors = {
    INTAKE: 'ag-badge-info', DIAGNOSING: 'ag-badge-warning', IN_PROGRESS: 'ag-badge-warning',
    WAITING_PARTS: 'ag-badge-danger', COMPLETED: 'ag-badge-success', DELIVERED: 'ag-badge-success',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-1 p-1 bg-black/40 border border-white/5 rounded-lg w-fit backdrop-blur-md">
          {['', 'INTAKE', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                statusFilter === s 
                ? 'bg-white text-black shadow-sm' 
                : 'text-ag-text-muted hover:text-white hover:bg-white/5'
              }`}>
              {s === '' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <Link to="/repairs/new" className="w-full sm:w-auto">
          <button className="ag-btn ag-btn-primary w-full">
            <HiOutlinePlus className="w-4 h-4" /> New Repair
          </button>
        </Link>
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="ag-table w-full">
            <thead>
              <tr>
                <th>Device</th>
                <th>Customer</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12 text-ag-text-dim text-sm">Loading...</td></tr>
              ) : repairs.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-ag-text-dim text-sm">No repairs found</td></tr>
              ) : repairs.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <td className="font-semibold text-white tracking-tight">{r.deviceBrand} {r.deviceModel}</td>
                  <td className="text-ag-text font-medium">{r.customer?.name}</td>
                  <td className="text-ag-text-muted max-w-[200px] truncate text-sm">{r.issueDescription}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`ag-badge ${statusColors[r.status]}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                      {r.invoice && <HiOutlineDocumentText className="w-4 h-4 text-ag-primary" title="Invoice Generated" />}
                    </div>
                  </td>
                  <td className="text-ag-text-muted text-sm tracking-wide">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="text-right">
                    <Link to={`/repairs/${r.id}`} className="inline-flex p-2 rounded-lg hover:bg-white/[0.05] text-ag-text-muted hover:text-white transition-colors">
                      <HiOutlineEye className="w-4 h-4" />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default RepairsList;
