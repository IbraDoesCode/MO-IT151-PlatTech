import { ActionIcon, Button, Group, Indicator, TextInput } from "@mantine/core";
import {
  IconHeartFilled,
  IconSearch,
  IconShoppingCartFilled,
  IconX,
} from "@tabler/icons-react";
import { Container } from "@mantine/core";
import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { useInputState } from "@mantine/hooks";
import { useCartQuery } from "@/data/query/cartQuery";

export const Route = createFileRoute("/(user)/_navbar")({
  component: NavbarLayout,
});

function NavbarLayout() {
  return (
    <Container fluid px={0} mih="100vh" className="flex flex-col">
      <Navbar />
      <Outlet />
    </Container>
  );
}

function Navbar() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: cart } = useCartQuery(localStorage.getItem("cartId") || "");

  const [searchValue, setSearchValue] = useInputState("");

  const handleSearchProduct = (query: string) => {
    navigate({
      to: "/products",
      search: (_) => ({
        ...search,
        name: query,
        page: 1,
      }),
    });
  };

  const handleSearchClear = () => {
    navigate({
      to: "/products",
      search: (_) => ({
        ...search,
        name: undefined,
      }),
    });
    setSearchValue("");
  };

  const cartTotalItems = cart?.data.items.reduce(
    (acc, val) => acc + val.quantity,
    0
  );

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
        value={searchValue}
        onChange={setSearchValue}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearchProduct(e.currentTarget.value);
        }}
        rightSection={
          searchValue !== "" ? (
            <ActionIcon
              variant="subtle"
              radius="xl"
              c="dimmed"
              onClick={() => handleSearchClear()}
            >
              <IconX size={20} stroke={1.5} />
            </ActionIcon>
          ) : null
        }
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
          label={cartTotalItems}
          color="rgba(74, 74, 74, 1)"
          offset={4}
          size={16}
          autoContrast
          disabled={cartTotalItems === 0}
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
