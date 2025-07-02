import {
  productQueryOptions,
  useProductQuery,
} from "@/data/query/productQuery";
import {
  ActionIcon,
  AspectRatio,
  Button,
  Container,
  Grid,
  GridCol,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconHeart,
  IconShoppingCart,
} from "@tabler/icons-react";
import {
  createFileRoute,
  Link,
  useCanGoBack,
  useRouter,
} from "@tanstack/react-router";
// import { motion } from "motion/react";

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

  const { data, isPending, isError } = useProductQuery(productId);

  if (isPending) return <></>;

  if (isError) return <></>;

  return (
    <>
      <Container size="xl" className="relative pt-12 z-10">
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
              <AspectRatio ratio={1 / 1} className="rounded-lg py-4">
                <Image
                  // component={motion.img}
                  src={data.image}
                  // layoutId={`product-img-${productId}`}
                  fit="contain"
                  h={500}
                />
              </AspectRatio>
            </Group>
          </GridCol>

          <GridCol span="auto">
            <Stack gap={0} className="px-4 max-w-[520px]">
              <Stack gap={0} className="mb-4">
                <Title order={1} className="">
                  {data.title}
                </Title>

                <Text size="xl" c="dimmed" className="capitalize">
                  {data.category}
                </Text>
              </Stack>

              <Group className="mb-8">
                <Title order={2}>₱{data.price}</Title>
                <Text size="md" c="dimmed">
                  5 in stock
                </Text>
              </Group>

              <Stack className="mb-16">
                <Text>{data.description}</Text>
              </Stack>

              <Group gap="sm">
                <Button
                  // variant="outline"
                  size="lg"
                  radius="lg"
                  leftSection={<IconShoppingCart />}
                  className="flex-1"
                >
                  Add to Cart
                </Button>

                <ActionIcon variant="outline" size="xl" radius="xl">
                  <IconHeart />
                </ActionIcon>
              </Group>
            </Stack>
          </GridCol>
        </Grid>
      </Container>
    </>
  );
}
