import { InputHTMLAttributes } from 'react';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  className?: string;
}

function SearchInput({ 
  icon = '🔍', 
  className = '', 
  placeholder = 'Поиск...', 
  ...props 
}: SearchInputProps): JSX.Element {
  const containerClasses = ['search-input', className].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <input 
        type="text" 
        className="form__input search-input__field" 
        placeholder={placeholder}
        {...props}
      />
      <span className="search-input__icon">{icon}</span>
    </div>
  );
}

export default SearchInput;