import React, { useEffect, useState } from 'react';
import { XMLParser } from 'fast-xml-parser';

export default function PropertyUse({ id }) {
  const [options] = useState([
    'Swimming Pool',
    'Ev Charging Station',
    'Residential Care Facility',
    'Restaurant',
    'Retail',
    'Parking',
  ]);
  
  const [selectedValues, setSelectedValues] = useState([]);
  const [refDetailsMap, setRefDetailsMap] = useState({});
  const [typeDefs, setTypeDefs] = useState({});
  const [inputValuesMap, setInputValuesMap] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [submitResponse, setSubmitResponse] = useState(null);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const res = await fetch('/propertyUse/characteristicType.xsd');
        const text = await res.text();
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
        const json = parser.parse(text);
        const defs = {};

        (json['xs:schema']['xs:simpleType'] || []).forEach(st => {
          const restr = st['xs:restriction'];
          if (restr && restr['xs:enumeration']) {
            const vals = Array.isArray(restr['xs:enumeration'])
              ? restr['xs:enumeration'].map(e => e.value)
              : [restr['xs:enumeration'].value];
            defs[st.name] = { kind: 'enum', values: vals };
          }
        });

        (json['xs:schema']['xs:complexType'] || []).forEach(ct => {
          const name = ct.name;
          const seq = ct['xs:complexContent']?.['xs:extension']?.['xs:sequence'];
          if (!seq) return;
          const elements = Array.isArray(seq['xs:element']) ? seq['xs:element'] : [seq['xs:element']];
          const valEl = elements.find(e => e.name === 'value');
          if (!valEl) return;
          const inlineEnum = valEl['xs:simpleType']?.['xs:restriction']?.['xs:enumeration'];
          if (inlineEnum) {
            const vals = Array.isArray(inlineEnum)
              ? inlineEnum.map(e => e.value)
              : [inlineEnum.value];
            defs[name] = { kind: 'enum', values: vals };
          } else if (valEl.type) {
            const t = valEl.type;
            if (defs[t]?.kind === 'enum') defs[name] = { kind: 'enum', values: defs[t].values };
            else if (t === 'xs:string') defs[name] = { kind: 'text' };
            else defs[name] = { kind: 'number' };
          }
        });

        setTypeDefs(defs);
      } catch (err) {
        console.error('Error loading type definitions:', err);
      }
    };

    loadTypes();
  }, []);

  const formatFileName = label =>
    label.replace(/\(.*?\)/g, '')
      .replace(/&/g, 'and')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim()
      .split(' ')
      .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
      .join('');

  const formatRefDoc = name =>
    name.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());

  const loadCharacteristics = async (refs) => {
    try {
      const res = await fetch('/propertyUse/characteristics.xsd');
      const text = await res.text();
      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
      const json = parser.parse(text);
      const elements = json['xs:schema']['xs:element'] || [];

      return refs.map(ref => {
        const el = elements.find(e => e.name === ref);
        const type = el?.type || 'Unknown';
        const raw = el?.['xs:annotation']?.['xs:documentation']?.trim();
        const doc = raw || formatRefDoc(ref);
        return { name: ref, type, doc };
      });
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const tryLoadXSD = async fileName => {
    try {
      const res = await fetch(`/propertyUse/${fileName}.xsd`);
      if (!res.ok || !res.headers.get('content-type')?.includes('xml')) throw new Error();
      const text = await res.text();
      const match = text.match(/<xs:complexType>[\s\S]*?<\/xs:complexType>/);
      if (!match) throw new Error();
      const refs = [...match[0].matchAll(/ref="([^"]+)"/g)].map(m => m[1]);
      return await loadCharacteristics(refs);
    } catch {
      return null;
    }
  };

  const handleToggleSelect = async label => {
    const isSelected = selectedValues.includes(label);
    const updated = isSelected
      ? selectedValues.filter(l => l !== label)
      : [...selectedValues, label];

    setSelectedValues(updated);

    if (!isSelected) {
      const fn = formatFileName(label);
      const details = await tryLoadXSD(fn) || await tryLoadXSD('otherPropertyUses');
      if (!details) {
        setErrorMessage(`Could not load details for ${label}`);
        return;
      }
      setRefDetailsMap(prev => ({ ...prev, [fn]: details }));
      setInputValuesMap(prev => ({ ...prev, [fn]: {} }));
    }
  };

  const handleInputChange = (fileKey, field, value) => {
    setInputValuesMap(prev => ({
      ...prev,
      [fileKey]: { ...prev[fileKey], [field]: value }
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const date = new Date().toISOString().split('T')[0];
    setErrorMessage('');
    setSubmitResponse(null);
  
    const results = [];
    // map your “file-friendly” names to the actual XSD root element names:
    const rootTagMap = {
      evChargingStation: 'electricVehicleChargingStation'
      // add other mappings here if needed
    };
  
    for (const label of selectedValues) {
      const fn = formatFileName(label);               // e.g. "evChargingStation"
      const rootTag = rootTagMap[fn] || fn;           // yields "electricVehicleChargingStation"
      const details = refDetailsMap[fn];
      const values = inputValuesMap[fn] || {};
      if (!details) continue;
  
      // build XML with the correct root tag
      let xml = `<${rootTag}><name>${label}</name><useDetails>`;
      details.forEach(({ name }) => {
        const value = values[name] || '';
        let unitsAttr = '';
        if (name.includes('Floor') || name.includes('Area')||  name.includes('area') || name.includes('Footage') ) unitsAttr = ' units="Square Feet"';
        else if (name.includes('length') || name.includes('Height')) unitsAttr = ' units="Feet"';
        xml += `<${name} currentAsOf="${date}" temporary="false"${unitsAttr}><value>${value}</value></${name}>`;
      });
      xml += `</useDetails></${rootTag}>`;
  
      console.log('XML:', xml);
  
      try {
        const res = await fetch(`http://localhost:5000/submit-propertyUse?id=${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/xml' },
          body: xml,
        });
        const result = await res.json();
        results.push({ label, status: 'success', response: result });
      } catch (err) {
        results.push({ label, status: 'error', message: err.message });
      }
    }
  
    setSubmitResponse(results);
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <label className="block font-medium text-gray-700 mb-2">Select Property Uses</label>
      <div className="flex flex-wrap gap-2 mb-4">
        {options.map(option => {
          const selected = selectedValues.includes(option);
          return (
            <button
              type="button"
              key={option}
              className={`px-3 py-1 rounded border ${selected ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => handleToggleSelect(option)}
            >
              My Property Has {option}
            </button>
          );
        })}
      </div>

      {errorMessage && <p className="text-red-600">{errorMessage}</p>}

      {selectedValues.map(label => {
        const fn = formatFileName(label);
        const details = refDetailsMap[fn] || [];
        const inputValues = inputValuesMap[fn] || {};

        return (
          <div key={label} className="mb-6">
            <h3 className="text-lg font-semibold mb-2">{label}</h3>
            {details.map((item, idx) => {
              const def = typeDefs[item.type] || { kind: 'text' };
              return (
                <div key={idx} className="mb-3">
                  <label className="block font-medium">{item.doc}</label>
                  {def.kind === 'enum' ? (
                    <select
                      className="w-full p-2 border rounded"
                      value={inputValues[item.name] || ''}
                      onChange={e => handleInputChange(fn, item.name, e.target.value)}
                      required
                    >
                      <option value="">Select {item.name}</option>
                      {def.values.map((v, i) => (
                        <option key={i} value={v}>{v}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={def.kind === 'number' ? 'number' : 'text'}
                      className="w-full p-2 border rounded"
                      value={inputValues[item.name] || ''}
                      onChange={e => handleInputChange(fn, item.name, e.target.value)}
                      required
                    />
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {selectedValues.length > 0 && (
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Submit
        </button>
      )}

      {submitResponse && (
        <div className="mt-6">
          <h4 className="font-bold text-lg">Submission Results:</h4>
          <ul className="mt-2 list-disc pl-6">
            {submitResponse.map((r, i) => (
              <li key={i} className={r.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                {r.label}: {r.status === 'success' ? 'Submitted successfully' : `Failed - ${r.message}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
