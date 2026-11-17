import React, { useState, useEffect } from 'react';
import { Search, Flame, Filter } from 'lucide-react';
import { api } from '../services/api.js';
import { Product, Category } from '../types/index.js';
import { ProductCard } from '../components/customer/ProductCard.js';

export const MenuPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getProducts(),
    ]).then(([cats, prods]) => {
      setCategories(cats);
      setProducts(prods);
    }).catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === null || p.category_id === selectedCategory;
    const matchSearch = searchTerm.trim() === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-brand-red uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Flame className="w-4 h-4 fill-brand-red" />
          <span>Thực Đơn BÁNH MÌ 0</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-brand-brown font-sans">
          Bánh Mì Nóng Giòn Chuẩn Vị Việt
        </h1>
        <p className="text-sm text-brand-brown/70">
          Tất cả các ổ bánh mì đều được nướng nóng giòn theo yêu cầu và đóng gói trong bao bì giấy kraft cao cấp.
        </p>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-brand-brown text-white shadow-sm'
                : 'bg-white text-brand-brown border border-brand-brown/15 hover:bg-brand-cream'
            }`}
          >
            Tất Cả Món ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-brand-brown text-white shadow-sm'
                  : 'bg-white text-brand-brown border border-brand-brown/15 hover:bg-brand-cream'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm bánh mì, xá xíu, pate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full border border-brand-brown/20 text-xs font-medium text-brand-brown placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition-all"
          />
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-3xl h-80 animate-pulse border border-brand-brown/10 p-4"></div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-brand-brown/10 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-ivory mx-auto flex items-center justify-center text-brand-brown-light">
            <Filter className="w-8 h-8 opacity-40" />
          </div>
          <h3 className="font-bold text-lg text-brand-brown">Không tìm thấy món phù hợp</h3>
          <p className="text-xs text-gray-500">
            Hãy thử tìm kiếm với từ khóa khác hoặc bấm xem tất cả các món trong thực đơn.
          </p>
          <button
            onClick={() => { setSelectedCategory(null); setSearchTerm(''); }}
            className="px-6 py-2 rounded-full bg-brand-brown text-white text-xs font-bold"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};
