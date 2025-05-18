import { useState } from 'react';

const GasForm = ({ city, state, id }) => {
  const [meterType, setMeterType] = useState('');
  const [accountCount, setAccountCount] = useState('');
  const [options, setOptions] = useState([]);

  const handleMeterChange = (e) => {
    const type = e.target.value;
    setMeterType(type);
    setAccountCount('');
    setOptions([]);

    const upperCity = city.toUpperCase();
    const upperState = state.toUpperCase();

    // New condition for Individual meter
    if (type === 'Individual' && (upperCity === 'DC' || upperState === 'MD')) {
      setOptions([5, 6]);
    }
  };

  const handleAccountChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 5) return;

    setAccountCount(value);
    const upperCity = city.toUpperCase();
    const upperState = state.toUpperCase();

    if (meterType === 'Master') {
      if ((value === 1 || value === 2) && (upperCity === 'DC' || upperState === 'MD')) {
        setOptions([1, 5, 6]);
      } else if ((value === 1 || value === 2) && upperCity === 'MIAMI' && upperState !== 'MD') {
        setOptions([1, 2]);
      } else if (upperCity === 'MIAMI' && value >= 3) {
        setOptions([2]);
      } else {
        setOptions([]);
      }
    }
  };

  return (
    <div className="p-4 border rounded shadow bg-yellow-50 space-y-4">
      <h3 className="font-semibold text-lg">Gas Utility Form</h3>
      <p><strong>City:</strong> {city}</p>
      <p><strong>State:</strong> {state}</p>
      <p><strong>ID:</strong> {id}</p>

      <div>
        <label className="block font-medium">Meter Type:</label>
        <select
          value={meterType}
          onChange={handleMeterChange}
          className="border rounded px-2 py-1"
        >
          <option value="">Select</option>
          <option value="Individual">Individual</option>
          <option value="Master">Master</option>
        </select>
      </div>

      {meterType === 'Master' && (
        <div>
          <label className="block font-medium">Number of Accounts (Max 5):</label>
          <input
            type="number"
            value={accountCount}
            onChange={handleAccountChange}
            max={5}
            className="border rounded px-2 py-1"
          />
        </div>
      )}

      {options.length > 0 && (
        <div>
          <label className="block font-medium">Available Options:</label>
          <ul className="list-disc ml-5 text-blue-700">
            {options.map((opt) => (
              <li key={opt}>Option {opt}</li>
            ))}
          </ul>
        </div>
      )}

      {options.length === 0 && ((meterType === 'Master' && accountCount) || meterType === 'Individual') && (
        <p className="text-sm text-red-600 italic">
          Please contact support for assistance.
        </p>
      )}
    </div>
  );
};

export default GasForm;
