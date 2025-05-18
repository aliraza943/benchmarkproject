import { useState } from "react";

const WaterForm = ({ city, state, id }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [meterType, setMeterType] = useState("");
  const [masterMeterCount, setMasterMeterCount] = useState("");

  const cityLower = city?.toLowerCase();
  const stateLower = state?.toLowerCase();

  const isMiami = cityLower === "miami";
  const isDC = cityLower === "dc";
  const isMD = stateLower === "md";

  const showNote = isMiami;
  const showOptionsDirectly = isDC || isMD;
  const genericLocation = !isMiami && !isDC && !isMD;

  return (
    <div className="p-4 border rounded shadow bg-cyan-50 space-y-4">
      <h3 className="font-semibold text-lg">Water Utility Form</h3>
      <p><strong>City:</strong> {city}</p>
      <p><strong>State:</strong> {state}</p>
      <p><strong>ID:</strong> {id}</p>

      {/* Miami Note */}
      {showNote && !showOptions && (
        <div className="p-2 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded space-y-2">
          <p>
            <strong>Note:</strong> Water data is not required for this location. Would you still like to add the data?
          </p>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded"
            onClick={() => setShowOptions(true)}
          >
            Yes, Add Water Data
          </button>
        </div>
      )}

      {(showOptions || showOptionsDirectly) && (
        <>
          <div>
            <label className="block font-medium mb-1">Select Meter Type</label>
            <div className="space-x-4">
              <label>
                <input
                  type="radio"
                  value="individual"
                  checked={meterType === "individual"}
                  onChange={() => setMeterType("individual")}
                />{" "}
                Individually Metered
              </label>
              <label>
                <input
                  type="radio"
                  value="master"
                  checked={meterType === "master"}
                  onChange={() => setMeterType("master")}
                />{" "}
                Master Metered
              </label>
            </div>
          </div>

          {/* Master Meter Input */}
          {meterType === "master" && (
            <div>
              <label className="block font-medium">Number of Master Meters (less than 5)</label>
              <input
                type="number"
                min="1"
                max="4"
                value={masterMeterCount}
                onChange={(e) => setMasterMeterCount(e.target.value)}
                className="border px-2 py-1 rounded w-full"
              />
            </div>
          )}

          {/* Conditional Plain Text Options */}
          {meterType === "individual" && (
            <div>
              <p className="font-semibold mt-4">Applicable States:</p>
              <ul className="list-disc list-inside text-gray-700">
                <li>Option 9</li>
                <li>Option 10</li>
              </ul>
            </div>
          )}

          {meterType === "master" && (
            <div>
              <p className="font-semibold mt-4">Applicable States:</p>
              <ul className="list-disc list-inside text-gray-700">
                <li>Option 1</li>
                <li>Option 2</li>
                <li>Option 8</li>
                <li>Option 9</li>
              </ul>
            </div>
          )}
        </>
      )}

      {/* Generic Location */}
      {genericLocation && (
        <div className="p-2 bg-gray-100 text-gray-700 border border-gray-300 rounded">
          <p>No water data required for this location.</p>
        </div>
      )}
    </div>
  );
};

export default WaterForm;
