import React, { useState } from 'react';
import { Customer, Order } from '../types';
import { Plus, Save, X } from 'lucide-react';

interface CustomOrderFormProps {
  onClose: () => void;
  onSubmit: (order: Order, customer: Customer) => void;
}

const CustomOrderForm: React.FC<CustomOrderFormProps> = ({ onClose, onSubmit }) => {
  // Customer State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  // Mirror State
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [shape, setShape] = useState('Rectangle');
  const [frameType, setFrameType] = useState('Wood');
  const [frameColor, setFrameColor] = useState('Black');
  const [installRequired, setInstallRequired] = useState(false);

  // Financial State
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Transfer' | 'Card'>('Cash');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newCustomer: Customer = {
      id: `c-${Date.now()}`,
      name: customerName,
      phone,
      address,
      city,
      totalSpent: totalPrice,
      orderCount: 1,
    };

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      customerId: newCustomer.id,
      customerName: newCustomer.name,
      type: 'Custom Project',
      date: new Date().toISOString().split('T')[0],
      totalPrice,
      paidAmount,
      status: 'New',
      paymentMethod,
      customDetails: {
        width,
        height,
        shape: shape as any,
        frameType,
        frameColor,
        isInstallationRequired: installRequired,
      },
    };

    onSubmit(newOrder, newCustomer);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" /> New Custom Order
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Client Details */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">Client Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Karim Idrissi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
                <input
                  required
                  type="tel"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 600 000 000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">City</label>
                <input
                  required
                  type="text"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Casablanca"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Address</label>
                <input
                  required
                  type="text"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street Address, Neighborhood"
                />
              </div>
            </div>
          </section>

          {/* Mirror Specifications */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">Mirror Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Shape</label>
                <select
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none"
                  value={shape}
                  onChange={(e) => setShape(e.target.value)}
                >
                  <option>Rectangle</option>
                  <option>Square</option>
                  <option>Round</option>
                  <option>Oval</option>
                  <option>Custom Irregular</option>
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Width (cm)</label>
                  <input
                    type="number"
                    required
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    required
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Frame Type</label>
                <select
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none"
                  value={frameType}
                  onChange={(e) => setFrameType(e.target.value)}
                >
                  <option>Frameless</option>
                  <option>Wood</option>
                  <option>Aluminum</option>
                  <option>Brass</option>
                  <option>LED Backlit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Color/Finish</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none"
                  value={frameColor}
                  onChange={(e) => setFrameColor(e.target.value)}
                  placeholder="e.g. Gold"
                />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={installRequired}
                    onChange={(e) => setInstallRequired(e.target.checked)}
                    className="w-5 h-5 text-indigo-600"
                  />
                  <span className="text-slate-700">Installation Required at client site</span>
                </label>
              </div>
            </div>
          </section>

          {/* Financials */}
          <section className="col-span-1 md:col-span-2 space-y-4">
             <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">Order Summary</h3>
             <div className="bg-slate-50 p-4 rounded grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">Total Price (DH)</label>
                   <input
                      type="number"
                      required
                      min="0"
                      className="w-full p-2 border rounded text-lg font-bold text-slate-800"
                      value={totalPrice}
                      onChange={(e) => setTotalPrice(Number(e.target.value))}
                    />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">Advance Payment (DH)</label>
                   <input
                      type="number"
                      min="0"
                      className="w-full p-2 border rounded"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                    />
                </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">Payment Method</label>
                   <select
                      className="w-full p-2 border rounded"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                    >
                      <option>Cash</option>
                      <option>Transfer</option>
                      <option>Card</option>
                    </select>
                </div>
             </div>
             <div className="flex justify-end gap-2 text-lg">
                <span className="text-slate-500">Balance Due:</span>
                <span className={`font-bold ${totalPrice - paidAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {(totalPrice - paidAmount).toFixed(2)} DH
                </span>
             </div>
          </section>

          <div className="col-span-1 md:col-span-2 flex justify-end gap-4 border-t pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomOrderForm;