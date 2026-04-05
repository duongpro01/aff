import { Metadata } from 'next';
import { Suspense } from 'react';
import DollsClient from './DollsClient';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'VietToy';

export const metadata: Metadata = {
  title: `Premium Sex Dolls | ${siteName}`,
  description: `Browse our collection of premium, realistic sex dolls from top brands like WM Doll, Irontech, ZELEX, Starpery, and more. TPE and Silicone dolls available at ${siteName}.`,
  openGraph: {
    title: `Premium Sex Dolls | ${siteName}`,
    description: 'Browse our collection of premium, realistic sex dolls from top brands.',
    type: 'website',
  },
};

function getData() {
  const dir = path.join(process.cwd(), 'src/data');
  const dolls = JSON.parse(fs.readFileSync(path.join(dir, 'dolls.json'), 'utf-8'));
  const brands = JSON.parse(fs.readFileSync(path.join(dir, 'doll-brands.json'), 'utf-8'));
  const categories = JSON.parse(fs.readFileSync(path.join(dir, 'doll-categories.json'), 'utf-8'));
  return { dolls, brands, categories };
}

export default function SexDollsPage() {
  const { dolls, brands, categories } = getData();
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <DollsClient dolls={dolls} brands={brands} categories={categories} />
    </Suspense>
  );
}
