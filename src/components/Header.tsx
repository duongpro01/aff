'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface HeaderProps {
  cartCount?: number;
}

const brands = [
  { name: 'Satisfyer', href: '/satisfyer' },
  { name: 'We-Vibe', href: '/we-vibe' },
  { name: 'Womanizer', href: '/womanizer' },
  { name: 'Lelo', href: '/lelo' },
  { name: 'Lovense', href: '/lovense' },
  { name: 'Le Wand', href: '/le-wand' },
  { name: 'Pipedream', href: '/pipedream' },
  { name: 'Calexotics', href: '/calexotics' },
  { name: 'Fun Factory', href: '/fun-factory' },
  { name: 'Magic Wand', href: '/magic-wand' },
];

const tools = [
  { name: 'Bảng xếp hạng', href: '/ranking' },
  { name: 'Tính điểm', href: '/ranking-calculator' },
  { name: 'Bảng tỷ số', href: '/scoreboard' },
  { name: 'Giải đấu', href: '/tournaments' },
  { name: 'Bốc thăm', href: '/boc-tham-pickleball' },
  { name: 'Bracket', href: '/bracket-builder' },
  { name: 'So sánh', href: '/so-sanh' },
];

const dummyProducts = [
  'Satisfyer Pro 2 Generation 3',
  'We-Vibe Sync Couples Vibrator',
  'Womanizer Premium 2',
  'Lelo Sona 2 Cruise',
  'Lovense Lush 3',
  'Le Wand Petite Rechargeable',
  'Pipedream King Cock Elite',
  'Fun Factory Stronic G',
];

export default function Header({ cartCount: cartCountProp }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileBrandsOpen, setMobileBrandsOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const brandsRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Cart count with fallback
  let cartCount = cartCountProp ?? 0;
  try {
    const { getCartCount } = useCart();
    cartCount = getCartCount();
  } catch {}

  // Sticky header shadow on scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (brandsRef.current && !brandsRef.current.contains(e.target as Node)) {
        setBrandsOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change (resize as proxy)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredProducts = searchQuery.trim()
    ? dummyProducts.filter((p) =>
        p.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-300 ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ color: '#262260' }}
            >
              YeuPick
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:items-center lg:gap-1">
            <Link
              href="/products"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Sản phẩm
            </Link>

            {/* Brands Dropdown */}
            <div className="relative" ref={brandsRef}>
              <button
                onClick={() => {
                  setBrandsOpen(!brandsOpen);
                  setToolsOpen(false);
                }}
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                Thương hiệu
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    brandsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {brandsOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  {brands.map((brand) => (
                    <Link
                      key={brand.href}
                      href={brand.href}
                      onClick={() => setBrandsOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/tin-tuc"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Tin tức
            </Link>

            <Link
              href="/thanh-ly"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Thanh lý
            </Link>

            {/* Tools Dropdown */}
            <div className="relative" ref={toolsRef}>
              <button
                onClick={() => {
                  setToolsOpen(!toolsOpen);
                  setBrandsOpen(false);
                }}
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                Công cụ
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    toolsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {toolsOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  {tools.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setToolsOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right side: Search, Cart, Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="rounded-full p-2.5 sm:p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                aria-label="Tìm kiếm"
              >
                <Search className="h-5 w-5" />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-[320px] rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-[#262260] focus:outline-none focus:ring-1 focus:ring-[#262260]"
                      autoFocus
                    />
                  </div>
                  {searchQuery.trim() && (
                    <div className="mt-2 max-h-60 overflow-y-auto">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product, idx) => (
                          <div
                            key={idx}
                            className="cursor-pointer rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            {product}
                          </div>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-sm text-gray-500">
                          Không tìm thấy sản phẩm nào
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative rounded-full p-2.5 sm:p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span
                  className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: '#262260' }}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full p-2.5 sm:p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors lg:hidden"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white lg:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
            >
              Sản phẩm
            </Link>

            {/* Mobile Brands */}
            <div>
              <button
                onClick={() => setMobileBrandsOpen(!mobileBrandsOpen)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                Thương hiệu
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    mobileBrandsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {mobileBrandsOpen && (
                <div className="ml-4 space-y-1">
                  {brands.map((brand) => (
                    <Link
                      key={brand.href}
                      href={brand.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/tin-tuc"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
            >
              Tin tức
            </Link>

            <Link
              href="/thanh-ly"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
            >
              Thanh lý
            </Link>

            {/* Mobile Tools */}
            <div>
              <button
                onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                Công cụ
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    mobileToolsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {mobileToolsOpen && (
                <div className="ml-4 space-y-1">
                  {tools.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
