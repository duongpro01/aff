export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  image: string;
  images: string[];
  category: string;
  brand: string;
  productLineId: string;
  description: string;
  fullDescription: string;
  features: string[];
  specs: {
    surface?: string;
    core?: string;
    thickness?: string;
    control?: number;
    power?: number;
    weight?: string;
    usapaApproved?: boolean;
  };
  params: {
    brand?: string;
    origin?: string;
    supplier?: string;
    material?: string;
    warranty?: string;
    shipping?: string;
  };
  inStock: boolean;
  rating: number;
  reviews: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
  content: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
  content: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  pubDate: string;
  author: string;
  status?: string;
}

export interface Listing {
  id: number;
  title: string;
  slug: string;
  price: number;
  originalPrice: number;
  condition: 'Mới 100%' | 'Mới 99%' | 'Mới 95%' | 'Đã qua sử dụng';
  description: string;
  images: string[];
  sellerName: string;
  phone: string;
  zalo?: string;
  province: string;
  district?: string;
  address?: string;
  status: 'pending' | 'approved' | 'sold' | 'rejected';
  manageCode: string;
  createdAt: string;
}

export interface Tournament {
  id: number;
  name: string;
  date: string;
  location: string;
  teams: string[];
  format: string;
  status: string;
}

export interface Redirect {
  id: number;
  from: string;
  to: string;
  statusCode: number;
}

export interface SeoSettings {
  ga4Id: string;
  searchConsole: string;
  noindex: boolean;
  customHeadCode: string;
}
