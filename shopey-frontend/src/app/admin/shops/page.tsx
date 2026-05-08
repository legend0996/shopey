"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { productService } from "@/services/productService";
import Image from "next/image";
import { resolveImageUrl } from "@/lib/images";

interface GalleryImage {
  url: string;
  is_thumbnail?: boolean;
}

export default function AdminShopsPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [userId, setUserId] = useState("");
  const [productId, setProductId] = useState("");
  const [galleryProductId, setGalleryProductId] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const create = useMutation({
    mutationFn: () => adminService.createShop({ name, phone, location }),
    onSuccess: () => {
      toast.success("Shop created successfully");
      setName(""); setPhone(""); setLocation("");
    },
    onError: () => toast.error("Failed to create shop"),
  });

  const featureUser = useMutation({
    mutationFn: () => adminService.featureUser({ user_id: userId }),
    onSuccess: () => {
      toast.success("User featured successfully");
      setUserId("");
    },
    onError: () => toast.error("Failed to feature user"),
  });

  const featureProduct = useMutation({
    mutationFn: () => adminService.featureProduct({ product_id: productId }),
    onSuccess: () => {
      toast.success("Product featured successfully");
      setProductId("");
    },
    onError: () => toast.error("Failed to feature product"),
  });

  const loadGallery = useMutation({
    mutationFn: () => productService.getById(galleryProductId),
    onSuccess: (res) => {
      const product = res.data?.product;
      const incoming = Array.isArray(product?.gallery)
        ? product.gallery.map((item: { url?: string; image_url?: string; is_thumbnail?: boolean }) => ({
            url: item.url || item.image_url,
            is_thumbnail: Boolean(item.is_thumbnail),
          }))
        : [];

      if (incoming.length === 0 && product?.image) {
        incoming.push({ url: product.image, is_thumbnail: true });
      }

      setGallery(incoming);
      toast.success("Gallery loaded");
    },
    onError: () => toast.error("Failed to load product gallery"),
  });

  const saveGallery = useMutation({
    mutationFn: () => productService.replaceGallery(galleryProductId, gallery),
    onSuccess: () => toast.success("Gallery updated"),
    onError: () => toast.error("Failed to update gallery"),
  });

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setGallery((prev) => [
      ...prev,
      { url: newImageUrl.trim(), is_thumbnail: prev.length === 0 },
    ]);
    setNewImageUrl("");
  };

  const addBulkImages = () => {
    const urls = bulkUrls
      .split(/[\n,]/)
      .map((url) => url.trim())
      .filter(Boolean);

    if (urls.length === 0) return;

    setGallery((prev) => {
      const next = [
        ...prev,
        ...urls.map((url) => ({ url, is_thumbnail: false })),
      ];

      if (!next.some((image) => image.is_thumbnail) && next.length > 0) {
        next[0].is_thumbnail = true;
      }

      return next;
    });

    setBulkUrls("");
  };

  const removeImage = (index: number) => {
    setGallery((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((img) => img.is_thumbnail)) {
        next[0].is_thumbnail = true;
      }
      return next;
    });
  };

  const setThumbnail = (index: number) => {
    setGallery((prev) => prev.map((image, i) => ({ ...image, is_thumbnail: i === index })));
  };

  const reorderGallery = (from: number, to: number) => {
    if (from === to) return;
    setGallery((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Manage Shops</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-slate-700">Add New Shop</h2>
        <Input label="Shop Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Shopey Nairobi" />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254..." />
        <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Westlands, Nairobi" />
        <Button fullWidth loading={create.isPending} onClick={() => create.mutate()}>Create Shop</Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-slate-700">Feature User</h2>
        <Input label="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="user_123" />
        <Button fullWidth variant="secondary" loading={featureUser.isPending} onClick={() => featureUser.mutate()}>
          Feature User
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-slate-700">Feature Product</h2>
        <Input label="Product ID" value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="prod_123" />
        <Button fullWidth variant="secondary" loading={featureProduct.isPending} onClick={() => featureProduct.mutate()}>
          Feature Product
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-slate-700">Product Gallery Manager</h2>
        <div className="flex gap-2">
          <Input
            label="Product ID"
            value={galleryProductId}
            onChange={(e) => setGalleryProductId(e.target.value)}
            placeholder="123"
          />
          <div className="pt-7">
            <Button variant="secondary" loading={loadGallery.isPending} onClick={() => loadGallery.mutate()}>
              Load
            </Button>
          </div>
        </div>

        <div className="flex gap-2 items-end">
          <Input
            label="Image URL"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="https://..."
          />
          <Button variant="secondary" onClick={addImage}>Add Image</Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Bulk URLs (comma or new line separated)</label>
          <textarea
            value={bulkUrls}
            onChange={(e) => setBulkUrls(e.target.value)}
            className="w-full min-h-24 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
            placeholder="https://img-1.jpg\nhttps://img-2.jpg"
          />
          <Button variant="secondary" onClick={addBulkImages}>Add Multiple</Button>
        </div>

        {gallery.length > 0 ? (
          <div className="space-y-3">
            {gallery.map((image, index) => (
              <div
                key={`${image.url}-${index}`}
                className="flex items-center gap-3 rounded-xl border border-gray-100 p-3"
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) reorderGallery(dragIndex, index);
                  setDragIndex(null);
                }}
              >
                <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                  <Image src={resolveImageUrl(image.url)} alt={`Gallery image ${index + 1}`} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 truncate">{image.url}</p>
                  <label className="text-xs text-slate-700 inline-flex items-center gap-2 mt-1">
                    <input type="radio" checked={Boolean(image.is_thumbnail)} onChange={() => setThumbnail(index)} />
                    Thumbnail
                  </label>
                </div>
                <button className="text-xs text-red-500" onClick={() => removeImage(index)}>Remove</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No gallery images yet.</p>
        )}

        <Button fullWidth loading={saveGallery.isPending} onClick={() => saveGallery.mutate()} disabled={!galleryProductId || gallery.length === 0}>
          Save Gallery
        </Button>
      </div>
    </div>
  );
}
