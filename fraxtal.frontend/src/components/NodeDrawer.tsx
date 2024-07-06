import  { useState, useEffect } from 'react';

const NodeDrawer = ({ node, onClose, onChange }) => {
  const [formData, setFormData] = useState(node.data);

  useEffect(() => {
    setFormData(node.data);
  }, [node]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onChange({
      ...node,
      data: formData,
    });
    onClose();
  };

  const renderInput = (key, value) => {
    console.log(key, value)
    if (typeof value === 'number') {
      return (
        <div className="my-2" key={key}>
          <label className="block text-sm font-medium text-gray-700">
            {key}
          </label>
          <input
            type="number"
            name={key}
            value={value}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
          />
        </div>
      );
    }

    if (typeof value === 'string') {
      return (
        <div className="my-2" key={key}>
          <label className="block text-sm font-medium text-gray-700">
            {key}
          </label>
          <input
            type="text"
            name={key}
            value={value}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`fixed inset-0 z-50 flex justify-end`}>
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className={`relative w-80 h-full bg-stratx-main-bg p-4 shadow-lg transform transition-transform translate-x-0`}>
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-2xl font-medium text-stratx-accent-white">Edit Node</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            &times;
          </button>
        </div>
        <div className="mt-4 text-white">
          {Object.keys(formData).map((key) => renderInput(key, formData[key]))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-stratx-accent-cherry hover:bg-stratx-accent-cherry/70 text-white font-bold py-2 px-4 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeDrawer;
