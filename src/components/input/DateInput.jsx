import { Input as ReactstrapInput } from 'reactstrap';

const DateInput = ({ label, value, onChange, ...props }) => {
  return (
    <div className="mb-3">
      {label && <label className="form-label">{label}</label>}
      <ReactstrapInput
        type="date"
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
};

export default DateInput;