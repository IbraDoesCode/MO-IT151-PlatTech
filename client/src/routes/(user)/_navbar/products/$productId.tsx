import ImageGallery from "@/components/image-gallery";
import ImageGallerySkeleton from "@/components/skeleton/image-gallery-skeleton";
import { useCartMutation, useCartQuery } from "@/data/query/cartQuery";
import {
  useFavoritesMutation,
  useFavoritesQuery,
} from "@/data/query/favoritesQuery";
import {
  productQueryOptions,
  useProductQuery,
} from "@/data/query/productQuery";
import {
  ActionIcon,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  GridCol,
  Group,
  Rating,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconChevronLeft,
  IconHeart,
  IconHeartFilled,
  IconShoppingCart,
} from "@tabler/icons-react";
import {
  createFileRoute,
  Link,
  useCanGoBack,
  useRouter,
} from "@tanstack/react-router";
import dayjs from "dayjs";

export const Route = createFileRoute("/(user)/_navbar/products/$productId")({
  loader: ({ context: { queryClient }, params: { productId } }) => {
    return queryClient.ensureQueryData(productQueryOptions(productId));
  },
  component: ProductPage,
});

function ProductPage() {
  const { productId } = Route.useParams();
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const { data: product, isPending } = useProductQuery(productId);

  const cartId = localStorage.getItem("cartId") || "";
  const favoritesId = localStorage.getItem("favoritesId") || "";

  const { data: cart } = useCartQuery(cartId);
  const { data: favorites } = useFavoritesQuery(
    localStorage.getItem("favoritesId") || ""
  );
  const { mutate: cartMutate } = useCartMutation(cartId);
  const { mutate: favortiesMutate } = useFavoritesMutation(favoritesId);

  const data = product?.data;
  const isFavorite = favorites?.data.favorites.some(
    (item) => item.product.id === productId
  );

  const handleAddToCart = () => {
    const cartItems = cart?.data.items;

    if (cartItems?.some((item) => item.product.id === productId)) {
      const item = cartItems.find((item) => item.product.id === productId);
      if (item)
        cartMutate({ productId: productId, quantity: item.quantity + 1 });
    } else {
      cartMutate({ productId: productId, quantity: 1 });
    }

    notifications.show({
      title: "Added to Cart",
      message: "The item has been added to your cart",
    });
  };

  const handleAddToFavorites = () => {
    favortiesMutate({ productId: productId });

    if (isFavorite) {
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

  return (
    <>
      <Container size="lg" className="relative pt-12 w-full flex-1">
        <Stack gap={0} align="start" className="w-full">
          {canGoBack ? (
            <Button
              variant="subtle"
              leftSection={<IconChevronLeft />}
              className="mb-4"
              onClick={() => router.history.back()}
            >
              Back to Products
            </Button>
          ) : (
            <Button
              component={Link}
              to="/products"
              variant="subtle"
              leftSection={<IconChevronLeft />}
              className="mb-4"
            >
              Go to Products
            </Button>
          )}

          <Grid className="w-full">
            <GridCol span={6}>
              <Group justify="center">
                {!isPending && data ? (
                  <ImageGallery images={data.images} />
                ) : (
                  <ImageGallerySkeleton />
                )}
              </Group>
            </GridCol>

            <GridCol span={6}>
              <Stack gap={0} className="px-4 pr-14">
                <Stack gap={0} className="mb-4">
                  {!isPending && data ? (
                    <Title order={1}>{data.name}</Title>
                  ) : (
                    <Group h={44.188} align="center">
                      <Skeleton height={38} width="70%" />
                    </Group>
                  )}

                  {!isPending && data ? (
                    <Group gap="sm">
                      {typeof data.brand == "string" && (
                        <>
                          <Text size="xl" c="dimmed" className="capitalize">
                            {data.brand}
                          </Text>

                          <Text size="xl" c="dimmed" className="capitalize">
                            •
                          </Text>
                        </>
                      )}

                      <Text size="xl" c="dimmed" className="capitalize">
                        {data.category}
                      </Text>
                    </Group>
                  ) : (
                    <Group h={33} align="center">
                      <Skeleton height={28} width="50%" />
                    </Group>
                  )}
                </Stack>

                {!isPending && data ? (
                  <Group className="mb-4 mt-2" gap="sm">
                    <Text size="lg" c="dimmed">
                      {data.rating.toFixed(1)}
                    </Text>
                    <Rating value={data.rating} fractions={4} readOnly />
                  </Group>
                ) : (
                  <Group className="mb-4 mt-2" gap="sm">
                    <Skeleton height={22} width={28.8} />
                    <Rating value={0} readOnly />
                  </Group>
                )}

                {!isPending && data ? (
                  <Group className="mb-8">
                    <Title order={2}>₱{data.price}</Title>
                    <Text size="md" c="dimmed">
                      {data.quantity} in stock
                    </Text>
                  </Group>
                ) : (
                  <Group className="mb-8">
                    <Skeleton height={28} width="20%" />
                    <Skeleton height={16} width="20%" />
                  </Group>
                )}

                {!isPending && data ? (
                  <Stack className="mb-16">
                    <Text>{data.description}</Text>
                  </Stack>
                ) : (
                  <Stack className="mb-16 w-full">
                    <Skeleton height={10} width="100%" />
                    <Skeleton height={10} width="100%" />
                    <Skeleton height={10} width="70%" />
                  </Stack>
                )}

                <Group gap="sm">
                  <Button
                    // variant="outline"
                    size="lg"
                    radius="lg"
                    leftSection={<IconShoppingCart />}
                    className="flex-1"
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </Button>

                  <ActionIcon
                    variant={isFavorite ? "filled" : "outline"}
                    size="xl"
                    radius="xl"
                    onClick={handleAddToFavorites}
                  >
                    {isFavorite ? <IconHeartFilled /> : <IconHeart />}
                  </ActionIcon>
                </Group>
              </Stack>
            </GridCol>
          </Grid>

          <Divider className="w-full mt-10 mb-6" />

          <Stack className="w-full">
            <Title order={3}>Reviews</Title>

            <Group>
              {!isPending && data
                ? data.reviews.map((review) => (
                    <Card key={review.id} className="flex-1" withBorder>
                      <Group className="mb-1" gap={5}>
                        <Text size="sm" c="dimmed">
                          {review.rating}
                        </Text>
                        <Rating
                          value={review.rating}
                          size="xs"
                          color="black"
                          readOnly
                        />
                      </Group>

                      <Text fw={500}>{review.comment}</Text>

                      <Group className="mt-6" justify="space-between">
                        <Text size="sm">{review.name}</Text>
                        <Text size="sm" c="dimmed">
                          {dayjs(review.date).format("DD MMM YYYY")}
                        </Text>
                      </Group>
                    </Card>
                  ))
                : Array(3)
                    .fill("")
                    .map(() => <Skeleton height={127.4} flex={1} />)}
            </Group>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}
