import { createCart } from "@/data/api/cart";
import { createFavorites } from "@/data/api/favorites";

const useCartSetup = async () => {
  const cartId = localStorage.getItem("cartId");
  const favoritesId = localStorage.getItem("favoritesId");

  if (cartId === null) {
    const res = await createCart();
    localStorage.setItem("cartId", res.data.id);
  }

  if (favoritesId == null) {
    const res = await createFavorites();
    localStorage.setItem("favoritesId", res.data);
  }
};

export default useCartSetup;
