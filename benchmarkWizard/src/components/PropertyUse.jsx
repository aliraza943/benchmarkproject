import React, { useEffect, useState } from 'react';
import { XMLParser } from 'fast-xml-parser';

export default function PropertyUse({ id }) {
  const [options, setOptions] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [refDetails, setRefDetails] = useState([]);
  const [typeDefs, setTypeDefs] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [submitResponse, setSubmitResponse] = useState(null);


  useEffect(() => {
    fetch('/property.xsd')
      .then(res => res.text())
      .then(data => {
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
        const json = parser.parse(data);
        const simpleTypes = json['xs:schema']['xs:simpleType'];
        const primaryFunction = simpleTypes.find(t => t.name === 'primaryFunctionType');
        const enums = primaryFunction['xs:restriction']['xs:enumeration'];
        setOptions(enums.map(e => e.value));
      })
      .catch(console.error);
  }, []);


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
          const elements = Array.isArray(seq['xs:element'])
            ? seq['xs:element']
            : [seq['xs:element']];
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

  const formatRefDoc = name => name.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());

  const loadCharacteristics = async refs => {
    try {
      const res = await fetch('/propertyUse/characteristics.xsd');
      const text = await res.text();
      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
      const json = parser.parse(text);
      const elements = json['xs:schema']['xs:element'] || [];
      setRefDetails(refs.map(ref => {
        const el = elements.find(e => e.name === ref);
        const type = el?.type || 'Unknown';
        const raw = el?.['xs:annotation']?.['xs:documentation']?.trim();
        const doc = raw || formatRefDoc(ref);
        return { name: ref, type, doc };
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const tryLoadXSD = async fileName => {
    try {
      const res = await fetch(`/propertyUse/${fileName}.xsd`);
      if (!res.ok || !res.headers.get('content-type').includes('xml')) throw new Error();
      const text = await res.text();
      const match = text.match(/<xs:complexType>[\s\S]*?<\/xs:complexType>/);
      if (!match) throw new Error();
      const refs = [...match[0].matchAll(/ref="([^"]+)"/g)].map(m => m[1]);
      await loadCharacteristics(refs);
      return refs;
    } catch {
      return null;
    }
  };

  const handleChange = async e => {
    const selected = e.target.value;
    setSelectedValue(selected);
    setErrorMessage('');
    setInputValues({});
    setRefDetails([]);
    if (!selected) return;
    const fn = formatFileName(selected);
    const refs = await tryLoadXSD(fn) || await tryLoadXSD('otherPropertyUses');
    if (!refs) setErrorMessage('Could not load properties.');
  };

  const onValueChange = (name, val) => {
    setInputValues(prev => ({ ...prev, [name]: val }));
  };

  // Build XML and submit to Flask endpoint
  const handleSubmit = async e => {
    e.preventDefault();
    const fn = formatFileName(selectedValue);
    const date = new Date().toISOString().split('T')[0];
    let xml = `<${fn}><name>${selectedValue}</name><useDetails>`;
    refDetails.forEach(({ name }) => {
        const value = inputValues[name] || '';
        const unitsAttr = name.includes('Floor') ? ' units="Square Feet"' : '';
        xml += `<${name} currentAsOf="${date}" temporary="false"${unitsAttr}><value>${value}</value></${name}>`;
      });
      
    xml += `</useDetails></${fn}>`;
  
    try {
      const res = await fetch(`http://localhost:5000/submit-propertyUse?id=${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: xml,
      });
      const result = await res.json();
      setSubmitResponse(result);
    } catch (err) {
      console.error('Submission error', err);
      setErrorMessage('Submission failed');
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <label className="block font-medium text-gray-700">Property Use Details</label>
      <select
        className="mt-1 w-full p-2 border rounded"
        value={selectedValue}
        onChange={handleChange}
        required
      >
        <option value="">Select one</option>
        {options.map((o, i) => <option key={i} value={o}>{o}</option>)}
      </select>

      {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
      {refDetails.map((item, i) => {
        const def = typeDefs[item.type] || { kind: 'text' };
        return (
          <div key={i} className="mt-4">
            <label className="block font-semibold">{item.doc}</label>
            {def.kind === 'enum' && (
              <select
                className="mt-1 w-full p-2 border rounded"
                value={inputValues[item.name] || ''}
                onChange={e => onValueChange(item.name, e.target.value)}
                required
              >
                <option value="">Select {item.name}</option>
                {def.values.map((v, idx) => <option key={idx} value={v}>{v}</option>)}
              </select>
            )}
            {def.kind === 'number' && (
              <input
                type="number"
                className="mt-1 w-full p-2 border rounded"
                value={inputValues[item.name] || ''}
                onChange={e => onValueChange(item.name, e.target.value)}
                required
              />
            )}
            {def.kind === 'text' && (
              <input
                type="text"
                className="mt-1 w-full p-2 border rounded"
                value={inputValues[item.name] || ''}
                onChange={e => onValueChange(item.name, e.target.value)}
                required
              />
            )}
          </div>
        );
      })}

      {refDetails.length > 0 && (
        <button
          type="submit"
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Submit
        </button>
      )}

      {submitResponse && (
        <pre className="mt-4 p-2 bg-gray-100 rounded">
          {JSON.stringify(submitResponse, null, 2)}
        </pre>
      )}
    </form>
  );
}
