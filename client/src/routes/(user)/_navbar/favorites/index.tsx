import ProductCard from "@/components/product-card";
import {
  Container,
  Group,
  Image,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import EmptyFavorites from "@/assets/empty-favorites.png";
import {
  useFavoritesMutation,
  useFavoritesQuery,
} from "@/data/query/favoritesQuery";
import { IconSearch } from "@tabler/icons-react";
import { useInputState } from "@mantine/hooks";
import { useCartMutation } from "@/data/query/cartQuery";
import { notifications } from "@mantine/notifications";

export const Route = createFileRoute("/(user)/_navbar/favorites/")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const [searchValue, setSearchValue] = useInputState("");

  return (
    <Container size="xl" className="pt-10 w-full flex-1">
      <Group className="mb-8" justify="space-between">
        <Stack gap={0}>
          <Title order={2}>Favorites</Title>
          <Text opacity={0.6}>Your handpicked items, ready when you are.</Text>
        </Stack>

        <TextInput
          radius="lg"
          placeholder="Search favorites..."
          rightSection={<IconSearch size={20} />}
          rightSectionPointerEvents="none"
          value={searchValue}
          onChange={setSearchValue}
        />
      </Group>
      <Group align="start" gap="xl">
        <FavoritesGallery searchValue={searchValue} />
      </Group>
    </Container>
  );
}

interface FavoritesGalleryProps {
  searchValue: string;
}

function FavoritesGallery(props: FavoritesGalleryProps) {
  const favoritesId = localStorage.getItem("favoritesId") || "";
  const cartId = localStorage.getItem("cartId") || "";

  const { data, isPending } = useFavoritesQuery(favoritesId);
  const { mutate: favortiesMutate } = useFavoritesMutation(favoritesId);
  const { mutate: cartMutate } = useCartMutation(cartId);

  const favorites = data?.data.favorites;

  const filteredFavorites =
    props.searchValue === ""
      ? favorites
      : favorites?.filter((item) =>
          item.product.name
            .toLocaleLowerCase()
            .includes(props.searchValue.toLowerCase())
        );

  const isFavorite = (productId: string) => {
    if (!favorites) return;
    return favorites.some((item) => item.product.id === productId);
  };

  const handleAddToFavorites = (productId: string) => {
    favortiesMutate({ productId: productId });

    if (isFavorite(productId)) {
      notifications.show({
        title: "Removed frm Favorites",
        message: "The item has been removed from your favorites",
      });
    } else {
      notifications.show({
        title: "Added to Favorites",
        message: "The item has been added to your favorites",
      });
    }
  };

  const handleAddToCart = (productId: string) => {
    cartMutate({ productId: productId, quantity: 1 });
    favortiesMutate({ productId: productId });

    notifications.show({
      title: "Added to Cart",
      message: "The item has been added to your cart",
    });
  };

  return (
    <Stack className="flex-1 h-full pb-16" align="start" gap="xl">
      {!isPending ? (
        filteredFavorites && filteredFavorites.length > 0 ? (
          <SimpleGrid className="flex-1 w-full" cols={5} spacing="sm">
            {filteredFavorites.map((item) => (
              <Link
                key={item.product.id}
                to="/products/$productId"
                params={{ productId: `${item.product.id}` }}
              >
                <ProductCard
                  id={`${item.product.id}`}
                  imageUrl={item.product.image_url}
                  name={item.product.name}
                  category={item.product.category}
                  price={item.product.price}
                  stock={item.product.quantity}
                  cartButton
                  favoritesButton
                  isFavorite
                  onFavoriteClick={() => handleAddToFavorites(item.product.id)}
                  onCartClick={() => handleAddToCart(item.product.id)}
                />
              </Link>
            ))}
          </SimpleGrid>
        ) : (
          <Stack
            align="center"
            justify="center"
            gap={2}
            className="w-full flex-1"
          >
            <Image src={EmptyFavorites} w={250} className="grayscale" />
            <Text size="xl" fw={500} c="#d6d6d6" className="select-none">
              No Favorites Found
            </Text>
          </Stack>
        )
      ) : (
        <Stack align="center" justify="center" className="w-full flex-1">
          <Loader />
        </Stack>
      )}
    </Stack>
  );
}
