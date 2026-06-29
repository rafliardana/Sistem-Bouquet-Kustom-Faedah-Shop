import { useState } from "react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { ArrowRight, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Dapatkan daftar kategori unik
  const categories = ["Semua", ...Array.from(new Set(products.map((p) => p.category)))];

  // Filter produk berdasarkan kategori dan pencarian
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "Semua" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Animasi variants — stagger dipercepat agar tidak terasa lambat
  const gridVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 20 },
    },
  };

  return (
    <div className="min-h-screen bg-brand-tertiary font-sans">
      {/* Hero */}
      <section className="bg-brand-tertiary p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="bg-surface-bg rounded-corner-lg p-6 text-center shadow-sm"
          >
            <Badge label="Boutique Bunga Premium" variant="brand" />
            <h1 className="text-title text-text-primary mt-3 mb-1">
              Rangkaian Bunga Spesial untuk Momen Istimewa
            </h1>
            <p className="text-label-sm text-text-secondary mx-auto mb-4" style={{ maxWidth: '28rem' }}>
              Pilih desain favoritmu, sesuaikan ukuran &amp; tambahan, lalu kami rangkai dengan penuh cinta.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: '🎨', label: 'Kustomisasi Bebas' },
                { icon: '💐', label: 'Bunga Segar' },
                { icon: '🚀', label: 'Pengiriman Cepat' },
                { icon: '⭐', label: 'Kualitas Premium' },
              ].map((item, idx) => (
                <motion.div 
                  key={item.label} 
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 + idx * 0.05, type: "spring", stiffness: 250, damping: 22 }}
                  className="flex items-center gap-1 bg-bg-faint px-2 py-1 rounded-corner-sm"
                >
                  <span>{item.icon}</span>
                  <span className="text-label-sm text-text-secondary">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-6xl mx-auto px-6 mb-4">
        <div className="bg-surface-bg rounded-corner-lg p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-label-sm rounded-corner-md transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-brand-primary text-on-brand shadow-sm font-semibold"
                      : "bg-bg-faint text-text-secondary hover:bg-bg-hover"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Cari bouquet favoritmu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-input-bg border border-border-primary rounded-corner-md pl-9 pr-4 py-1.5 text-input text-text-primary focus:outline-none focus:border-border-selected focus:ring-1 focus:ring-brand-primary/20 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="mb-4">
          <h2 className="text-heading text-text-primary">Katalog Produk</h2>
          <p className="text-label-sm text-text-secondary mt-1">
            {filteredProducts.length} produk ditemukan {selectedCategory !== "Semua" && `di kategori "${selectedCategory}"`}
          </p>
        </div>

        <motion.div 
          variants={gridVariants}
          initial="hidden"
          animate="show"
          key={selectedCategory + searchQuery}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: idx * 0.04 }}
                whileHover={{ y: -6, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                onClick={() => onSelect(product)}
                className="bg-surface-bg rounded-corner-lg border border-border-primary cursor-pointer transition-colors overflow-hidden group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
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
                      <h3 className="text-label font-semibold text-text-primary group-hover:text-brand-primary transition-colors">{product.name}</h3>
                      <p
                        className="text-label-sm text-text-secondary mt-1"
                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                      >
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap mt-1">
                      {product.sizes.map((s) => (
                        <span
                          key={s.id}
                          className="bg-bg-faint text-text-tertiary rounded-corner-sm px-1.5 py-0.5"
                          style={{ fontSize: '11px', lineHeight: 'normal' }}
                        >
                          {s.id}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-border-secondary/40 mt-2 flex items-center justify-between">
                  <div className="pt-2">
                    <p className="text-video-title text-text-tertiary">Mulai dari</p>
                    <p className="text-label font-semibold text-brand-primary">
                      Rp {product.basePrice.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button variant="primary" size="small" iconEnd={<ArrowRight size={14} />}>
                      Pesan
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProducts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-bg rounded-corner-lg p-12 text-center shadow-sm"
          >
            <p style={{ fontSize: '48px' }}>🥀</p>
            <h3 className="text-heading text-text-primary mt-3">Produk Tidak Ditemukan</h3>
            <p className="text-label-sm text-text-secondary mt-1">
              Coba gunakan kata kunci pencarian lain atau pilih kategori yang berbeda.
            </p>
          </motion.div>
        )}
      </section>

      <footer className="bg-surface-bg border-t border-border-primary py-6 px-6 text-center">
        <p className="text-video-title text-text-tertiary">
          🌸 Faedah Shop — Rangkaian bunga premium dengan cinta © 2026
        </p>
      </footer>
    </div>
  );
}

