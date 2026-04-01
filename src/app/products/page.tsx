import { Metadata } from 'next';
import { Suspense } from 'react';
import products from '@/data/products.json';
import brands from '@/data/brands.json';
import categories from '@/data/categories.json';
import ProductsClient from './ProductsClient';

export const metadata: Metadata = {
  title: 'Sản phẩm Pickleball',
  description: 'Danh sách sản phẩm pickleball chính hãng - vợt, bóng, giày, phụ kiện từ các thương hiệu hàng đầu',
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Đang tải...</div>}>
      <ProductsClient products={products} brands={brands} categories={categories} />
    </Suspense>
  );
}
