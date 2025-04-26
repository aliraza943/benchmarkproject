import React, { useState, useEffect } from 'react';
import PrimaryFunctionDropdown from '../components/OtherForm';
import PropertyUse from '../components/newForm';

const PropertyXMLForm = () => {
  const [formData, setFormData] = useState({
    name: 'This is dummy',
    primaryFunction: '',
    address1: 'idk what this address is',
    city: 'Edmonton',
    state: 'AB',
    postalCode: 'T5g 27S',
    country: 'CA',
    yearBuilt: '2009',
    constructionStatus: 'Test',
    grossFloorArea: '500',
    occupancyPercentage: '80',
    isFederalProperty: false,
  });

  const [propertyId, setPropertyId] = useState(null);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // New state

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      const expires_in = params.get('expires_in');
      const token_type = params.get('token_type');

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('expires_in', expires_in);
      localStorage.setItem('token_type', token_type);

      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitDisabled(true);

    const xmlData = `
      <property>
        <name>${formData.name}</name>
        <primaryFunction>${formData.primaryFunction}</primaryFunction>
        <address address1="${formData.address1}" city="${formData.city}" state="${formData.state}" postalCode="${formData.postalCode}" country="${formData.country}" />
        <yearBuilt>${formData.yearBuilt}</yearBuilt>
        <constructionStatus>${formData.constructionStatus}</constructionStatus>
        <grossFloorArea temporary="false" units="Square Feet">
          <value>${formData.grossFloorArea}</value>
        </grossFloorArea>
        <occupancyPercentage>${formData.occupancyPercentage}</occupancyPercentage>
        <isFederalProperty>${formData.isFederalProperty}</isFederalProperty>
      </property>
    `.trim();

    try {
      const response = await fetch('http://127.0.0.1:5000/submit-xml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
        },
        body: xmlData,
      });

      const result = await response.json();
      const propertyId = result.id;

      console.log('✅ Property ID:', propertyId);
      console.log('🌐 Location Header:', result.location);
      console.log('📝 Full Response:', result);

      setPropertyId(propertyId);
      setIsSubmitted(true); // Mark as submitted
      alert(`Property submitted successfully! ID: ${propertyId}`);
    } catch (err) {
      console.error('❌ Error submitting XML:', err);
      alert('Error submitting XML');
      setSubmitDisabled(false); // Re-enable button on failure
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">Property Information</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block font-medium text-gray-700">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Primary Function */}
        <div>
          <label htmlFor="primaryFunction" className="block font-medium text-gray-700">Primary Function:</label>
          <PrimaryFunctionDropdown
            value={formData.primaryFunction}
            onChange={handleChange}
            name="primaryFunction"
          />
        </div>

        {/* Address */}
        <fieldset className="border border-gray-300 rounded-md p-4">
          <legend className="text-lg font-semibold text-gray-700">Address</legend>
          <div className="mt-3">
            <label htmlFor="address1" className="block text-gray-700">Address 1:</label>
            <input
              type="text"
              id="address1"
              name="address1"
              value={formData.address1}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-gray-700">City:</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-gray-700">State:</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="postalCode" className="block text-gray-700">Postal Code:</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-gray-700">Country:</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </fieldset>

        {/* Year Built */}
        <div>
          <label htmlFor="yearBuilt" className="block font-medium text-gray-700">Year Built:</label>
          <input
            type="number"
            id="yearBuilt"
            name="yearBuilt"
            value={formData.yearBuilt}
            onChange={handleChange}
            required
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Construction Status */}
        <div>
          <label htmlFor="constructionStatus" className="block font-medium text-gray-700">Construction Status:</label>
          <select
            id="constructionStatus"
            name="constructionStatus"
            value={formData.constructionStatus}
            onChange={handleChange}
            required
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            <option value="Existing">Existing</option>
            <option value="Project">Project</option>
            <option value="Test">Test</option>
          </select>
        </div>

        {/* Gross Floor Area */}
        <div>
          <label htmlFor="grossFloorArea" className="block font-medium text-gray-700">Gross Floor Area (value):</label>
          <input
            type="number"
            id="grossFloorArea"
            name="grossFloorArea"
            value={formData.grossFloorArea}
            onChange={handleChange}
            required
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500">Units: Square Feet, Temporary: false</p>
        </div>

        {/* Occupancy Percentage */}
        <div>
          <label htmlFor="occupancyPercentage" className="block font-medium text-gray-700">Occupancy Percentage:</label>
          <input
            type="number"
            id="occupancyPercentage"
            name="occupancyPercentage"
            value={formData.occupancyPercentage}
            onChange={handleChange}
            required
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Is Federal Property */}
        <div className="flex items-center">
          <label htmlFor="isFederalProperty" className="block font-medium text-gray-700 mr-2">Is Federal Property:</label>
          <input
            type="checkbox"
            id="isFederalProperty"
            name="isFederalProperty"
            checked={formData.isFederalProperty}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded"
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
        <button
  type="submit"
  disabled={submitDisabled}
  className={`mt-4 px-6 py-2 rounded-lg shadow focus:outline-none focus:ring-2 
    ${submitDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} 
    text-white`}
>
  {isSubmitted ? 'Submitted' : submitDisabled ? 'Submitting...' : 'Submit Property'}
</button>

        </div>
      </form>

      {propertyId && <PropertyUse id={propertyId} />}
    </div>
  );
};

export default PropertyXMLForm;
