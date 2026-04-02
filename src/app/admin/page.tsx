'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, FileText, ShoppingBag, Award, Plus, CheckCircle, Globe } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, posts: 0, listings: 0, brands: 0 });

  useEffect(() => {
    fetch('/api/admin/products').then(r => r.json()).then(d => setStats(s => ({ ...s, products: Array.isArray(d) ? d.length : 0 }))).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Products', value: stats.products, icon: Package, color: 'bg-blue-500', href: '/admin/products' },
    { label: 'Posts', value: stats.posts, icon: FileText, color: 'bg-green-500', href: '/admin/posts' },
    { label: 'Listings', value: stats.listings, icon: ShoppingBag, color: 'bg-orange-500', href: '/admin/listings' },
    { label: 'Brands', value: stats.brands, icon: Award, color: 'bg-purple-500', href: '/admin/brands' },
  ];

  const quickActions = [
    { label: 'Crawl & Import', href: '/admin/crawl', icon: Globe },
    { label: 'Add Product', href: '/admin/products', icon: Plus },
    { label: 'Add Post', href: '/admin/posts', icon: Plus },
    { label: 'Review Listings', href: '/admin/listings', icon: CheckCircle },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                  <Icon size={20} className="text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <Icon size={18} className="text-[#262260]" />
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
