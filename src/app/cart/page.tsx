'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useState } from 'react';

function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getCartTotal, getShippingFee } = useCart();
  const [couponCode, setCouponCode] = useState('');

  const subtotal = getCartTotal();
  const shippingFee = getShippingFee();
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Gio hang trong</h1>
        <p className="text-gray-500 mb-8">Ban chua co san pham nao trong gio hang.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Tiep tuc mua sam
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Gio hang cua ban</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-sm font-medium text-gray-500 border-b border-gray-200">
              <div className="col-span-5">San pham</div>
              <div className="col-span-2 text-center">Don gia</div>
              <div className="col-span-2 text-center">So luong</div>
              <div className="col-span-2 text-center">Thanh tien</div>
              <div className="col-span-1"></div>
            </div>

            {/* Items */}
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-6 py-4 border-b border-gray-100 last:border-b-0 items-center"
              >
                {/* Product info */}
                <div className="md:col-span-5 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    {item.image && item.image !== '/images/products/placeholder.jpg' ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-center text-gray-600 font-medium px-1 leading-tight">
                        {item.name.slice(0, 30)}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-sm font-medium text-gray-800 hover:text-accent transition-colors line-clamp-2"
                  >
                    {item.name}
                  </Link>
                </div>

                {/* Unit price */}
                <div className="md:col-span-2 text-center">
                  <span className="md:hidden text-sm text-gray-500 mr-2">Don gia:</span>
                  <span className="text-sm text-gray-700">{formatPrice(item.price)}</span>
                </div>

                {/* Quantity controls */}
                <div className="md:col-span-2 flex items-center justify-center">
                  <span className="md:hidden text-sm text-gray-500 mr-2">So luong:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                      aria-label="Giam so luong"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 h-8 flex items-center justify-center text-sm font-medium border-x border-gray-300">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                      aria-label="Tang so luong"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="md:col-span-2 text-center">
                  <span className="md:hidden text-sm text-gray-500 mr-2">Thanh tien:</span>
                  <span className="text-sm font-semibold text-accent">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>

                {/* Remove */}
                <div className="md:col-span-1 flex justify-end md:justify-center">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-error hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Xoa san pham"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Tiep tuc mua sam
            </Link>
          </div>
        </div>

        {/* Order summary sidebar */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Tom tat don hang</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tam tinh</span>
                <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phi van chuyen</span>
                <span className="font-medium text-gray-900">
                  {shippingFee === 0 ? (
                    <span className="text-success">Mien phi</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              {subtotal < 500000 && (
                <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded-lg">
                  Mua them {formatPrice(500000 - subtotal)} de duoc <span className="font-semibold text-success">mien phi van chuyen</span>
                </p>
              )}
            </div>

            {/* Coupon input */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Ma giam gia</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Nhap ma giam gia"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                </div>
                <button className="px-4 py-2.5 bg-primary hover:bg-primary-light text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
                  Ap dung
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-base font-bold text-gray-900">Tong cong</span>
                <span className="text-xl font-bold text-accent">{formatPrice(total)}</span>
              </div>
            </div>

            <button className="w-full bg-accent hover:bg-accent-light text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-lg shadow-accent/20">
              Dat hang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
