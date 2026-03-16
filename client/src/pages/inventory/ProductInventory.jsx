import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import SearchBar from '../../components/common/SearchBar';

const ProductInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultForm = { name: '', brand: '', model: '', costPrice: '', sellingPrice: '', stock: '', minStock: '5' };
  const [form, setForm] = useState(defaultForm);

  const fetchProducts = () => { api.get('/inventory/products').then(({ data }) => setProducts(data.products || [])).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchProducts(); }, []);

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.model?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/inventory/products/${editingId}`, form);
        toast.success('Product updated successfully');
      } else {
        await api.post('/inventory/products', form);
        toast.success('Product added successfully');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(defaultForm);
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save product'); }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      brand: product.brand,
      model: product.model,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      minStock: product.minStock || '5'
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/inventory/products/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete product'); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <p className="text-sm font-medium text-om-text-muted tracking-wide px-1">
          {products.length} products
        </p>
        <button className="ag-btn ag-btn-primary w-full sm:w-auto" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(defaultForm); }}>
          <HiOutlinePlus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <SearchBar 
        value={searchQuery} 
        onChange={setSearchQuery} 
        placeholder="Search products by name, brand or model..."
        className="mb-6"
      />

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.98 }} 
            animate={{ opacity: 1, height: 'auto', scale: 1 }} 
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-6 bg-om-surface border border-om-border backdrop-blur-md rounded-xl shadow-xl">
              <h3 className="text-sm font-semibold text-om-text mb-5 tracking-wide">{editingId ? 'Edit Product Details' : 'New Product Details'}</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-om-text-secondary uppercase tracking-wider ml-1">Name</label>
                  <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="e.g. Screen Protector" className="ag-input" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-om-text-secondary uppercase tracking-wider ml-1">Brand</label>
                  <input value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value})} placeholder="e.g. Spigen" className="ag-input" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-om-text-secondary uppercase tracking-wider ml-1">Model Compatibility</label>
                  <input value={form.model} onChange={(e) => setForm({...form, model: e.target.value})} placeholder="e.g. iPhone 15" className="ag-input" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-om-text-secondary uppercase tracking-wider ml-1">Unit Cost (₹)</label>
                  <input type="number" value={form.costPrice} onChange={(e) => setForm({...form, costPrice: e.target.value})} placeholder="0.00" className="ag-input" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-om-text-secondary uppercase tracking-wider ml-1">Selling Price (₹)</label>
                  <input type="number" value={form.sellingPrice} onChange={(e) => setForm({...form, sellingPrice: e.target.value})} placeholder="0.00" className="ag-input" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-om-text-secondary uppercase tracking-wider ml-1">Initial Stock</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} placeholder="0" className="ag-input" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-om-text-secondary uppercase tracking-wider ml-1">Min Stock Alert</label>
                  <input type="number" value={form.minStock} onChange={(e) => setForm({...form, minStock: e.target.value})} placeholder="5" className="ag-input" />
                </div>
                <div className="flex items-end pt-1">
                  <button type="submit" className="ag-btn ag-btn-primary w-full h-[42px]">{editingId ? 'Update Product' : 'Save Product'}</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card bg-om-card border border-om-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="ag-table w-full">
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Cost</th>
                <th>Sell Price</th>
                <th>Margin</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-12 text-om-text-secondary text-sm">Loading...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-12 text-om-text-secondary text-sm">No products found</td></tr>
              ) : filteredProducts.map((p, i) => {
                const margin = ((parseFloat(p.sellingPrice) - parseFloat(p.costPrice)) / parseFloat(p.costPrice) * 100).toFixed(1);
                const isLow = p.stock <= p.minStock;
                return (
                  <motion.tr key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <td className="font-semibold text-om-text tracking-tight">{p.name}</td>
                    <td className="text-om-text-muted">{p.brand}</td>
                    <td className="text-om-text-muted">₹{parseFloat(p.costPrice).toLocaleString('en-IN')}</td>
                    <td className="text-om-text font-medium">₹{parseFloat(p.sellingPrice).toLocaleString('en-IN')}</td>
                    <td className="text-om-text-muted font-mono text-xs">{margin}%</td>
                    <td className={`font-medium ${isLow ? 'text-om-text' : 'text-om-text-muted'}`}>{p.stock}</td>
                    <td>
                      {p.stock === 0 ? <span className="ag-badge ag-badge-danger">Out of Stock</span>
                        : isLow ? <span className="ag-badge bg-white/[0.1] text-om-text border-ag-border">Low Stock</span>
                        : <span className="ag-badge ag-badge-success">In Stock</span>}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(p)} className="p-1.5 text-om-text-muted hover:text-om-text bg-om-surface hover:bg-om-border rounded transition-colors" title="Edit">
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-om-text-muted hover:text-ag-red bg-om-surface hover:bg-om-border rounded transition-colors" title="Delete">
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductInventory;
