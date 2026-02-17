import Select from 'react-select';
import { useTheme } from '../../hooks/useTheme'; // Ajuste o caminho conforme necessário

const SingleSelect = ({ label, options, value, onChange, ...props }) => {
  const { theme } = useTheme();

  const getSelectStyles = () => {
    if (theme === 'dark') {
      return {
        control: (base, state) => ({
          ...base,
          backgroundColor: '#111827',
          borderColor: state.isFocused ? '#6366f1' : '#374151',
          color: '#f3f4f6',
          height: '50px',
          boxShadow: state.isFocused
            ? '0 0 0 3px rgba(99, 102, 241, 0.2)'
            : 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#6366f1'
          }
        }),
        input: (base) => ({
          ...base,
          color: '#f3f4f6'
        }),
        placeholder: (base) => ({
          ...base,
          color: '#6b7280'
        }),
        singleValue: (base) => ({
          ...base,
          color: '#f3f4f6'
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: '#1f2937',
          color: '#f3f4f6',
          border: '1px solid #374151',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }),
        menuList: (base) => ({
          ...base,
          backgroundColor: '#1f2937',
          '::-webkit-scrollbar': {
            width: '6px'
          },
          '::-webkit-scrollbar-track': {
            background: '#111827'
          },
          '::-webkit-scrollbar-thumb': {
            background: '#374151',
            borderRadius: '3px'
          }
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? '#6366f1'
            : state.isFocused
            ? '#2a2a2a'
            : '#1f2937',
          color: state.isSelected ? '#ffffff' : '#f3f4f6',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#2a2a2a',
            color: '#f3f4f6'
          }
        }),
        indicatorSeparator: (base) => ({
          ...base,
          backgroundColor: '#374151'
        }),
        dropdownIndicator: (base, state) => ({
          ...base,
          color: state.isFocused ? '#6366f1' : '#9ca3af',
          transition: 'color 0.2s ease'
        }),
        clearIndicator: (base, state) => ({
          ...base,
          color: state.isFocused ? '#6366f1' : '#9ca3af',
          transition: 'color 0.2s ease'
        })
      };
    }

    // Light theme
    return {
      control: (base, state) => ({
        ...base,
        backgroundColor: 'white',
        borderColor: state.isFocused ? '#6366f1' : '#dee2e6',
        color: '#1f2937',
        boxShadow: state.isFocused
          ? '0 0 0 3px rgba(99, 102, 241, 0.1)'
          : 'none',
        height: '50px',

        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: '#6366f1'
        }
      }),
      input: (base) => ({
        ...base,
        color: '#1f2937'
      }),
      placeholder: (base) => ({
        ...base,
        color: '#9ca3af'
      }),
      singleValue: (base) => ({
        ...base,
        color: '#1f2937'
      }),
      menu: (base) => ({
        ...base,
        backgroundColor: 'white',
        color: '#1f2937',
        border: '1px solid #dee2e6',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }),
      menuList: (base) => ({
        ...base,
        backgroundColor: 'white'
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? '#6366f1'
          : state.isFocused
          ? '#f3f4f6'
          : 'white',
        color: state.isSelected ? '#ffffff' : '#1f2937',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: '#f3f4f6',
          color: '#1f2937'
        }
      }),
      indicatorSeparator: (base) => ({
        ...base,
        backgroundColor: '#dee2e6'
      }),
      dropdownIndicator: (base, state) => ({
        ...base,
        color: state.isFocused ? '#6366f1' : '#9ca3af',
        transition: 'color 0.2s ease'
      }),
      clearIndicator: (base, state) => ({
        ...base,
        color: state.isFocused ? '#6366f1' : '#9ca3af',
        transition: 'color 0.2s ease'
      })
    };
  };

  return (
    <div className="mb-3">
      {label && <label className="form-label">{label}</label>}
      <Select
        options={options}
        value={value}
        onChange={onChange}
        styles={getSelectStyles()}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: '#6366f1',
            primary75: '#8b5cf6',
            primary50: '#c4b5fd',
            primary25: '#f3f4f6'
          }
        })}
        {...props}
      />
    </div>
  );
};

export default SingleSelect;
