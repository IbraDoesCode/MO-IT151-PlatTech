import ProductCard from "@/components/product-card";
import {
  useCategoriesQuery,
  useProductsQuery,
} from "@/data/query/productQuery";
import {
  Button,
  Checkbox,
  Container,
  Group,
  RangeSlider,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(user)/_navbar/products/")({
  component: ProductsPage,
});

function ProductsPage() {
  return (
    <Container size="xl" className="pt-10">
      <Group align="start">
        <ProductFiltering />
        <ProductGallery />
      </Group>
    </Container>
  );
}

function ProductFiltering() {
  const { data } = useCategoriesQuery();

  const maxPrice = 1000;

  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);

  return (
    <Stack w={280} className="relative">
      <Stack w={250} className="fixed">
        <Group gap={4}>
          <IconFilter />
          <Title order={4}>Filters</Title>
        </Group>
        <Stack>
          <Text fw={500}>Category</Text>
          <Checkbox.Group>
            <Stack>
              {data &&
                data.map((category) => (
                  <Checkbox
                    value={category}
                    label={category}
                    className="capitalize"
                  />
                ))}
            </Stack>
          </Checkbox.Group>
        </Stack>

        <Stack>
          <Text fw={500}>Price</Text>
          <Stack>
            <RangeSlider
              min={0}
              max={maxPrice}
              label={null}
              value={priceRange}
              onChange={setPriceRange}
            />
            <Group gap="sm">
              <Text c="dimmed">Price Range:</Text>
              <Text>
                ₱{priceRange[0]} — ₱{priceRange[1]}
              </Text>
            </Group>
          </Stack>
        </Stack>

        <Button>Clear All</Button>
      </Stack>
    </Stack>
  );
}

function ProductGallery() {
  const { data, isPending, isError } = useProductsQuery();

  if (isPending) return <></>;

  if (isError) return <></>;

  return (
    <SimpleGrid cols={3} spacing="sm" className="flex-1 pb-16">
      {data.map((product) => (
        <Link
          key={product.id}
          to="/products/$productId"
          params={{ productId: `${product.id}` }}
        >
          <ProductCard
            id={`${product.id}`}
            imageUrl={product.image}
            name={product.title}
            category={product.category}
            price={product.price}
            stock={5}
          />
        </Link>
      ))}
    </SimpleGrid>
  );
}
