
import { Product } from '../types';

// Helper to determine the base URL
const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    return import.meta.env.DEV ? 'http://localhost:5000' : '';
};

const API_URL = `${getBaseUrl()}/api/products`;

export const fetchProducts = async (): Promise<Product[]> => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
        const data: Product[] = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};
