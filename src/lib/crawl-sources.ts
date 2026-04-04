// Crawl Sources Configuration

export type CrawlSource = {
  id: string;
  name: string;
  domain: string;
  color: string; // tailwind color name (indigo, pink, purple, etc.)
  apiEndpoint: string;

  // URL patterns
  isProductUrl: (url: string) => boolean;
  isBrandUrl?: (url: string) => boolean;

  // Suggested URLs
  suggestedCollections: { label: string; url: string }[];
  suggestedBrands?: { label: string; url: string }[];

  // Data type
  dataType: 'products' | 'dolls';

  // Item fields
  itemFields: {
    hasCode: boolean; // SKU/product code
    hasBrand: boolean;
    hasCategory: boolean;
  };
};

export const crawlSources: CrawlSource[] = [
  {
    id: 'wildsecrets',
    name: 'Wild Secrets',
    domain: 'wildsecrets.com.au',
    color: 'indigo',
    apiEndpoint: '/api/admin/crawl',
    dataType: 'products',

    isProductUrl: (url: string) => /wildsecrets\.com\.au\/p\/\d+\//.test(url),
    isBrandUrl: (url: string) => /wildsecrets\.com\.au\/brand\/[^/]+\/\d+/.test(url),

    itemFields: {
      hasCode: true,
      hasBrand: true,
      hasCategory: true,
    },

    suggestedCollections: [
      { label: 'Dildos & Strap Ons', url: 'https://www.wildsecrets.com.au/dongs-dildos-strapons' },
      { label: 'Vibrators', url: 'https://www.wildsecrets.com.au/vibrators' },
      { label: 'Anal Toys', url: 'https://www.wildsecrets.com.au/anal-toys' },
      { label: 'Bondage', url: 'https://www.wildsecrets.com.au/bondage' },
      { label: 'Lubes & Essentials', url: 'https://www.wildsecrets.com.au/lubes-essentials' },
      { label: 'Lingerie', url: 'https://www.wildsecrets.com.au/lingerie' },
      { label: 'His Toys', url: 'https://www.wildsecrets.com.au/his-toys' },
      { label: 'Her Toys', url: 'https://www.wildsecrets.com.au/her-toys' },
    ],

    suggestedBrands: [
      { label: 'PDX', url: 'https://www.wildsecrets.com.au/brand/pdx/6841' },
      { label: 'Doc Johnson', url: 'https://www.wildsecrets.com.au/brand/doc-johnson/2113' },
      { label: 'Adam and Eve', url: 'https://www.wildsecrets.com.au/brand/adam-and-eve/2244' },
      { label: 'Calexotics', url: 'https://www.wildsecrets.com.au/brand/calexotics/2110' },
      { label: 'Satisfyer', url: 'https://www.wildsecrets.com.au/brand/satisfyer/6388' },
      { label: 'Pipedream', url: 'https://www.wildsecrets.com.au/brand/pipedream/2232' },
      { label: 'Master Series', url: 'https://www.wildsecrets.com.au/brand/master-series/6203' },
      { label: 'Frisky', url: 'https://www.wildsecrets.com.au/brand/frisky/6336' },
    ],
  },

  {
    id: 'joylovedolls',
    name: 'JoyLoveDolls',
    domain: 'joylovedolls.com',
    color: 'pink',
    apiEndpoint: '/api/admin/crawl-dolls',
    dataType: 'dolls',

    isProductUrl: (url: string) => /joylovedolls\.com\/products\//.test(url),

    itemFields: {
      hasCode: false,
      hasBrand: true,
      hasCategory: false,
    },

    suggestedCollections: [
      { label: 'All Dolls', url: 'https://www.joylovedolls.com/collections/all-dolls' },
      { label: 'Best Sellers', url: 'https://www.joylovedolls.com/collections/best-sellers' },
      { label: 'New Arrivals', url: 'https://www.joylovedolls.com/collections/new-models' },
      { label: 'Sex Robots', url: 'https://www.joylovedolls.com/collections/sex-robots' },
      { label: 'Premium Dolls', url: 'https://www.joylovedolls.com/collections/premium-sex-dolls' },
      { label: 'Silicone Dolls', url: 'https://www.joylovedolls.com/collections/silicone-sex-dolls' },
      { label: 'TPE Dolls', url: 'https://www.joylovedolls.com/collections/tpe-sex-dolls' },
      { label: 'Torsos', url: 'https://www.joylovedolls.com/collections/sex-doll-torso' },
    ],

    suggestedBrands: [
      { label: 'WM Doll', url: 'https://www.joylovedolls.com/collections/wm-dolls' },
      { label: 'Irontech', url: 'https://www.joylovedolls.com/collections/irontech-doll' },
      { label: 'ZELEX', url: 'https://www.joylovedolls.com/collections/zelex-doll' },
      { label: 'Starpery', url: 'https://www.joylovedolls.com/collections/starpery' },
      { label: 'Real Lady', url: 'https://www.joylovedolls.com/collections/real-lady' },
      { label: 'Game Lady', url: 'https://www.joylovedolls.com/collections/game-lady' },
      { label: 'SEDOLL', url: 'https://www.joylovedolls.com/collections/sedoll' },
    ],
  },
];

export function getSourceById(id: string): CrawlSource | undefined {
  return crawlSources.find(s => s.id === id);
}

export function getSourceByDomain(domain: string): CrawlSource | undefined {
  return crawlSources.find(s => domain.includes(s.domain));
}

// Tailwind color utilities
export const sourceColors: Record<string, { bg: string; bgLight: string; text: string; border: string; hover: string }> = {
  indigo: {
    bg: 'bg-indigo-600',
    bgLight: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
    hover: 'hover:bg-indigo-700',
  },
  pink: {
    bg: 'bg-pink-600',
    bgLight: 'bg-pink-50',
    text: 'text-pink-600',
    border: 'border-pink-200',
    hover: 'hover:bg-pink-700',
  },
  purple: {
    bg: 'bg-purple-600',
    bgLight: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    hover: 'hover:bg-purple-700',
  },
  green: {
    bg: 'bg-green-600',
    bgLight: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
    hover: 'hover:bg-green-700',
  },
  blue: {
    bg: 'bg-blue-600',
    bgLight: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    hover: 'hover:bg-blue-700',
  },
};
