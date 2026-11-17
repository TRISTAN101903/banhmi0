import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Flame } from 'lucide-react';
import { Product } from '../../types/index.js';
import { useCart } from '../../context/CartContext.js';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(product.price);

  return (
    <div className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-brand-brown/10 shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="relative aspect-[4/3] overflow-hidden bg-brand-ivory block">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
          loading="lazy"
        />

        {/* Feature Badge */}
        {product.is_featured === 1 && (
          <div className="absolute top-3 left-3 bg-brand-red text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Flame className="w-3 h-3 fill-white" />
            <span>Món Nổi Bật</span>
          </div>
        )}

        {/* Category Pill */}
        {product.category_name && (
          <div className="absolute bottom-3 left-3 bg-brand-brown/85 backdrop-blur-sm text-brand-cream text-[10px] font-semibold px-2.5 py-1 rounded-lg">
            {product.category_name}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex-1">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-bold text-lg text-brand-brown group-hover:text-brand-red transition-colors line-clamp-1 mb-1.5 font-sans">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-brand-brown/70 line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-3 border-t border-brand-brown/10">
          <div>
            <span className="text-xs text-gray-400 block font-medium">Giá bán</span>
            <span className="text-xl font-black text-brand-red font-sans">
              {formattedPrice}
            </span>
          </div>

          <button
            onClick={() => addItem(product)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-brand-brown hover:bg-brand-red text-white text-xs font-bold transition-all shadow-sm active:scale-95"
            aria-label={`Thêm ${product.name} vào giỏ hàng`}
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Món</span>
          </button>
        </div>
      </div>
    </div>
  );
};
