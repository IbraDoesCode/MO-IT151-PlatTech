export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export const getProducts = async () => {
  const res = await fetch("https://fakestoreapi.com/products");

  const data: Product[] = await res.json();

  return data;
};

export const getProduct = async (id: string) => {
  const res = await fetch(`https://fakestoreapi.com/products/${id}`);

  const data: Product = await res.json();

  return data;
};

export const getCategories = async () => {
  const res = await fetch("https://fakestoreapi.com/products/categories");

  const data: string[] = await res.json();

  return data;
};
