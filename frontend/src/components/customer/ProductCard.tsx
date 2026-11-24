import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
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
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden border border-brand-brown/10 hover:border-brand-brown/30 transition-colors">
      <Link to={`/product/${product.id}`} className="block aspect-[4/3] overflow-hidden bg-brand-ivory">
        <img
          src={product.image_url}
          alt={product.name}
          width={800}
          height={600}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </Link>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex-1">
          {product.category_name && (
            <p className="text-xs text-brand-brown/60 mb-1">{product.category_name}</p>
          )}
          <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold text-lg leading-snug hover:text-brand-red transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <p className="mt-2 text-sm text-brand-brown/70 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-lg font-bold text-brand-red">{formattedPrice}</span>
          <button
            onClick={() => addItem(product)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-brand-brown hover:bg-brand-red text-white text-sm font-semibold transition-colors"
            aria-label={`Thêm ${product.name} vào giỏ hàng`}
          >
            <Plus className="w-4 h-4" />
            <span>Thêm vào giỏ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
