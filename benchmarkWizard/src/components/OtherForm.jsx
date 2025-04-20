import React, { useEffect, useState } from 'react';
import { XMLParser } from 'fast-xml-parser';

export default function PrimaryFunctionDropdown({ value, onChange }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    fetch('/property.xsd')
      .then(res => res.text())
      .then(data => {
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '',
        });
        const json = parser.parse(data);

        const simpleTypes = json['xs:schema']['xs:simpleType'];
        const primaryFunction = simpleTypes.find(
          (type) => type.name === 'primaryFunctionType'
        );
        const enumerations =
          primaryFunction['xs:restriction']['xs:enumeration'];

        const values = enumerations.map((e) => e.value);
        setOptions(values);
      })
      .catch((err) => console.error('Error loading XSD:', err));
  }, []);

  return (
    <div>
      <label htmlFor="primaryFunction" className="block font-medium text-gray-700"></label>
      <select
        id="primaryFunction"
        name="primaryFunction"
        value={value}
        onChange={onChange}
        required
        className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select one</option>
        {options.map((val, idx) => (
          <option key={idx} value={val}>{val}</option>
        ))}
      </select>
    </div>
  );
}
