'use client';

import Link from 'next/link';
import { Package, FileText, ShoppingBag, Award, Plus, CheckCircle } from 'lucide-react';
import productsData from '@/data/products.json';
import postsData from '@/data/posts.json';
import listingsData from '@/data/listings.json';
import brandsData from '@/data/brands.json';

export default function AdminDashboard() {
  const pendingListings = (listingsData as any[]).filter((l) => l.status === 'pending').length;

  const stats = [
    { label: 'Sản phẩm', value: productsData.length, icon: Package, color: 'bg-blue-500', href: '/admin/products' },
    { label: 'Bài viết', value: postsData.length, icon: FileText, color: 'bg-green-500', href: '/admin/posts' },
    { label: 'Tin thanh lý chờ duyệt', value: pendingListings, icon: ShoppingBag, color: 'bg-orange-500', href: '/admin/listings' },
    { label: 'Thương hiệu', value: brandsData.length, icon: Award, color: 'bg-purple-500', href: '/admin/brands' },
  ];

  const quickActions = [
    { label: 'Thêm sản phẩm', href: '/admin/products', icon: Plus },
    { label: 'Thêm bài viết', href: '/admin/posts', icon: Plus },
    { label: 'Duyệt tin', href: '/admin/listings', icon: CheckCircle },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Thao tác nhanh</h3>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#262260] text-white rounded-lg text-sm font-medium hover:bg-[#1e1b4b] transition-colors"
              >
                <Icon size={16} />
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Hoạt động gần đây</h3>
        <div className="space-y-3">
          {[
            { text: 'Tin thanh lý mới chờ duyệt', time: '5 phút trước' },
            { text: 'Đã cập nhật sản phẩm "Vợt Joola Ben Johns Perseus"', time: '1 giờ trước' },
            { text: 'Bài viết mới đã được xuất bản', time: '3 giờ trước' },
            { text: 'Đã duyệt 2 tin thanh lý', time: 'Hôm qua' },
          ].map((activity, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-700">{activity.text}</span>
              <span className="text-xs text-gray-400 shrink-0 ml-4">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
