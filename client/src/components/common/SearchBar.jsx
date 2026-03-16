import { HiOutlineSearch, HiOutlineXCircle } from 'react-icons/hi';

const SearchBar = ({ value, onChange, placeholder = "Search...", className = "" }) => {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none" style={{ color: 'var(--om-text-muted)' }}>
        <HiOutlineSearch className="w-5 h-5 group-focus-within:text-om-accent transition-colors" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-3 rounded-2xl outline-none border transition-all duration-300 text-sm font-medium"
        style={{
          backgroundColor: 'var(--om-card)',
          borderColor: 'var(--om-border)',
          color: 'var(--om-text)',
          boxShadow: '0 4px 6px -1px var(--om-shadow)'
        }}
      />
      {value && (
        <button 
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 active:scale-95 transition-all"
          style={{ color: 'var(--om-text-muted)' }}
        >
          <HiOutlineXCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
