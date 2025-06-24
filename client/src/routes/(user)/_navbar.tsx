import { ActionIcon, Button, Group, Indicator, TextInput } from "@mantine/core";
import {
  IconHeartFilled,
  IconSearch,
  IconShoppingCartFilled,
} from "@tabler/icons-react";
import { Container } from "@mantine/core";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(user)/_navbar")({
  component: NavbarLayout,
});

function NavbarLayout() {
  return (
    <Container fluid px={0} mih="100vh">
      <Navbar />
      <Outlet />
    </Container>
  );
}

function Navbar() {
  const cartItems = 4;

  return (
    <nav className="flex justify-between bg-neutral-900 py-2 px-12 sticky top-0 z-20">
      <Group>
        <Button component={Link} to="/products" variant="transparent" c="white">
          Shop
        </Button>
      </Group>

      <TextInput
        className="w-3/5"
        placeholder="Search"
        leftSection={<IconSearch />}
        leftSectionPointerEvents="none"
      />

      <Group>
        <ActionIcon
          component={Link}
          to="/favorites"
          variant="transparent"
          color="white"
        >
          <IconHeartFilled />
        </ActionIcon>

        <Indicator
          label={cartItems}
          color="rgba(74, 74, 74, 1)"
          offset={4}
          size={16}
          autoContrast
        >
          <ActionIcon
            component={Link}
            to="/cart"
            variant="transparent"
            color="white"
          >
            <IconShoppingCartFilled />
          </ActionIcon>
        </Indicator>
      </Group>
    </nav>
  );
}
