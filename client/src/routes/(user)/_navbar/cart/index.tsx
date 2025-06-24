import CartCard from "@/components/cart-card";
import type { Product } from "@/data/api/products-mock";
import { useProductsQuery } from "@/data/query/productQuery";
import {
  Button,
  Container,
  Divider,
  Grid,
  GridCol,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconShoppingBag } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(user)/_navbar/cart/")({
  component: CartPage,
});

function CartPage() {
  const { data } = useProductsQuery();

  const itemList = [1, 2, 3, 4];

  const cart = data && data?.filter((item) => itemList.includes(item.id));

  return (
    <Container size="xl" className="pt-10">
      <Group className="mb-8">
        <Title order={2}>Shopping Cart</Title>
      </Group>
      <Group align="start" gap="xl">
        <ItemsSection cartItems={cart} />

        <SummarySection cartItems={cart} />
      </Group>
    </Container>
  );
}

interface CartProps {
  cartItems: Product[] | undefined;
}

function ItemsSection({ cartItems }: CartProps) {
  return (
    <Stack className="flex-1">
      <Grid>
        <GridCol span={1.5}>
          <Group gap={0}>
            <div className="w-[48%]"></div>
            <Text fw={500}>Item</Text>
          </Group>
        </GridCol>

        <GridCol span={4.5}></GridCol>

        <GridCol span={2}>
          <Group justify="center">
            <Text fw={500}>Price</Text>
          </Group>
        </GridCol>

        <GridCol span={2}>
          <Group justify="center">
            <Text fw={500}>Quantity</Text>
          </Group>
        </GridCol>

        <GridCol span={2}>
          <Group justify="center">
            <Text fw={500}>Subtotal</Text>
          </Group>
        </GridCol>
      </Grid>
      {cartItems &&
        cartItems.map((item) => (
          <CartCard
            key={item.id}
            id={`${item.id}`}
            name={item.title}
            category={item.category}
            imageUrl={item.image}
            price={item.price}
            quantity={1}
          />
        ))}
    </Stack>
  );
}

function SummarySection({ cartItems }: CartProps) {
  const curr = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  });

  const subtotal =
    cartItems && cartItems.reduce((acc, val) => acc + val.price, 0);
  const shipping = 10.0;
  const taxes = 10.0;
  const total = subtotal && subtotal + shipping + taxes;

  return (
    <Stack className="w-96 min-h-48 bg-neutral-900 rounded-md p-5">
      <Title order={4} c="white">
        Summary
      </Title>

      <Stack c="white" gap={8} className="flex-1 mb-2">
        <Group align="end">
          <TextInput
            label="Enter Promo Code"
            placeholder="Code"
            className="flex-1"
          />
          <Button variant="outline" color="white" c="white">
            Apply
          </Button>
        </Group>

        <Divider my="sm" opacity={0.2} />

        <Group justify="space-between">
          <Text>Subtotal</Text>
          <Text>{subtotal && curr.format(subtotal)}</Text>
        </Group>
        <Group justify="space-between">
          <Text>Shipping</Text>
          <Text>{curr.format(shipping)}</Text>
        </Group>
        <Group justify="space-between">
          <Text>Taxes</Text>
          <Text>{curr.format(taxes)}</Text>
        </Group>

        <Divider my="sm" opacity={0.2} />

        <Group justify="space-between">
          <Text size="xl" fw={500}>
            Total
          </Text>
          <Text size="xl" fw={500}>
            {total && curr.format(total)}
          </Text>
        </Group>
      </Stack>

      <Button color="white" c="black" leftSection={<IconShoppingBag />}>
        Checkout
      </Button>
    </Stack>
  );
}
