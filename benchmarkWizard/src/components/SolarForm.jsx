import { useState } from 'react';

const SolarForm = ({ city, state, id }) => {
  const [solarOption, setSolarOption] = useState(null);
  const [ownsRECs, setOwnsRECs] = useState(false);
  const [sellsRECs, setSellsRECs] = useState(false);

  const showOptions = (solarOption === 'own' && (ownsRECs || sellsRECs)) || solarOption === 'ppa';

  return (
    <div className="p-4 border rounded shadow bg-green-50">
      <h3 className="font-semibold text-lg mb-2">Solar Utility Form</h3>
      <p><strong>City:</strong> {city}</p>
      <p><strong>State:</strong> {state}</p>
      <p><strong>ID:</strong> {id}</p>

      <div className="mt-4">
        <p className="font-medium mb-2">What is your solar situation?</p>
        <div className="space-y-2">
          <button
            onClick={() => {
              setSolarOption('own');
              setOwnsRECs(false);
              setSellsRECs(false);
            }}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 block"
          >
            Owns the solar
          </button>
          <button
            onClick={() => {
              setSolarOption('ppa');
              setOwnsRECs(false);
              setSellsRECs(false);
            }}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 block"
          >
            Solar PPA only
          </button>
          <button
            onClick={() => {
              setSolarOption('lease');
              setOwnsRECs(false);
              setSellsRECs(false);
            }}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 block"
          >
            Only lease my roof
          </button>
        </div>
      </div>

      {solarOption === 'own' && (
        <div className="mt-4 p-3 border rounded bg-white">
          <p className="font-medium mb-2">Select applicable RECs options:</p>
          <label className="block">
            <input
              type="checkbox"
              checked={ownsRECs}
              onChange={() => setOwnsRECs(!ownsRECs)}
              className="mr-2"
            />
            Owns the RECs
          </label>
          <label className="block mt-1">
            <input
              type="checkbox"
              checked={sellsRECs}
              onChange={() => setSellsRECs(!sellsRECs)}
              className="mr-2"
            />
            I sell my RECs
          </label>
        </div>
      )}

      {showOptions && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <h4 className="font-semibold mb-2">Options 11, 12, 13</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Option 11 details here</li>
            <li>Option 12 details here</li>
            <li>Option 13 details here</li>
          </ul>
        </div>
      )}

      {solarOption === 'lease' && (
        <div className="mt-4 p-3 bg-gray-100 border rounded">
          <p>Thank you! Since you only lease your roof, no further steps are needed.</p>
        </div>
      )}
    </div>
  );
};

export default SolarForm;
