import ProductCard from "@/components/product-card";
import CheckboxSkeleton from "@/components/skeleton/checkbox-skeleton";
import ProductCardSkeleton from "@/components/skeleton/product-card-skeleton";
import {
  useCategoriesQuery,
  usePriceRangeQuery,
  useProductsQuery,
} from "@/data/query/productQuery";
import { productSearchSchema } from "@/data/validation/productSearch";
import {
  Button,
  Checkbox,
  Container,
  Group,
  NumberInput,
  Pagination,
  RangeSlider,
  ScrollArea,
  SimpleGrid,
  Skeleton,
  Spoiler,
  Stack,
  Text,
  Title,
  type RangeSliderValue,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconCurrencyPeso, IconFilter } from "@tabler/icons-react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/(user)/_navbar/products/")({
  component: ProductsPage,
  validateSearch: productSearchSchema,
});

function ProductsPage() {
  return (
    <Container size="xl" className="pt-10 w-full flex-1 flex">
      <Group align="start" className="flex-1">
        <ProductFiltering />
        <ProductGallery />
      </Group>
    </Container>
  );
}

function ProductFiltering() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: categories, isPending: isCategoriesLoading } =
    useCategoriesQuery();
  const { data: priceRange, isPending: isPriceRangeLoading } =
    usePriceRangeQuery({
      category: search.category,
      brand: search.brand,
      rating: search.rating,
    });

  const selectedCategories = search.category ?? [];

  const [priceRangeState, setPriceRangeState] = useState<[number, number]>([
    0, 1000,
  ]);

  useEffect(() => {
    if (priceRange)
      setPriceRangeState([
        Math.round(priceRange.data.minPrice),
        Math.round(priceRange.data.maxPrice),
      ]);
  }, [priceRange]);

  const handleCategoryClick = (categories: string[]) => {
    navigate({
      search: (_) => ({
        ...search,
        page: 1,
        category: categories.length > 0 ? categories : undefined,
        minPrice: undefined,
        maxPrice: undefined,
      }),
    });
  };

  const handlePriceRangeChange = (sliderVal: RangeSliderValue) => {
    navigate({
      search: (_) => ({
        ...search,
        page: 1,
        minPrice: sliderVal[0],
        maxPrice: sliderVal[1],
      }),
    });
  };

  const handlePriceTextChange = useDebouncedCallback(
    async (index: number, value: number) => {
      if (index == 0) {
        navigate({
          search: (_) => ({
            ...search,
            page: 1,

            minPrice: value,
            maxPrice: search.maxPrice || priceRange?.data.maxPrice,
          }),
        });
        setPriceRangeState([value, priceRangeState[1]]);
      } else {
        navigate({
          search: (_) => ({
            ...search,
            page: 1,

            minPrice: search.minPrice || priceRange?.data.minPrice,
            maxPrice: value,
          }),
        });
        setPriceRangeState([priceRangeState[0], value]);
      }
    },
    500
  );

  const handleClearFilters = () => {
    navigate({
      search: (_) => ({}),
    });
    if (priceRange)
      setPriceRangeState([
        Math.round(priceRange.data.minPrice),
        Math.round(priceRange.data.maxPrice),
      ]);
  };

  console.log(isCategoriesLoading);

  return (
    <Stack w={280} className="relative">
      <Stack w={250} className="fixed h-10/12">
        <ScrollArea offsetScrollbars>
          <Stack>
            <Group gap={4}>
              <IconFilter />
              <Title order={4}>Filters</Title>
            </Group>
            <Stack px="sm">
              <Stack>
                <Text fw={500}>Category</Text>
                {!isCategoriesLoading && categories ? (
                  <Spoiler
                    maxHeight={250}
                    showLabel="Show More"
                    hideLabel="Show Less"
                  >
                    <Checkbox.Group
                      value={[...selectedCategories]}
                      onChange={handleCategoryClick}
                    >
                      <Stack className="pb-2" gap="sm">
                        {categories.data.map((category) => (
                          <Group key={category.slug} gap="sm">
                            <Checkbox
                              value={category.name}
                              label={category.name}
                              className="capitalize"
                            />
                            <Text size="sm" c="dimmed">
                              {category.productCount}
                            </Text>
                          </Group>
                        ))}
                      </Stack>
                    </Checkbox.Group>
                  </Spoiler>
                ) : (
                  <>
                    <Stack className="pb-2" gap="sm" mah={250}>
                      {Array.from(Array(10).keys()).map((key) => (
                        <CheckboxSkeleton key={key} />
                      ))}
                    </Stack>
                    <Stack h={24}>
                      <Skeleton height={10} width="40%" />
                    </Stack>
                  </>
                )}
              </Stack>

              <Stack>
                <Text fw={500}>Price</Text>
                {!isPriceRangeLoading && priceRange ? (
                  <Stack>
                    <RangeSlider
                      min={Math.round(priceRange.data.minPrice)}
                      max={Math.round(priceRange.data.maxPrice)}
                      label={null}
                      value={priceRangeState}
                      onChange={setPriceRangeState}
                      onChangeEnd={handlePriceRangeChange}
                    />
                    <Stack gap="sm">
                      <Text c="dimmed">Price Range:</Text>
                      <Group gap={4}>
                        <NumberInput
                          size="sm"
                          leftSection={
                            <IconCurrencyPeso size={18} stroke={1.5} />
                          }
                          hideControls
                          className="flex-1"
                          value={priceRangeState[0]}
                          onChange={(val) =>
                            handlePriceTextChange(0, Number(val))
                          }
                        />
                        <Text>—</Text>
                        <NumberInput
                          size="sm"
                          leftSection={
                            <IconCurrencyPeso size={18} stroke={1.5} />
                          }
                          hideControls
                          className="flex-1"
                          value={priceRangeState[1]}
                          onChange={(val) =>
                            handlePriceTextChange(1, Number(val))
                          }
                        />
                      </Group>
                    </Stack>
                  </Stack>
                ) : (
                  <Stack>
                    <RangeSlider
                      min={0}
                      max={100}
                      label={null}
                      value={[0, 100]}
                      disabled
                    />
                    <Stack gap="sm">
                      <Text c="dimmed">Price Range:</Text>
                      <Group gap={4}>
                        <NumberInput
                          size="sm"
                          leftSection={
                            <IconCurrencyPeso size={18} stroke={1.5} />
                          }
                          hideControls
                          className="flex-1"
                          defaultValue={0}
                          disabled
                        />
                        <Text>—</Text>
                        <NumberInput
                          size="sm"
                          leftSection={
                            <IconCurrencyPeso size={18} stroke={1.5} />
                          }
                          hideControls
                          className="flex-1"
                          defaultValue={0}
                          disabled
                        />
                      </Group>
                    </Stack>
                  </Stack>
                )}
              </Stack>

              <Button
                onClick={handleClearFilters}
                disabled={isCategoriesLoading && isPriceRangeLoading}
              >
                Clear All
              </Button>
            </Stack>
          </Stack>
        </ScrollArea>
      </Stack>
    </Stack>
  );
}

function ProductGallery() {
  const search = Route.useSearch();
  const { data, isPending } = useProductsQuery(search);

  const navigate = useNavigate({ from: Route.fullPath });

  const handlePageNavigate = (page: number) => {
    navigate({
      search: (_) => ({
        ...search,
        page: page,
      }),
    });
  };

  return (
    <Stack className="flex-1 h-full pb-16" align="center" gap="xl">
      <SimpleGrid className="flex-1 w-full" cols={3} spacing="sm">
        {!isPending && data
          ? data.data.products.map((product) => (
              <Link
                key={product.id}
                to="/products/$productId"
                params={{ productId: `${product.id}` }}
              >
                <ProductCard
                  id={`${product.id}`}
                  imageUrl={product.image_url}
                  name={product.name}
                  category={product.category}
                  price={product.price}
                  stock={5}
                />
              </Link>
            ))
          : Array.from(Array(10).keys()).map((key) => (
              <ProductCardSkeleton key={key} />
            ))}
      </SimpleGrid>

      <Pagination
        total={data?.data.totalPages || search.page}
        value={search.page}
        disabled={data === undefined}
        onChange={handlePageNavigate}
      />
    </Stack>
  );
}
