import { useState } from 'react';

const ElectricForm = ({ city, state, id }) => {
  const [meterType, setMeterType] = useState('');
  const [unitCount, setUnitCount] = useState('');
  const [options, setOptions] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [usageCost, setUsageCost] = useState('');
  const [estimation, setEstimation] = useState('');
  const [demand, setDemand] = useState('');
  const [demandCost, setDemandCost] = useState('');

  const cityLower = city.toLowerCase();
  const stateLower = state.toLowerCase();

  const handleUnitChange = (e) => {
    const value = e.target.value;
    setUnitCount(value);
    const units = Number(value);

    if (meterType === 'master') {
      if (
        (stateLower === 'dc' || cityLower === 'md' || cityLower === 'dc' || stateLower === 'md') &&
        units >= 1 &&
        units <= 3
      ) {
        setOptions(['Option 1', 'Option 2', 'Option 3']);
      } else if (cityLower === 'miami' && units >= 1 && units <= 3) {
        setOptions(['Option 1', 'Option 2', 'Option 4']);
      } else if (units > 3 && (cityLower === 'dc' || stateLower === 'md')) {
        setOptions(['Option 3']);
      } else if (units > 3 && cityLower === 'miami') {
        setOptions(['Option 4']);
      } else {
        setOptions(['Generic configuration applies.']);
      }
    } else {
      setOptions([]);
    }
  };

  const handleMeterTypeChange = (type) => {
    setMeterType(type);
    setUnitCount('');
    if (type === 'individual') {
      if (cityLower === 'dc' || stateLower === 'md') {
        setOptions(['Option 3']);
      } else if (cityLower === 'miami') {
        setOptions(['Option 4']);
      } else {
        setOptions(['Generic configuration applies.']);
      }
    } else {
      setOptions([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      city,
      state,
      id,
      meterType,
      unitCount: meterType === 'master' ? unitCount : 'N/A',
      additionalOptions: options,
      startDate,
      endDate,
      usageCost,
      estimation: estimation || 'N/A',
      demand,
      demandCost: demandCost || 'N/A',
    };
    console.log('Electric Form Data:', formData);
    // Submit logic here
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border rounded shadow bg-blue-50 space-y-4"
    >
      <h3 className="font-semibold text-lg">Electric Utility Form</h3>

      <div>
        <label className="block font-medium">City:</label>
        <p>{city}</p>
      </div>

      <div>
        <label className="block font-medium">State:</label>
        <p>{state}</p>
      </div>

      <div>
        <label className="block font-medium">ID:</label>
        <p>{id}</p>
      </div>

      <div>
        <label className="block font-medium mb-1">Meter Type:</label>
        <div className="space-y-1">
          <label className="flex items-center">
            <input
              type="radio"
              name="meterType"
              value="individual"
              checked={meterType === 'individual'}
              onChange={() => handleMeterTypeChange('individual')}
              className="mr-2"
            />
            Individually Metered
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="meterType"
              value="master"
              checked={meterType === 'master'}
              onChange={() => handleMeterTypeChange('master')}
              className="mr-2"
            />
            Master Metered
          </label>
        </div>
      </div>

      {meterType === 'master' && (
        <div>
          <label className="block font-medium mb-1">Number of Units:</label>
          <input
            type="number"
            value={unitCount}
            onChange={handleUnitChange}
            className="border p-2 rounded w-full"
            min="1"
          />
        </div>
      )}

      {options.length > 0 && (
        <div>
          <label className="block font-medium mb-1">Available Options:</label>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {options.map((opt, idx) => (
              <li key={idx}>{opt}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Additional Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Usage Cost:</label>
          <input
            type="number"
            value={usageCost}
            onChange={(e) => setUsageCost(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Estimation (optional):</label>
          <input
            type="text"
            value={estimation}
            onChange={(e) => setEstimation(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Demand:</label>
          <input
            type="number"
            value={demand}
            onChange={(e) => setDemand(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Demand Cost (optional):</label>
          <input
            type="number"
            value={demandCost}
            onChange={(e) => setDemandCost(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  );
};

export default ElectricForm;
