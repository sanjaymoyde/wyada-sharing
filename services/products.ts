
import { Product } from '../types';
import { buildApiUrl } from '../utils/api';

const API_URL = buildApiUrl('/api/products');

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
