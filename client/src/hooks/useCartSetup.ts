import { createCart } from "@/data/api/cart";

const useCartSetup = async () => {
  const cartId = localStorage.getItem("cartId");

  if (cartId === null) {
    const res = await createCart();
    localStorage.setItem("cartId", res.data.id);
  }
};

export default useCartSetup;
