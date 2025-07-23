import {
  ActionIcon,
  Autocomplete,
  Button,
  Group,
  Indicator,
  Text,
} from "@mantine/core";
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
import ImageHolder from "@/components/image-holder";
import { useSearchProductsQuery } from "@/data/query/productQuery";
import { useFavoritesQuery } from "@/data/query/favoritesQuery";

export const Route = createFileRoute("/(user)/_navbar")({
  component: NavbarLayout,
});

function NavbarLayout() {
  return (
    <Container
      fluid
      px={0}
      mih="100vh"
      className="flex flex-col  bg-neutral-50"
    >
      <Navbar />
      <Outlet />
    </Container>
  );
}

function Navbar() {
  const { data: cart } = useCartQuery(localStorage.getItem("cartId") || "");
  const { data: favorites } = useFavoritesQuery(
    localStorage.getItem("favoritesId") || ""
  );

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

      <SearchBar />

      <Group>
        <Indicator
          label={favorites?.data.quantity}
          color="rgba(74, 74, 74, 1)"
          offset={4}
          size={16}
          autoContrast
          disabled={favorites?.data.quantity === 0}
        >
          <ActionIcon
            component={Link}
            to="/favorites"
            variant="transparent"
            color="white"
          >
            <IconHeartFilled />
          </ActionIcon>
        </Indicator>

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

function SearchBar() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const [searchValue, setSearchValue] = useInputState("");

  const { data, isPending } = useSearchProductsQuery(searchValue);

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

  return (
    <Autocomplete
      radius="lg"
      className="w-3/5"
      placeholder="Find a product..."
      leftSection={<IconSearch />}
      leftSectionPointerEvents="none"
      value={searchValue}
      onChange={setSearchValue}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSearchProduct(e.currentTarget.value);
          // e.currentTarget.blur();
        }
      }}
      onOptionSubmit={(e) => {
        handleSearchProduct(e);
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
      limit={4}
      renderOption={(option) => (
        <Group gap="sm">
          <ImageHolder
            image={
              data?.data.find((item) => item.name == option.option.value)
                ?.image_url || ""
            }
            height={38}
          />
          <Text>{option.option.value}</Text>
        </Group>
      )}
      data={
        !isPending
          ? data
            ? data.data.map((item) => item.name)
            : undefined
          : []
      }
    />
  );
}
