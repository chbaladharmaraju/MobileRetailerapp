import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineUser, HiOutlineCheckCircle, HiOutlineX } from 'react-icons/hi';

const SearchableCustomerSelect = ({ customers, onSelect, value, onNewCustomer, placeholder = "Search or type new customer..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const dropdownRef = useRef(null);

  const selectedCust = customers.find(c => c.id === value);

  useEffect(() => {
    if (selectedCust) {
      setSearchTerm(selectedCust.name);
    }
  }, [selectedCust, value]);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  );

  const handleSelect = (cust) => {
    onSelect(cust.id);
    onNewCustomer(null);
    setSearchTerm(cust.name);
    setIsOpen(false);
    setIsAddingNew(false);
  };

  const handleClear = () => {
    onSelect('');
    onNewCustomer(null);
    setSearchTerm('');
    setIsOpen(true);
    setIsAddingNew(false);
  };

  const startAddingNew = (e) => {
    if (e) e.stopPropagation();
    setNewName(searchTerm);
    setIsAddingNew(true);
    setIsOpen(false);
  };

  const handleAddNew = () => {
    if (!newName) return;
    onNewCustomer({ name: newName, phone: newPhone });
    setSearchTerm(newName);
    setIsAddingNew(false);
    onSelect('');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative group">
        <HiOutlineSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isOpen || searchTerm ? 'text-ag-primary' : 'text-ag-text-dim'}`} />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            const val = e.target.value;
            setSearchTerm(val);
            setIsOpen(true);
            if (!val) {
                onSelect('');
                onNewCustomer(null);
                setIsAddingNew(false);
            }
          }}
          onFocus={() => setIsOpen(true)}
          className={`ag-input ag-input-with-icon pr-10 transition-all ${isOpen ? 'border-ag-primary ring-2 ring-ag-primary/10 bg-white/[0.05]' : ''}`}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 text-ag-text-dim transition-colors"
          >
            <HiOutlineX className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (searchTerm.length > 0 || customers.length > 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 4 }}
            className="absolute z-50 w-full mt-2 glass-card border border-white/10 shadow-2xl overflow-hidden max-h-80 flex flex-col"
          >
            <div className="flex-1 overflow-y-auto">
                <button
                    type="button"
                    onClick={startAddingNew}
                    className="w-full text-left px-4 py-3 bg-ag-primary/10 hover:bg-ag-primary/20 transition-all flex items-center gap-3 border-b border-white/10 group mb-1"
                >
                    <div className="w-8 h-8 rounded-lg bg-ag-primary flex items-center justify-center text-black">
                        <HiOutlinePlus className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white uppercase tracking-tighter">Register New Customer</p>
                        <p className="text-[10px] text-ag-text-muted">Add a new person to the records</p>
                    </div>
                </button>

                {filtered.length > 0 ? (
                filtered.map(c => (
                    <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelect(c)}
                        className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between group ${value === c.id ? 'bg-ag-primary/10 transition-none' : 'hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${value === c.id ? 'bg-ag-primary text-black' : 'bg-white/5 text-ag-text-dim group-hover:bg-white/10 group-hover:text-white transition-colors'}`}>
                                <HiOutlineUser className="w-4 h-4" />
                            </div>
                            <div>
                                <p className={`text-sm font-medium transition-colors ${value === c.id ? 'text-ag-primary' : 'text-white'}`}>{c.name}</p>
                                <p className="text-[11px] text-ag-text-dim">{c.phone || 'No phone'}</p>
                            </div>
                        </div>
                        {value === c.id && <HiOutlineCheckCircle className="w-4 h-4 text-ag-primary" />}
                    </button>
                ))
                ) : searchTerm.length > 0 ? (
                    <div className="px-4 py-3 text-[11px] text-ag-text-dim italic">No matching customers. Use 'Register New' above.</div>
                ) : (
                    <div className="px-4 py-3 text-[11px] text-ag-text-dim italic">Type to search or use the button.</div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddingNew && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }}
            className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-ag-primary/20 space-y-4"
          >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-ag-primary font-bold text-xs uppercase tracking-widest">
                    <HiOutlinePlus className="w-4 h-4" /> New Customer Details
                </div>
                <button type="button" onClick={() => setIsAddingNew(false)} className="text-ag-text-dim hover:text-white transition-colors">
                    <HiOutlineX className="w-4 h-4" />
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-ag-text-muted mb-2 ml-1 font-bold">Full Name (*)</label>
                <input
                  type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="ag-input"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-ag-text-muted mb-2 ml-1 font-bold">Phone Number</label>
                <input
                  type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
                  className="ag-input"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs pt-1">
               <button type="button" onClick={() => setIsAddingNew(false)} className="px-4 py-2 text-ag-text-dim hover:text-white transition-colors font-medium">Discard</button>
               <button type="button" onClick={handleAddNew} className="px-5 py-2 bg-ag-primary text-black rounded-lg font-bold hover:bg-ag-primary/90 transition-all shadow-lg shadow-ag-primary/10">Register & Select</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchableCustomerSelect;
