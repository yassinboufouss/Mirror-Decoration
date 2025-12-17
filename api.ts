import { Product, Order, Customer, OrderStatus } from './types';
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_CUSTOMERS } from './constants';

const API_BASE_URL = 'http://localhost:3001/api';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
};

// Helper to simulate network delay when using mocks
const simulateDelay = <T>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), 600));
};

export const api = {
    // Health Check
    async checkHealth(): Promise<boolean> {
        try {
            const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
            return res.ok;
        } catch (e) {
            return false;
        }
    },

    // Products
    async getProducts(): Promise<Product[]> {
        try {
            const res = await fetch(`${API_BASE_URL}/products`);
            return await handleResponse(res);
        } catch (e) {
            console.warn('Backend unavailable, returning mock products.');
            return MOCK_PRODUCTS;
        }
    },
    async createProduct(product: Product): Promise<Product> {
        try {
            const res = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product),
            });
            return await handleResponse(res);
        } catch (e) {
            console.warn('Backend unavailable, simulating creation.');
            return simulateDelay(product);
        }
    },
    async deleteProduct(id: string): Promise<void> {
        try {
            const res = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE',
            });
            return await handleResponse(res);
        } catch (e) {
            console.warn('Backend unavailable, simulating deletion.');
        }
    },

    // Orders
    async getOrders(): Promise<Order[]> {
        try {
            const res = await fetch(`${API_BASE_URL}/orders`);
            return await handleResponse(res);
        } catch (e) {
            console.warn('Backend unavailable, returning mock orders.');
            return MOCK_ORDERS;
        }
    },
    async createOrder(order: Order): Promise<Order> {
        try {
            const res = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order),
            });
            return await handleResponse(res);
        } catch (e) {
            console.warn('Backend unavailable, simulating order creation.');
            return simulateDelay(order);
        }
    },
    async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
        try {
            const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            return await handleResponse(res);
        } catch (e) {
            console.warn('Backend unavailable, simulating update.');
            const mockOrder = MOCK_ORDERS.find(o => o.id === id);
            return simulateDelay(mockOrder ? { ...mockOrder, status } : {} as Order);
        }
    },

    // Customers
    async getCustomers(): Promise<Customer[]> {
        try {
            const res = await fetch(`${API_BASE_URL}/customers`);
            return await handleResponse(res);
        } catch (e) {
             console.warn('Backend unavailable, returning mock customers.');
            return MOCK_CUSTOMERS;
        }
    },
    async createOrUpdateCustomer(customer: Customer): Promise<Customer> {
        try {
            const res = await fetch(`${API_BASE_URL}/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customer),
            });
            return await handleResponse(res);
        } catch (e) {
            console.warn('Backend unavailable, simulating customer save.');
            return simulateDelay(customer);
        }
    },
};