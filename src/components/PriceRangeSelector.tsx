
import React, { useState, useEffect } from 'react';

interface PriceRangeSelectorProps {
  minPrice: number | null;
  maxPrice: number | null;
  onPriceChange: (min: number | null, max: number | null) => void;
}

const PriceRangeSelector: React.FC<PriceRangeSelectorProps> = ({ 
  minPrice, 
  maxPrice, 
  onPriceChange 
}) => {
  const [min, setMin] = useState<string>(minPrice?.toString() || '');
  const [max, setMax] = useState<string>(maxPrice?.toString() || '');

  // Update the parent component when values change
  useEffect(() => {
    const minVal = min ? parseInt(min, 10) : null;
    const maxVal = max ? parseInt(max, 10) : null;
    onPriceChange(minVal, maxVal);
  }, [min, max, onPriceChange]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setMin(value);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setMax(value);
    }
  };

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex-1">
        <label htmlFor="min-price" className="block text-sm text-gray-600 mb-1">
          Minimum ($)
        </label>
        <input
          id="min-price"
          type="text"
          className="w-full p-2 border rounded-md"
          placeholder="No Min"
          value={min}
          onChange={handleMinChange}
        />
      </div>
      
      <div className="flex-1">
        <label htmlFor="max-price" className="block text-sm text-gray-600 mb-1">
          Maximum ($)
        </label>
        <input
          id="max-price"
          type="text"
          className="w-full p-2 border rounded-md"
          placeholder="No Max"
          value={max}
          onChange={handleMaxChange}
        />
      </div>
    </div>
  );
};

export default PriceRangeSelector;
