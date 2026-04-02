import { Metadata } from 'next';
import { Suspense } from 'react';
import ProductsClient from './ProductsClient';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our full range of premium adult toys and accessories',
};

function getData() {
  const dir = path.join(process.cwd(), 'src/data');
  const products = JSON.parse(fs.readFileSync(path.join(dir, 'products.json'), 'utf-8'));
  const brands = JSON.parse(fs.readFileSync(path.join(dir, 'brands.json'), 'utf-8'));
  const categories = JSON.parse(fs.readFileSync(path.join(dir, 'categories.json'), 'utf-8'));
  return { products, brands, categories };
}

export default function ProductsPage() {
  const { products, brands, categories } = getData();
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ProductsClient products={products} brands={brands} categories={categories} />
    </Suspense>
  );
}
