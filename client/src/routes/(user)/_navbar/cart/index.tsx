import CartCard from "@/components/cart-card";
import { useCartMutation, useCartQuery } from "@/data/query/cartQuery";
import type { CartItem } from "@/types/cart";
import {
  Button,
  Container,
  Divider,
  Grid,
  GridCol,
  Group,
  Image,
  Loader,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconShoppingBag } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import EmptyCart from "@/assets/empty-cart.png";

export const Route = createFileRoute("/(user)/_navbar/cart/")({
  component: CartPage,
});

function CartPage() {
  const { data, isPending } = useCartQuery(
    localStorage.getItem("cartId") || ""
  );

  const cart = data?.data.items;

  return (
    <Container size="xl" className="pt-10 w-full flex-1">
      <Stack gap={0} className="mb-4">
        <Title order={2}>Shopping Cart</Title>
        <Text opacity={0.6}>Review your items before checking out.</Text>
      </Stack>

      <Group align="start" gap="xl">
        {!isPending ? (
          cart && cart.length > 0 ? (
            <>
              <ItemsSection cartItems={cart} />

              <SummarySection cartItems={cart} />
            </>
          ) : (
            <Stack
              align="center"
              justify="center"
              gap={2}
              className="w-full flex-1"
            >
              <Image src={EmptyCart} w={250} className="grayscale" />
              <Text size="xl" fw={500} c="#d6d6d6" className="select-none">
                Your cart is empty
              </Text>
            </Stack>
          )
        ) : (
          <Stack align="center" justify="center" className="w-full flex-1">
            <Loader />
          </Stack>
        )}
      </Group>
    </Container>
  );
}

interface CartProps {
  cartItems: CartItem[] | undefined;
}

function ItemsSection({ cartItems }: CartProps) {
  const cartId = localStorage.getItem("cartId") || "";
  const { mutate: cartMutate } = useCartMutation(cartId);

  const handleItemQuantity = (productId: string, val: number | string) => {
    cartMutate({ productId: productId, quantity: Number(val) });
  };

  return (
    <Stack className="flex-1">
      <Grid className="px-4">
        <GridCol span={1.5}>
          <Group gap={0}>
            <div className="w-[40%] flex-none"></div>
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
            key={item.product.id}
            id={`${item.product.id}`}
            name={item.product.name}
            category={item.product.category}
            imageUrl={item.product.image_url}
            price={item.product.price}
            quantity={item.quantity}
            onQuantityChange={(val) => handleItemQuantity(item.product.id, val)}
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
    cartItems &&
    cartItems.reduce((acc, val) => acc + val.product.price * val.quantity, 0);
  const shipping = 10.0;
  const taxes = 10.0;
  const total = subtotal && subtotal + shipping + taxes;

  return (
    <Stack className="w-96 min-h-48 bg-white rounded-lg shadow-sm p-5">
      <Title order={4} c="">
        Summary
      </Title>

      <Stack c="" gap={8} className="flex-1 mb-2">
        <Group align="end">
          <TextInput
            label="Enter Promo Code"
            placeholder="Code"
            className="flex-1"
          />
          <Button variant="outline" color="" c="">
            Apply
          </Button>
        </Group>

        <Divider my="sm" opacity={0.8} />

        <Group justify="space-between">
          <Text>Subtotal</Text>
          <Text>{subtotal && curr.format(subtotal)}</Text>
        </Group>
        <Group justify="space-between">
          <Text>Shipping</Text>
          <Text>{curr.format(shipping)}</Text>
        </Group>
        <Group justify="space-between">
          <Text>VAT</Text>
          <Text>{curr.format(taxes)}</Text>
        </Group>

        <Divider my="sm" opacity={0.8} />

        <Group justify="space-between">
          <Text size="xl" fw={500}>
            Total
          </Text>
          <Text size="xl" fw={500}>
            {total && curr.format(total)}
          </Text>
        </Group>
      </Stack>

      <Button color="" c="" leftSection={<IconShoppingBag />}>
        Checkout
      </Button>
    </Stack>
  );
}
