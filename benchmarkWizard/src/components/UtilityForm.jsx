import { useState } from 'react';
import ElectricForm from '../components/ElectricForm';
import WaterForm from '../components/WaterForm';
import GasForm from '../components/GasForm';
import PropaneForm from '../components/PropaneForm';
import SolarForm from '../components/SolarForm';

const UtilityForm = ({
  city = 'Miami',
  state = 'Florida',
  id = '0000',
}) => {
  const [type, setType] = useState('');

  // Valid US city/state pairs
  const validCitiesStates = {
    'Los Angeles': 'California',
    'New York': 'New York',
    'Chicago': 'Illinois',
    'Houston': 'Texas',
    'Phoenix': 'Arizona',
    'DC': 'MD',
    'Miami': 'Florida',
  };


  const matchedState = validCitiesStates[city];
  const isValid = matchedState === state;

  const sharedProps = { city, state, id };

  const renderUtilityForm = () => {
    switch (type) {
      case 'electric':
        return <ElectricForm {...sharedProps} />;
      case 'water':
        return <WaterForm {...sharedProps} />;
      case 'gas':
        return <GasForm {...sharedProps} />;
      case 'propane':
        return <PropaneForm {...sharedProps} />;
      case 'solar':
        return <SolarForm {...sharedProps} />;
      default:
        return <p className="text-gray-500 mt-2">Please select a utility type.</p>;
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Utility Form</h2>

      {!isValid ? (
        <div className="text-red-600">
          Invalid city/state combination. Please use a valid U.S. city and its corresponding state.
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block font-medium">City:</label>
            <p>{city}</p>
          </div>

          <div className="mb-4">
            <label className="block font-medium">State:</label>
            <p>{state}</p>
          </div>

          <div className="mb-4">
            <label className="block font-medium">ID:</label>
            <p>{id}</p>
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Type:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="">Select a type</option>
              <option value="electric">Electric</option>
              <option value="water">Water</option>
              <option value="gas">Gas</option>
              <option value="propane">Propane</option>
              <option value="solar">Solar</option>
            </select>
          </div>

          {renderUtilityForm()}
        </>
      )}
    </div>
  );
};

export default UtilityForm;
