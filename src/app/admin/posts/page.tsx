'use client';

import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
const postsData: any[] = [];

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  pubDate: string;
  author: string;
  status: string;
};

const emptyPost: Post = {
  id: 0,
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: '',
  image: '/images/posts/placeholder.jpg',
  pubDate: new Date().toISOString().slice(0, 10),
  author: 'YeuPick',
  status: 'draft',
};

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>(postsData as Post[]);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const perPage = 10;

  const filtered = useMemo(() => {
    if (!filterStatus) return posts;
    return posts.filter((p) => p.status === filterStatus);
  }, [posts, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const openAdd = () => {
    setEditPost({ ...emptyPost, id: Math.max(0, ...posts.map((p) => p.id)) + 1 });
    setShowModal(true);
  };

  const openEdit = (p: Post) => {
    setEditPost({ ...p });
    setShowModal(true);
  };

  const savePost = () => {
    if (!editPost) return;
    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === editPost.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = editPost;
        return next;
      }
      return [...prev, editPost];
    });
    setShowModal(false);
    setEditPost(null);
  };

  const deletePost = (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý bài viết</h2>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-[#262260] text-white rounded-lg text-sm font-medium hover:bg-[#1e1b4b] self-start">
          <Plus size={16} /> Thêm bài viết
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Nháp</option>
        </select>
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} bài viết</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Ảnh</th>
              <th className="p-3 text-left">Tiêu đề</th>
              <th className="p-3 text-left">Danh mục</th>
              <th className="p-3 text-left">Trạng thái</th>
              <th className="p-3 text-left">Ngày đăng</th>
              <th className="p-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 text-gray-500">{p.id}</td>
                <td className="p-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon size={18} className="text-gray-400" />
                  </div>
                </td>
                <td className="p-3 font-medium text-gray-800 max-w-[250px] truncate">{p.title}</td>
                <td className="p-3 text-gray-600">{p.category}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                  </span>
                </td>
                <td className="p-3 text-gray-500 whitespace-nowrap">{p.pubDate}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Sửa">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => deletePost(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">Không có bài viết nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40">
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button key={n} onClick={() => setPage(n)} className={`w-9 h-9 rounded-lg text-sm font-medium ${n === page ? 'bg-[#262260] text-white' : 'hover:bg-gray-200 text-gray-700'}`}>
              {n}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40">
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && editPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold">{posts.find((p) => p.id === editPost.id) ? 'Sửa bài viết' : 'Thêm bài viết'}</h3>
              <button onClick={() => { setShowModal(false); setEditPost(null); }} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                <input type="text" value={editPost.title} onChange={(e) => setEditPost({ ...editPost, title: e.target.value, slug: slugify(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input type="text" value={editPost.slug} onChange={(e) => setEditPost({ ...editPost, slug: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tóm tắt</label>
                <textarea rows={2} value={editPost.excerpt} onChange={(e) => setEditPost({ ...editPost, excerpt: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <input type="text" value={editPost.category} onChange={(e) => setEditPost({ ...editPost, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="VD: Hướng dẫn, Review" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
                  <input type="text" value={editPost.author} onChange={(e) => setEditPost({ ...editPost, author: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <ImageIcon size={28} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click để tải ảnh lên</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung <span className="text-xs text-gray-400">(SunEditor sẽ được tích hợp sau)</span></label>
                <textarea rows={10} value={editPost.content} onChange={(e) => setEditPost({ ...editPost, content: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" placeholder="Nội dung bài viết..." />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                <button onClick={() => setEditPost({ ...editPost, status: editPost.status === 'published' ? 'draft' : 'published' })} className={`relative w-11 h-6 rounded-full transition-colors ${editPost.status === 'published' ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${editPost.status === 'published' ? 'translate-x-5' : ''}`} />
                </button>
                <span className="text-sm text-gray-500">{editPost.status === 'published' ? 'Đã xuất bản' : 'Nháp'}</span>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button onClick={savePost} className="flex-1 py-2.5 bg-[#262260] text-white rounded-lg text-sm font-medium hover:bg-[#1e1b4b]">Lưu</button>
                <button onClick={() => { setShowModal(false); setEditPost(null); }} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
