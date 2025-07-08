export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  rating: number;
  quantity: number;
  image_url: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  product: string;
  name: string;
  email: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PriceRange {
  minPrice: number;
  maxPrice: number;
}
