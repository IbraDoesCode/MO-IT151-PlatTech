import {
  ActionIcon,
  Avatar,
  Button,
  Card,
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
import { createFileRoute } from "@tanstack/react-router";
import { DonutChart } from "@mantine/charts";
import {
  IconCurrencyPeso,
  IconFilter,
  IconPackage,
  IconPlus,
  IconSearch,
  IconShirt,
  IconSortAscending,
} from "@tabler/icons-react";
import InventoryRow from "@/components/inventory-row";
import { useProductsQuery } from "@/data/query/productQuery";

export const Route = createFileRoute("/(admin)/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <Container size="lg" className="pt-10">
      <Title order={2} mb="lg">
        Product Inventory
      </Title>
      <Stack>
        <KPISection />

        <ActionBar />

        <ProductTable />
      </Stack>
    </Container>
  );
}

function KPISection() {
  const data = [
    { name: "Electronics", value: 6, color: "black" },
    { name: "Jewelery", value: 4, color: "black" },
    { name: "Men's Clothing", value: 4, color: "black" },
    { name: "Women's Clothing", value: 6, color: "black" },
  ];

  const curr = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const totalProducts = 20;
  const totalStock = 50;
  const priceEstimate = 55600;

  return (
    <Group className="mb-4">
      <Card withBorder style={{ overflow: "visible" }} className="h-34 flex-1">
        <Group justify="space-between" className="px-4">
          <Avatar size="lg">
            <IconShirt color="black" size={34} />
          </Avatar>

          <Stack align="end">
            <Text size="lg" c="dimmed">
              Total Products
            </Text>
            <Title order={2}>{totalProducts}</Title>
          </Stack>
        </Group>
      </Card>

      <Card withBorder style={{ overflow: "visible" }} className="h-34 flex-1">
        <Group justify="space-between" className="px-4">
          <Avatar size="lg">
            <IconPackage color="black" size={34} />
          </Avatar>

          <Stack align="end">
            <Text size="lg" c="dimmed">
              Total Stock
            </Text>
            <Title order={2}>{totalStock}</Title>
          </Stack>
        </Group>
      </Card>

      <Card withBorder style={{ overflow: "visible" }} className="h-34 flex-1">
        <Group justify="space-between" className="px-4">
          <Avatar size="lg">
            <IconCurrencyPeso color="black" size={34} />
          </Avatar>

          <Stack align="end">
            <Text size="lg" c="dimmed">
              Price Estimate
            </Text>
            <Title order={2}>{curr.format(priceEstimate)}</Title>
          </Stack>
        </Group>
      </Card>

      <Card withBorder style={{ overflow: "visible" }} className="h-34 flex-1">
        <Group justify="space-between" align="start" className="px-2 h-full">
          <Stack h="100%" justify="center">
            <DonutChart size={80} thickness={14} data={data} />
          </Stack>

          <Stack align="end">
            <Text size="lg" c="dimmed">
              Categories
            </Text>
          </Stack>
        </Group>
      </Card>
    </Group>
  );
}

function ActionBar() {
  return (
    <Group justify="space-between" className="mb-2">
      <Group>
        <TextInput
          placeholder="Search"
          leftSection={<IconSearch />}
          leftSectionPointerEvents="none"
        />
        <ActionIcon variant="subtle" radius="xl">
          <IconFilter color="gray" />
        </ActionIcon>
        <ActionIcon variant="subtle" radius="xl">
          <IconSortAscending color="gray" />
        </ActionIcon>
      </Group>
      <Button leftSection={<IconPlus />}>New Item</Button>
    </Group>
  );
}

function ProductTable() {
  const { data } = useProductsQuery();

  return (
    <Stack className="flex-1 pb-20">
      <Card withBorder>
        <Grid className="px-8">
          <GridCol span={1}>
            <Group align="center">
              <Text size="md" fw={500}>
                Image
              </Text>
            </Group>
          </GridCol>

          <GridCol span={3.5}>
            <Group align="center">
              <Text size="md" fw={500}>
                Name
              </Text>
            </Group>
          </GridCol>

          <GridCol span={3}>
            <Group align="center">
              <Text size="md" fw={500}>
                Description
              </Text>
            </Group>
          </GridCol>

          <GridCol span={1.5}>
            <Group align="center">
              <Text size="md" fw={500}>
                Category
              </Text>
            </Group>
          </GridCol>

          <GridCol span={1.5}>
            <Group justify="center">
              <Text size="md" fw={500}>
                Price
              </Text>
            </Group>
          </GridCol>

          <GridCol span={1.5}>
            <Group justify="center">
              <Text size="md" fw={500}>
                Stock
              </Text>
            </Group>
          </GridCol>
        </Grid>

        <Divider mt="sm" />

        {data &&
          data.map((item) => (
            <>
              <InventoryRow
                key={item.id}
                id={`${item.id}`}
                name={item.title}
                category={item.category}
                imageUrl={item.image}
                price={item.price}
                description={item.description}
                stock={200}
              />
              <Divider my={2} />
            </>
          ))}
      </Card>
    </Stack>
  );
}
