import { useState } from 'react';

const PropaneForm = ({ city, state, id }) => {
  const [usesPropane, setUsesPropane] = useState(null);

  return (
    <div className="p-4 border rounded shadow bg-orange-50">
      <h3 className="font-semibold text-lg mb-2">Propane Utility Form</h3>
      <p><strong>City:</strong> {city}</p>
      <p><strong>State:</strong> {state}</p>
      <p><strong>ID:</strong> {id}</p>

      <div className="mt-4">
        <p className="font-medium">Do you use any propane for space heating?</p>
        <div className="mt-2 space-x-4">
          <button
            onClick={() => setUsesPropane(true)}
            className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
          >
            Yes
          </button>
          <button
            onClick={() => setUsesPropane(false)}
            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            No
          </button>
        </div>
      </div>

      {usesPropane === true && (
        <div className="mt-4 p-3 bg-white border rounded">
          <h4 className="font-semibold">Option 13</h4>
          <p>This is the content for Option 13 (shown because the answer was "Yes").</p>
        </div>
      )}

      {usesPropane === false && (
        <div className="mt-4 p-3 bg-gray-100 border rounded">
          <p>Thank you! Since you don't use propane for space heating, there's nothing more needed.</p>
        </div>
      )}
    </div>
  );
};

export default PropaneForm;
