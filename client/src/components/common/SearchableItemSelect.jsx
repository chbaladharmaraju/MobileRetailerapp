import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiOutlineCube, HiOutlineCheckCircle, HiOutlinePlus, HiOutlineX } from 'react-icons/hi';

const SearchableItemSelect = ({ items, onSelect, value, placeholder = "Search or type item name..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedItem = items.find(i => i.id === value);

  useEffect(() => {
    if (selectedItem) {
      setSearchTerm(selectedItem.name);
    }
  }, [selectedItem, value]);

  const filtered = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (i.imei && i.imei.includes(searchTerm))
  );

  const handleSelect = (item) => {
    onSelect(item.id);
    setSearchTerm(item.name);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    onSelect({ name: searchTerm, isNew: true });
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect('');
    setSearchTerm('');
    setIsOpen(true);
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
            if (!val) onSelect('');
          }}
          onFocus={() => setIsOpen(true)}
          className={`ag-input ag-input-with-icon pr-10 ${isOpen ? 'border-ag-primary ring-1 ring-ag-primary/20 bg-white/[0.05]' : ''}`}
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
        {isOpen && (searchTerm.length > 0 || filtered.length > 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 4 }}
            className="absolute z-50 w-full mt-2 glass-card border border-white/10 shadow-2xl overflow-hidden max-h-64 overflow-y-auto"
          >
            {filtered.length > 0 ? (
              filtered.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between group ${value === item.id ? 'bg-ag-primary/10 transition-none' : 'hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${value === item.id ? 'bg-ag-primary text-black' : 'bg-white/5 text-ag-text-dim group-hover:bg-white/10 group-hover:text-white transition-colors'}`}>
                      <HiOutlineCube className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium transition-colors ${value === item.id ? 'text-ag-primary' : 'text-white'}`}>{item.name}</p>
                      <p className="text-[11px] text-ag-text-dim">
                        Stock: {item.stock} | ₹{parseFloat(item.sellingPrice || item.costPrice || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  {value === item.id && <HiOutlineCheckCircle className="w-4 h-4 text-ag-primary" />}
                </button>
              ))
            ) : null}

            {searchTerm.length > 0 && !filtered.find(i => i.name.toLowerCase() === searchTerm.toLowerCase()) && (
              <button
                type="button"
                onClick={handleCreateNew}
                className="w-full text-left px-4 py-4 bg-ag-primary/10 hover:bg-ag-primary/20 transition-colors flex items-center gap-3 border-t border-white/5"
              >
                <div className="w-8 h-8 rounded-full bg-ag-primary/20 flex items-center justify-center text-ag-primary">
                  <HiOutlinePlus className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-sm font-bold text-white">Add "{searchTerm}"</p>
                   <p className="text-xs text-ag-text-muted">Use as a new item for this transaction</p>
                </div>
              </button>
            )}
            
            {filtered.length === 0 && searchTerm.length === 0 && (
                <div className="px-4 py-3 text-sm text-ag-text-dim italic">Type to search or add new...</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchableItemSelect;
