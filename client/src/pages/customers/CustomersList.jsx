import SearchBar from '../../components/common/SearchBar';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/customers?search=${searchTerm}`);
      setCustomers(data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount).toLocaleString('en-IN')}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-om-text tracking-tight">Customer Database</h2>
          <p className="text-xs text-om-text-muted mt-1">View all customers and their purchase history across all modules.</p>
        </div>
      </div>

      <SearchBar 
        value={searchTerm} 
        onChange={setSearchTerm} 
        placeholder="Search by name or phone..."
      />

      <div className="glass-card bg-om-card border border-om-border overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="ag-table w-full">
            <thead>
              <tr>
                <th>Customer Profile</th>
                <th className="text-center">History</th>
                <th className="text-right">Credit Balance</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && customers.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-20 text-om-text-secondary text-sm">
                  <div className="w-6 h-6 border-2 border-ag-border border-t-white rounded-full animate-spin mx-auto mb-3" />
                  Loading customers...
                </td></tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-20">
                    <HiOutlineUserGroup className="w-12 h-12 text-om-text/10 mx-auto mb-4" />
                    <p className="text-om-text-secondary text-sm">No customers found.</p>
                  </td>
                </tr>
              ) : customers.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-bold text-om-text tracking-tight">{c.name}</span>
                      <span className="text-xs text-om-text-muted mt-0.5">{c.phone}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-2">
                       {c._count?.sales > 0 && <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/10">{c._count.sales} Sales</span>}
                       {c._count?.repairs > 0 && <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/10">{c._count.repairs} Repairs</span>}
                       {c._count?.secondHandIntakes > 0 && <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-bold border border-yellow-500/10">{c._count.secondHandIntakes} Used</span>}
                       {(!c._count || (c._count.sales === 0 && c._count.repairs === 0 && c._count.secondHandIntakes === 0)) && <span className="text-[10px] text-om-text-secondary">No history</span>}
                    </div>
                  </td>
                  <td className="text-right">
                    {parseFloat(c.creditBalance) > 0 ? (
                      <span className="text-red-400 font-bold tracking-wide bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 text-xs">
                        {formatCurrency(c.creditBalance)}
                      </span>
                    ) : (
                      <span className="text-om-text-secondary text-xs">Clear</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/customers/${c.id}/ledger`} className="ag-btn bg-om-surface hover:bg-om-border text-om-text text-[10px] py-1.5 px-3 h-auto">
                        Ledger
                      </Link>
                    </div>
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

export default CustomersList;
