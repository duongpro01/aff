import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'src', 'data');

function readJson(file: string) {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function getProducts() { return readJson('products.json'); }
export function getBrands() { return readJson('brands.json'); }
export function getCategories() { return readJson('categories.json'); }
export function getPosts() { return readJson('posts.json'); }
export function getListings() { return readJson('listings.json'); }
