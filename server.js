const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Allow all origins to prevent CORS issues in dev
app.use(cors());
app.use(bodyParser.json());

// --- Initial Data (Localized for Morocco) ---

let products = [
  {
    id: 'p1',
    name: 'Luxe LED Vanity Mirror',
    image: 'https://picsum.photos/200/200?random=1',
    type: 'LED Mirror',
    shape: 'Rectangle',
    dimensions: '60x80cm',
    price: 1500,
    stock: 12,
    status: 'In Stock',
    isVisible: true,
  },
  {
    id: 'p2',
    name: 'Gold Sunburst Decor',
    image: 'https://picsum.photos/200/200?random=2',
    type: 'Decorative',
    shape: 'Round',
    dimensions: '90cm Dia',
    price: 2200,
    stock: 3,
    status: 'Low Stock',
    isVisible: true,
  },
  {
    id: 'p3',
    name: 'Minimalist Black Frame',
    image: 'https://picsum.photos/200/200?random=3',
    type: 'Wall Mirror',
    shape: 'Round',
    dimensions: '50cm Dia',
    price: 850,
    stock: 0,
    status: 'Out of Stock',
    isVisible: true,
  },
  {
    id: 'p4',
    name: 'Frameless Beveled Edge',
    image: 'https://picsum.photos/200/200?random=4',
    type: 'Wall Mirror',
    shape: 'Rectangle',
    dimensions: '120x60cm',
    price: 1100,
    stock: 25,
    status: 'In Stock',
    isVisible: true,
  },
];

let customers = [
  {
    id: 'c1',
    name: 'Amine Benali',
    phone: '+212 661-123456',
    address: '12 Bd Zerktouni',
    city: 'Casablanca',
    totalSpent: 4500,
    orderCount: 2,
  },
  {
    id: 'c2',
    name: 'Salma Bennani',
    phone: '+212 663-987654',
    address: '45 Ave Mohammed VI',
    city: 'Marrakech',
    totalSpent: 12000,
    orderCount: 1,
  },
  {
    id: 'c3',
    name: 'Youssef El Alami',
    phone: '+212 661-554433',
    address: '88 Rue des Consuls',
    city: 'Rabat',
    totalSpent: 1500,
    orderCount: 1,
  },
];

let orders = [
  {
    id: 'ord-1001',
    customerId: 'c1',
    customerName: 'Amine Benali',
    type: 'Standard',
    date: '2023-10-25',
    totalPrice: 1500,
    paidAmount: 1500,
    status: 'Completed',
    paymentMethod: 'Card',
    items: [products[0]],
  },
  {
    id: 'ord-1002',
    customerId: 'c2',
    customerName: 'Salma Bennani',
    type: 'Custom Project',
    date: '2023-10-26',
    totalPrice: 12000,
    paidAmount: 6000,
    status: 'In Production',
    paymentMethod: 'Transfer',
    customDetails: {
      width: 200,
      height: 150,
      shape: 'Rectangle',
      frameType: 'Antique Brass',
      frameColor: 'Gold',
      isInstallationRequired: true,
    },
  },
  {
    id: 'ord-1003',
    customerId: 'c3',
    customerName: 'Youssef El Alami',
    type: 'Standard',
    date: '2023-10-27',
    totalPrice: 1500,
    paidAmount: 1500,
    status: 'New',
    paymentMethod: 'Cash',
    items: [products[0]],
  },
];

// --- Routes ---

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Products
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const newProduct = req.body;
  products.unshift(newProduct);
  res.status(201).json(newProduct);
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  products = products.filter(p => p.id !== id);
  res.status(200).json({ message: 'Deleted' });
});

// Orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const newOrder = req.body;
  orders.unshift(newOrder);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    orders = orders.map(o => o.id === id ? { ...o, ...updates } : o);
    res.json(orders.find(o => o.id === id));
});

// Customers
app.get('/api/customers', (req, res) => {
  res.json(customers);
});

app.post('/api/customers', (req, res) => {
  const newCustomer = req.body;
  // Simple check to avoid duplicates based on phone for this demo
  const existing = customers.find(c => c.phone === newCustomer.phone);
  if (!existing) {
      customers.push(newCustomer);
      res.status(201).json(newCustomer);
  } else {
      // Update existing
      customers = customers.map(c => c.id === existing.id ? { ...c, ...newCustomer } : c);
      res.json(newCustomer);
  }
});

// Start Server on 0.0.0.0 to allow external access (e.g. from containers)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});