import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineUserGroup, HiOutlineCheckCircle, HiOutlineX } from 'react-icons/hi';

const SearchableDistributorSelect = ({ distributors, onSelect, value, onNewDistributor, placeholder = "Search or type new supplier name..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedDist = distributors.find(d => d.id === value);

  useEffect(() => {
    if (selectedDist) {
      setSearchTerm(selectedDist.name);
    }
  }, [selectedDist, value]);

  const filtered = distributors.filter(d => 
    (d.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (d.phone && d.phone.includes(searchTerm))
  );

  const handleSelect = (dist) => {
    onSelect(dist.id);
    onNewDistributor(null);
    setSearchTerm(dist.name);
    setIsOpen(false);
    setIsAddingNew(false);
  };

  const handleClear = () => {
    onSelect('');
    onNewDistributor(null);
    setSearchTerm('');
    setIsOpen(true);
  };

  const handleAddNew = (e) => {
    if (e) e.preventDefault();
    if (!searchTerm) return;
    
    // Auto-generate phone to satisfy backend uniqueness constraint if user does not provide one
    onNewDistributor({ name: searchTerm, phone: `Not Provided (${searchTerm.substring(0,4)}-${Math.floor(Math.random() * 10000)})` });
    setSearchTerm(searchTerm);
    setIsOpen(false);
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
                onNewDistributor(null);
            }
          }}
          onFocus={() => setIsOpen(true)}
          className={`ag-input ag-input-with-icon pr-10 transition-all ${isOpen ? 'border-ag-primary ring-2 ring-ag-primary/10 bg-ag-bg-input' : ''}`}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-ag-bg-card text-ag-text-dim transition-colors"
          >
            <HiOutlineX className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 4 }}
            className="absolute z-50 w-full mt-2 glass-card border border-ag-border shadow-2xl overflow-hidden max-h-80 flex flex-col"
          >
            <div className="flex-1 overflow-y-auto">
                {filtered.length > 0 ? (
                  filtered.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); handleSelect(d); }}
                      className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between group ${value === d.id ? 'bg-ag-primary/10 transition-none' : 'hover:bg-ag-bg-card'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${value === d.id ? 'bg-ag-primary text-black' : 'bg-ag-bg-card text-ag-text-dim group-hover:bg-ag-bg-card group-hover:text-ag-text transition-colors'}`}>
                          {d.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-sm font-medium transition-colors ${value === d.id ? 'text-ag-primary' : 'text-ag-text'}`}>{d.name}</p>
                          <p className="text-[11px] text-ag-text-dim">{d.phone}</p>
                        </div>
                      </div>
                      {value === d.id && <HiOutlineCheckCircle className="w-4 h-4 text-ag-primary" />}
                    </button>
                  ))
                ) : searchTerm.length > 0 ? (
                    <div className="px-4 py-3 text-[12px] text-ag-text-dim italic text-center border-b border-ag-border">
                      No existing suppliers match "{searchTerm}".
                    </div>
                ) : null}

                {/* THE ADD NEW BUTTON (Always at bottom, or prominent when no matches) */}
                {(!filtered.find(d => d.name.toLowerCase() === searchTerm.toLowerCase()) && searchTerm.length > 0) || filtered.length > 0 ? (
                  <button
                      type="button"
                      onMouseDown={handleAddNew}
                      className="w-full text-left px-4 py-3 bg-ag-primary/10 hover:bg-ag-primary/20 transition-all flex items-center gap-3 border-t border-ag-border group mt-auto"
                  >
                      <div className="w-8 h-8 rounded-full bg-ag-primary/20 flex items-center justify-center text-ag-primary group-hover:bg-ag-primary group-hover:text-ag-text transition-colors">
                          <HiOutlinePlus className="w-5 h-5" />
                      </div>
                      <div>
                          <p className="text-sm font-bold text-ag-text-base tracking-tight">
                            {searchTerm ? `Register "${searchTerm}" as New` : 'Add New Supplier'}
                          </p>
                          <p className="text-[10px] text-ag-text-muted">Create a new vendor profile</p>
                      </div>
                  </button>
                ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchableDistributorSelect;
