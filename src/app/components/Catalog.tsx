import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { ArrowRight } from "lucide-react";
import type { Product } from "./types";

const CATEGORY_VARIANTS: Record<string, "default" | "success" | "warning" | "danger" | "brand" | "secondary"> = {
  Mawar: "brand",
  "Bunga Matahari": "warning",
  Tulip: "brand",
  "Bunga Kering": "secondary",
  Campur: "success",
};

interface CatalogProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export function Catalog({ products, onSelect }: CatalogProps) {
  return (
    <div className="min-h-screen bg-brand-tertiary font-sans">
      {/* Hero */}
      <section className="bg-brand-tertiary p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-surface-bg rounded-corner-lg p-6 text-center">
            <Badge label="Boutique Bunga Premium" variant="brand" />
            <h1 className="text-title text-text-primary mt-3 mb-1">
              Rangkaian Bunga Spesial untuk Momen Istimewa
            </h1>
            <p className="text-label-sm text-text-secondary mx-auto mb-4" style={{ maxWidth: '28rem' }}>
              Pilih desain favoritmu, sesuaikan ukuran &amp; tambahan, lalu kami rangkai dengan penuh cinta.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: '🎨', label: 'Kostumasi Bebas' },
                { icon: '💐', label: 'Bunga Segar' },
                { icon: '🚀', label: 'Pengiriman Cepat' },
                { icon: '⭐', label: 'Kualitas Premium' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1">
                  <span>{item.icon}</span>
                  <span className="text-label-sm text-text-secondary">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-6xl mx-auto px-6 pb-6">
        <div className="mb-4">
          <h2 className="text-heading text-text-primary">Katalog Produk</h2>
          <p className="text-label-sm text-text-secondary mt-1">
            {products.length} produk tersedia — pilih &amp; kostumasi sesuai keinginan
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelect(product)}
              className="bg-surface-bg rounded-corner-lg border border-border-primary hover:bg-surface-hover cursor-pointer transition-colors overflow-hidden group"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2">
                  <Badge
                    label={product.category}
                    variant={CATEGORY_VARIANTS[product.category] ?? "default"}
                  />
                </div>
              </div>

              <div className="p-4 flex flex-col gap-2">
                <div>
                  <h3 className="text-label font-semibold text-text-primary">{product.name}</h3>
                  <p
                    className="text-label-sm text-text-secondary mt-1"
                    style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {product.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  {product.sizes.map((s) => (
                    <span
                      key={s.id}
                      className="bg-bg-faint text-text-tertiary rounded-corner-sm px-1"
                      style={{ fontSize: '11px', lineHeight: '20px' }}
                    >
                      {s.id}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-video-title text-text-tertiary">Mulai dari</p>
                    <p className="text-label font-semibold text-brand-primary">
                      Rp {product.basePrice.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <Button variant="primary" size="small" iconEnd={<ArrowRight size={14} />}>
                    Pesan
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-surface-bg border-t border-border-primary py-4 px-6 text-center">
        <p className="text-video-title text-text-tertiary">
          🌸 Faedah Shop — Rangkaian bunga premium dengan cinta © 2026
        </p>
      </footer>
    </div>
  );
}
