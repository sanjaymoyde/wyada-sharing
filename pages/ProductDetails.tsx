import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductPage } from '../components/ProductPage';
import { Product } from '../types';

interface ProductDetailsProps {
    isNight: boolean;
    earthProduct: Product | null;
    waterProduct: Product | null;
    addToCart: (product: any) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
    isNight,
    earthProduct,
    waterProduct,
    addToCart
}) => {
    const { handle } = useParams<{ handle: string }>();
    const navigate = useNavigate();

    const productType = useMemo(() => {
        if (handle === 'mesa') return 'mesa';
        if (handle === 'crest') return 'crest';
        return null;
    }, [handle]);

    const productData = useMemo(() => {
        if (productType === 'mesa') return earthProduct;
        if (productType === 'crest') return waterProduct;
        return null;
    }, [productType, earthProduct, waterProduct]);

    if (!productType) {
        // Handle invalid product, maybe redirect or show 404
        return <div>Product not found</div>;
    }

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleAddToCart = () => {
        if (productType === 'mesa') {
            const variant = earthProduct?.variants?.[0];
            const price = variant?.price ? Number(variant.price) : 799;
            const variantId = variant?.id || 0;
            addToCart({ id: 'mesa', variantId, name: earthProduct?.title || 'mesa', price, color: '#E89C6C' });
        } else {
            const variant = waterProduct?.variants?.[0];
            const price = variant?.price ? Number(variant.price) : 1299;
            const variantId = variant?.id || 0;
            addToCart({ id: 'crest', variantId, name: waterProduct?.title || 'crest', price, color: '#5D9BCE' });
        }
    };

    return (
        <ProductPage
            productType={productType}
            isNight={isNight}
            onClose={handleBackToHome}
            productData={productData}
            onAddToCart={handleAddToCart}
        />
    );
};
