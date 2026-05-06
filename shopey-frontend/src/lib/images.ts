const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const BACKEND_ROOT = API_URL.replace(/\/api\/?$/, "");

export function resolveImageUrl(image?: string | null) {
  if (!image) return "/placeholder-product.svg";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  if (image.startsWith("/")) return `${BACKEND_ROOT}${image}`;
  return image;
}
