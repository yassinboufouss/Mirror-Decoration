import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  BarChart3, 
  ClipboardList, 
  Menu, 
  Bell, 
  Search,
  Plus,
  AlertTriangle,
  Package,
  TrendingUp,
  DollarSign,
  Printer,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  PenTool,
  SlidersHorizontal,
  WifiOff
} from 'lucide-react';
import { CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend } from 'recharts';
import { Product, Order, Customer, KPI, OrderStatus, StockStatus } from './types';
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_CUSTOMERS } from './constants';
import CustomOrderForm from './components/CustomOrderForm';
import ProductForm from './components/ProductForm';
import { api } from './api';

// --- Types & Interfaces for App State ---
type View = 'dashboard' | 'products' | 'orders' | 'customers' | 'analytics' | 'settings';

// --- Shared Utility Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'In Stock': 'bg-green-100 text-green-800',
    'Low Stock': 'bg-yellow-100 text-yellow-800',
    'Out of Stock': 'bg-red-100 text-red-800',
    'New': 'bg-blue-100 text-blue-800',
    'In Production': 'bg-purple-100 text-purple-800',
    'Ready': 'bg-teal-100 text-teal-800',
    'Installed': 'bg-green-100 text-green-800',
    'Completed': 'bg-gray-100 text-gray-800',
    'Cancelled': 'bg-red-50 text-red-600',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  // --- Global State ---
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showCustomOrderModal, setShowCustomOrderModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // For detail view
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);

  // --- Initial Data Fetch ---
  useEffect(() => {
    const loadData = async () => {
        // 1. Check connectivity
        const connected = await api.checkHealth();
        setIsBackendConnected(connected);

        // 2. Fetch data (API will fallback to mocks if disconnected)
        const [fetchedProducts, fetchedOrders, fetchedCustomers] = await Promise.all([
            api.getProducts(),
            api.getOrders(),
            api.getCustomers()
        ]);
        
        setProducts(fetchedProducts);
        setOrders(fetchedOrders);
        setCustomers(fetchedCustomers);
    };
    loadData();
  }, []);

  // --- Derived State (KPIs) ---
  const kpiData: KPI = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const revenueToday = orders
      .filter(o => o.date === today && o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.paidAmount, 0);
    
    // Simplified month calculation (assuming all mock data is recent for demo)
    const revenueMonth = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.paidAmount, 0);

    return {
      revenueToday,
      revenueMonth,
      totalOrders: orders.length,
      activeCustomProjects: orders.filter(o => o.type === 'Custom Project' && o.status !== 'Installed' && o.status !== 'Cancelled').length,
      inStock: products.filter(p => p.stock > 0).length,
      outOfStock: products.filter(p => p.stock === 0).length,
    };
  }, [orders, products]);

  // --- Handlers ---
  
  const handleAddCustomOrder = async (newOrder: Order, newCustomer: Customer) => {
    // Optimistic Update
    setOrders([newOrder, ...orders]);
    
    // Handle Customer State Optimistically
    const existingCust = customers.find(c => c.phone === newCustomer.phone);
    if (!existingCust) {
      setCustomers([...customers, newCustomer]);
    } else {
        const updatedCustomers = customers.map(c => 
            c.id === existingCust.id 
            ? { ...c, totalSpent: c.totalSpent + newOrder.totalPrice, orderCount: c.orderCount + 1 }
            : c
        );
        setCustomers(updatedCustomers);
    }

    setShowCustomOrderModal(false);
    setCurrentView('orders');

    // Async Backend Sync (no await to block UI)
    api.createOrUpdateCustomer(newCustomer).catch(e => console.warn(e));
    api.createOrder(newOrder).catch(e => console.warn(e));
  };

  const handleAddProduct = async (newProduct: Product) => {
      // Optimistic
      setProducts([newProduct, ...products]);
      setShowProductModal(false);

      // Async Backend
      api.createProduct(newProduct).catch(e => console.warn(e));
  };

  const handleDeleteProduct = async (id: string) => {
      if(confirm('Are you sure you want to delete this product?')) {
          setProducts(products.filter(p => p.id !== id));
          api.deleteProduct(id).catch(e => console.warn(e));
      }
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: OrderStatus) => {
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      api.updateOrderStatus(id, newStatus).catch(e => console.warn(e));
  };

  const getStockStatus = (stock: number): StockStatus => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= lowStockThreshold) return 'Low Stock';
    return 'In Stock';
  };

  // --- Sub-Components (Views) ---

  const Sidebar = () => (
    <div className={`bg-slate-900 text-white transition-all duration-300 flex-shrink-0 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'} h-screen fixed left-0 top-0 z-20`}>
      <div className="h-16 flex items-center justify-center border-b border-slate-700">
        {isSidebarOpen ? (
          <h1 className="text-xl font-bold tracking-wider text-indigo-400">REFLECT<span className="text-white">MANAGER</span></h1>
        ) : (
          <span className="text-xl font-bold text-indigo-400">RM</span>
        )}
      </div>

      <nav className="flex-1 py-6 space-y-2 px-3">
        {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'products', icon: Package, label: 'Products' },
            { id: 'orders', icon: ClipboardList, label: 'Orders' },
            { id: 'customers', icon: Users, label: 'Customers' },
            { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            { id: 'settings', icon: Settings, label: 'Settings' },
        ].map((item) => (
            <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${
                    currentView === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-4 text-slate-400 hover:text-white w-full px-3 py-2">
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
      </div>
    </div>
  );

  const Header = () => (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm no-print">
      <div className="flex items-center gap-4">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-full lg:hidden">
          <Menu className="w-6 h-6 text-slate-600" />
        </button>
        <h2 className="text-lg font-semibold text-slate-800 capitalize hidden sm:block">{currentView}</h2>
        {!isBackendConnected && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                <WifiOff className="w-3 h-3" />
                <span className="hidden md:inline">Offline Mode (Mock Data)</span>
            </div>
        )}
      </div>
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input type="text" placeholder="Search orders, clients..." className="pl-10 pr-4 py-2 border rounded-full text-sm w-64 focus:outline-none focus:border-indigo-500" />
        </div>
        <button className="relative p-2 hover:bg-slate-100 rounded-full">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">A</div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">Admin User</span>
        </div>
      </div>
    </header>
  );

  // --- Views Implementation ---

  const DashboardView = () => (
    <div className="space-y-6 animate-fade-in">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-slate-500 mb-1">Total Revenue (Month)</p>
                        <h3 className="text-2xl font-bold text-slate-800">{kpiData.revenueMonth.toLocaleString()} DH</h3>
                    </div>
                    <div className="p-2 bg-indigo-50 rounded-lg"><DollarSign className="w-6 h-6 text-indigo-600" /></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                 <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-slate-500 mb-1">Active Custom Projects</p>
                        <h3 className="text-2xl font-bold text-slate-800">{kpiData.activeCustomProjects}</h3>
                    </div>
                    <div className="p-2 bg-purple-50 rounded-lg"><PenTool className="w-6 h-6 text-purple-600" /></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                 <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-slate-500 mb-1">Mirrors In Stock</p>
                        <h3 className="text-2xl font-bold text-slate-800">{kpiData.inStock}</h3>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg"><Package className="w-6 h-6 text-emerald-600" /></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                 <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-slate-500 mb-1">Out of Stock</p>
                        <h3 className="text-2xl font-bold text-red-600">{kpiData.outOfStock}</h3>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
                </div>
            </div>
        </div>

        {/* Quick Actions & Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Action Area */}
            <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800">Recent Custom Orders</h3>
                    <button onClick={() => setCurrentView('orders')} className="text-sm text-indigo-600 hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-4 py-3">Order ID</th>
                                <th className="px-4 py-3">Client</th>
                                <th className="px-4 py-3">Details</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.filter(o => o.type === 'Custom Project').slice(0, 5).map(order => (
                                <tr key={order.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                    <td className="px-4 py-3 font-medium text-slate-700">#{order.id.slice(-4)}</td>
                                    <td className="px-4 py-3">{order.customerName}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {order.customDetails?.width}x{order.customDetails?.height}cm, {order.customDetails?.shape}
                                    </td>
                                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-xl shadow-md p-6 flex flex-col justify-center gap-4">
                <h3 className="text-lg font-bold mb-2">Quick Actions</h3>
                <button 
                  onClick={() => setShowCustomOrderModal(true)}
                  className="w-full bg-white text-indigo-700 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    <Plus className="w-5 h-5" /> New Custom Order
                </button>
                <button 
                  onClick={() => {
                    setCurrentView('products');
                    setShowProductModal(true);
                  }}
                  className="w-full bg-indigo-500 text-white border border-indigo-400 py-3 rounded-lg font-semibold hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Package className="w-5 h-5" /> Add Stock
                </button>
                <button 
                  onClick={() => setCurrentView('analytics')}
                  className="w-full bg-indigo-500 text-white border border-indigo-400 py-3 rounded-lg font-semibold hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                >
                    <BarChart3 className="w-5 h-5" /> View Sales Report
                </button>
            </div>
        </div>
    </div>
  );

  const ProductsView = () => (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800">Inventory</h2>
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border shadow-sm flex-1 sm:flex-none">
                    <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                    <label className="text-sm text-slate-600 font-medium whitespace-nowrap">Low Stock Alert:</label>
                    <input 
                        type="number" 
                        min="0"
                        value={lowStockThreshold}
                        onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                        className="w-16 border rounded px-2 py-1 text-sm focus:outline-indigo-500 text-center"
                    />
                </div>
                <button 
                    onClick={() => setShowProductModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shrink-0"
                >
                    <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Product</span>
                </button>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                    <tr>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Dimensions</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {products.map(product => {
                        const dynamicStatus = getStockStatus(product.stock);
                        const isLowStock = dynamicStatus === 'Low Stock';
                        const isOutOfStock = dynamicStatus === 'Out of Stock';
                        
                        return (
                        <tr key={product.id} className={`hover:bg-slate-50 group transition-colors ${isOutOfStock ? 'bg-red-50/40' : ''}`}>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover bg-slate-200" />
                                        {(isLowStock || isOutOfStock) && (
                                            <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                                <AlertTriangle className={`w-3 h-3 ${isOutOfStock ? 'text-red-500' : 'text-amber-500'}`} />
                                            </div>
                                        )}
                                    </div>
                                    <span className={`font-medium ${isOutOfStock ? 'text-red-700' : 'text-slate-700'}`}>{product.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{product.type}</td>
                            <td className="px-6 py-4 text-slate-600">{product.dimensions}</td>
                            <td className="px-6 py-4 font-medium text-slate-700">{product.price} DH</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <span className={`font-medium ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-slate-600'}`}>
                                        {product.stock}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4"><StatusBadge status={dynamicStatus} /></td>
                            <td className="px-6 py-4">
                                <button onClick={() => handleDeleteProduct(product.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
        
        {/* Helper Note */}
        <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg flex items-center gap-2">
             <AlertTriangle className="w-4 h-4" />
             <span>Products with stock at or below <strong>{lowStockThreshold}</strong> are marked as Low Stock.</span>
        </div>
    </div>
  );

  const OrdersView = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Orders Management</h2>
            <div className="flex gap-2">
                <select className="border rounded-md px-3 py-2 text-sm text-slate-600 focus:outline-none">
                    <option>All Status</option>
                    <option>New</option>
                    <option>In Production</option>
                    <option>Installed</option>
                </select>
                <button onClick={() => setShowCustomOrderModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                    New Order
                </button>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                    <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Balance</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                            <td className="px-6 py-4 font-mono text-sm text-slate-500">#{order.id.slice(-6)}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{order.date}</td>
                            <td className="px-6 py-4 font-medium text-slate-700">{order.customerName}</td>
                            <td className="px-6 py-4">
                                <span className={`text-xs px-2 py-1 rounded border ${order.type === 'Custom Project' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                                    {order.type}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-medium">{order.totalPrice} DH</td>
                            <td className={`px-6 py-4 text-sm ${order.totalPrice - order.paidAmount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {(order.totalPrice - order.paidAmount).toFixed(2)} DH
                            </td>
                            <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-indigo-600 hover:underline text-sm font-medium">View</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    </div>
  );

  const CustomersView = () => (
      <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Customers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map(customer => (
                  <div key={customer.id} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                              {customer.name.charAt(0)}
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-800">{customer.name}</h3>
                              <p className="text-sm text-slate-500">{customer.city}</p>
                          </div>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600 mb-4">
                          <p className="flex items-center gap-2"><span className="text-slate-400">Phone:</span> {customer.phone}</p>
                          <p className="flex items-center gap-2"><span className="text-slate-400">Address:</span> {customer.address}</p>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-center">
                              <p className="text-xs text-slate-400 uppercase">Orders</p>
                              <p className="font-bold text-slate-700">{customer.orderCount}</p>
                          </div>
                          <div className="text-center">
                              <p className="text-xs text-slate-400 uppercase">Total Spent</p>
                              <p className="font-bold text-green-600">{customer.totalSpent} DH</p>
                          </div>
                          <button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-full"><ClipboardList className="w-5 h-5"/></button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const AnalyticsView = () => {
    // Scaled data for DH
    const data = [
        { name: 'Mon', sales: 4000 },
        { name: 'Tue', sales: 3000 },
        { name: 'Wed', sales: 6000 },
        { name: 'Thu', sales: 2000 },
        { name: 'Fri', sales: 9000 },
        { name: 'Sat', sales: 12000 },
        { name: 'Sun', sales: 8500 },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Performance Analytics</h2>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="font-bold text-slate-700 mb-6">Weekly Sales Revenue</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value} DH`} />
                            <Tooltip formatter={(value) => `${value} DH`} />
                            <Bar dataKey="sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
  };

  // --- Invoice / Detail Modal ---
  const OrderDetailModal = () => {
      if (!selectedOrder) return null;
      
      const balance = selectedOrder.totalPrice - selectedOrder.paidAmount;

      return (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
              <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden print:shadow-none print:w-full">
                  {/* Header - No Print */}
                  <div className="bg-slate-50 border-b px-6 py-4 flex justify-between items-center no-print">
                      <h3 className="font-bold text-slate-700">Order Details</h3>
                      <div className="flex gap-2">
                        <button onClick={() => window.print()} className="p-2 hover:bg-white rounded border flex items-center gap-2 text-sm text-slate-600">
                            <Printer className="w-4 h-4"/> Print
                        </button>
                        <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-200 rounded-full">
                            <XCircle className="w-6 h-6 text-slate-400"/>
                        </button>
                      </div>
                  </div>

                  {/* Printable Content */}
                  <div className="p-8 space-y-8" id="invoice">
                      <div className="flex justify-between items-start">
                          <div>
                              <h1 className="text-3xl font-bold text-indigo-700 mb-1">REFLECT<span className="text-slate-800">MANAGER</span></h1>
                              <p className="text-sm text-slate-500">Qt Industriel Sidi Maarouf, Casablanca</p>
                              <p className="text-sm text-slate-500">Phone: +212 522 123 456</p>
                          </div>
                          <div className="text-right">
                              <h2 className="text-2xl font-bold text-slate-800">INVOICE</h2>
                              <p className="text-slate-600 font-mono">#{selectedOrder.id}</p>
                              <p className="text-sm text-slate-500">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                          </div>
                      </div>

                      <div className="flex justify-between border-t border-b py-6">
                          <div>
                              <p className="text-xs uppercase text-slate-400 font-bold mb-1">Bill To</p>
                              <p className="font-bold text-slate-800">{selectedOrder.customerName}</p>
                              {/* In a real app, join with Customer table to get address here */}
                              <p className="text-sm text-slate-600">Client ID: {selectedOrder.customerId}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-xs uppercase text-slate-400 font-bold mb-1">Status</p>
                             <StatusBadge status={selectedOrder.status} />
                          </div>
                      </div>

                      <div>
                          <table className="w-full text-left">
                              <thead>
                                  <tr className="border-b-2 border-slate-100 text-sm text-slate-500">
                                      <th className="pb-2">Description</th>
                                      <th className="pb-2 text-right">Amount</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y">
                                  {selectedOrder.items && selectedOrder.items.map(item => (
                                      <tr key={item.id}>
                                          <td className="py-4">
                                              <p className="font-bold text-slate-700">{item.name}</p>
                                              <p className="text-xs text-slate-500">{item.dimensions} - {item.type}</p>
                                          </td>
                                          <td className="py-4 text-right font-mono">{item.price.toFixed(2)} DH</td>
                                      </tr>
                                  ))}
                                  {selectedOrder.type === 'Custom Project' && selectedOrder.customDetails && (
                                       <tr>
                                          <td className="py-4">
                                              <p className="font-bold text-slate-700">Custom Mirror Project</p>
                                              <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                                                  <p>Dimensions: {selectedOrder.customDetails.width}cm x {selectedOrder.customDetails.height}cm</p>
                                                  <p>Shape: {selectedOrder.customDetails.shape}</p>
                                                  <p>Frame: {selectedOrder.customDetails.frameType} ({selectedOrder.customDetails.frameColor})</p>
                                                  <p>Installation: {selectedOrder.customDetails.isInstallationRequired ? 'Yes' : 'No'}</p>
                                              </div>
                                          </td>
                                          <td className="py-4 text-right font-mono">{selectedOrder.totalPrice.toFixed(2)} DH</td>
                                       </tr>
                                  )}
                              </tbody>
                          </table>
                      </div>

                      <div className="flex justify-end">
                          <div className="w-1/2 space-y-3">
                              <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">Subtotal</span>
                                  <span className="font-mono">{selectedOrder.totalPrice.toFixed(2)} DH</span>
                              </div>
                              <div className="flex justify-between text-sm text-green-600">
                                  <span>Paid</span>
                                  <span className="font-mono">-{selectedOrder.paidAmount.toFixed(2)} DH</span>
                              </div>
                              <div className="flex justify-between text-lg font-bold border-t pt-2">
                                  <span>Balance Due</span>
                                  <span className="font-mono">{balance.toFixed(2)} DH</span>
                              </div>
                          </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded text-xs text-slate-500 text-center no-print">
                          <p>Thank you for choosing ReflectManager. Please pay the remaining balance upon installation/delivery.</p>
                      </div>
                      
                      {/* Action Buttons for Admin - No Print */}
                      <div className="pt-6 border-t no-print flex gap-3">
                        <p className="text-sm font-bold self-center mr-auto">Update Status:</p>
                        {['In Production', 'Ready', 'Installed', 'Completed'].map((s) => (
                             <button 
                                key={s}
                                onClick={() => handleUpdateOrderStatus(selectedOrder.id, s as OrderStatus)}
                                className={`text-xs px-3 py-2 rounded border hover:bg-slate-50 ${selectedOrder.status === s ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : ''}`}
                             >
                                {s}
                             </button>
                        ))}
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  // --- Main Render ---

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-800">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 hidden lg:block`}>
          <Sidebar />
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
        <Header />
        
        <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto">
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'products' && <ProductsView />}
            {currentView === 'orders' && <OrdersView />}
            {currentView === 'customers' && <CustomersView />}
            {currentView === 'analytics' && <AnalyticsView />}
            {currentView === 'settings' && <div className="text-center py-20 text-slate-400">Settings Panel (Work in Progress)</div>}
        </main>
      </div>

      {/* Modals */}
      {showCustomOrderModal && (
          <CustomOrderForm 
            onClose={() => setShowCustomOrderModal(false)} 
            onSubmit={handleAddCustomOrder} 
          />
      )}
      {showProductModal && (
          <ProductForm
            onClose={() => setShowProductModal(false)}
            onSubmit={handleAddProduct}
          />
      )}
      
      {selectedOrder && <OrderDetailModal />}
    </div>
  );
};

export default App;