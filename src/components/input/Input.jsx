import { Input as ReactstrapInput } from 'reactstrap';

const Input = ({ label, type = 'text', value, onChange, ...props }) => {
  return (
    <div className="mb-3">
      {label && <label className="form-label">{label}</label>}
      <ReactstrapInput
        type={type}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
};

export default Input;