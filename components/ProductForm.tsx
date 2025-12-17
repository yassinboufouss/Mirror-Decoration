import React, { useState } from 'react';
import { Product, MirrorType, MirrorShape } from '../types';
import { Save, X, Upload } from 'lucide-react';

interface ProductFormProps {
  onClose: () => void;
  onSubmit: (product: Product) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<MirrorType>('Wall Mirror');
  const [shape, setShape] = useState<MirrorShape>('Rectangle');
  const [dimensions, setDimensions] = useState('');
  const [price, setPrice] = useState<string>(''); // use string for easier empty state handling
  const [stock, setStock] = useState<string>(''); 
  const [image, setImage] = useState<string>('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !price || !stock) return;

    const newProduct: Product = {
      id: `p-${Date.now()}`,
      name,
      // Use placeholder if no image uploaded
      image: image || `https://via.placeholder.com/200?text=${encodeURIComponent(name)}`, 
      type,
      shape,
      dimensions: dimensions || 'Standard',
      price: Number(price),
      stock: Number(stock),
      // Status is calculated dynamically in App.tsx, but we set a default here
      status: Number(stock) > 0 ? 'In Stock' : 'Out of Stock',
      isVisible: true,
    };

    onSubmit(newProduct);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Add New Product
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Image Upload Area */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Product Image</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50 text-center hover:bg-slate-100 transition-colors relative">
                    {image ? (
                         <div className="relative inline-block group">
                            <img src={image} alt="Preview" className="h-40 object-contain rounded shadow-sm bg-white" />
                            <button 
                                type="button"
                                onClick={() => setImage('')}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-md transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                         </div>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center gap-2 w-full h-full">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                                <Upload className="w-6 h-6" />
                            </div>
                            <div className="text-sm text-slate-600">
                                <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
                            </div>
                            <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    )}
                </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                    <input 
                        required 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none"
                        placeholder="e.g. Modern Round Wall Mirror"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                        <select 
                            value={type} 
                            onChange={e => setType(e.target.value as MirrorType)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none bg-white"
                        >
                            <option value="Wall Mirror">Wall Mirror</option>
                            <option value="Decorative">Decorative</option>
                            <option value="LED Mirror">LED Mirror</option>
                            <option value="Custom Cut">Custom Cut</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Shape</label>
                        <select 
                            value={shape} 
                            onChange={e => setShape(e.target.value as MirrorShape)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none bg-white"
                        >
                            <option value="Rectangle">Rectangle</option>
                            <option value="Round">Round</option>
                            <option value="Square">Square</option>
                            <option value="Oval">Oval</option>
                            <option value="Custom">Custom</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Dimensions</label>
                        <input 
                            type="text" 
                            value={dimensions} 
                            onChange={e => setDimensions(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none"
                            placeholder="e.g. 60x80cm"
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Price (DH)</label>
                        <input 
                            required
                            type="number" 
                            min="0"
                            value={price} 
                            onChange={e => setPrice(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none"
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Stock Qty</label>
                        <input 
                            required
                            type="number" 
                            min="0"
                            value={stock} 
                            onChange={e => setStock(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded transition-colors">
                    Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Product
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;