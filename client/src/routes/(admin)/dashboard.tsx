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
  Pagination,
  Progress,
  ProgressSection,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import {
  IconCircleFilled,
  IconFilter,
  IconPackage,
  IconPlus,
  IconSearch,
  IconShirt,
  IconSortAscending,
} from "@tabler/icons-react";
import InventoryRow from "@/components/inventory-row";
import { useProductsQuery } from "@/data/query/productQuery";
import { useState } from "react";

export const Route = createFileRoute("/(admin)/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <Stack mih="100vh" className="flex flex-col  bg-neutral-50">
      <Container size="lg" className="w-full flex-1 pt-10">
        <Title order={2} mb="lg">
          Product Inventory
        </Title>
        <Stack>
          <KPISection />

          <ActionBar />

          <ProductTable />
        </Stack>
      </Container>
    </Stack>
  );
}

function KPISection() {
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
      <Card
        style={{ overflow: "visible" }}
        bg="black"
        radius="lg"
        className="h-34 w-3/12"
      >
        <Stack align="start" justify="center" gap={2} className="px-2 h-full">
          <Text size="md" c="#dedede">
            Total Asset Value
          </Text>
          <Title order={1} c="white">
            {curr.format(priceEstimate)}
          </Title>
        </Stack>
      </Card>

      <Card
        withBorder
        style={{ overflow: "visible" }}
        radius="md"
        className="h-34 flex-1"
      >
        <Stack>
          <Group gap="sm">
            <Avatar size={30}>
              <IconShirt color="black" size={20} />
            </Avatar>
            <Title order={3}>{totalProducts}</Title>
            <Text c="dimmed" fw={500}>
              Products
            </Text>
          </Group>

          <Progress.Root>
            <ProgressSection value={60} color="black" />
            <ProgressSection value={20} color="gray" />
            <ProgressSection value={20} color="#e9ecef" />
          </Progress.Root>

          <Group gap="lg">
            <ChartLegend color="black" label="Active" />
            <ChartLegend color="gray" label="Inactive" />
            <ChartLegend color="#e9ecef" label="Discontinued" />
          </Group>
        </Stack>
      </Card>

      <Card
        withBorder
        style={{ overflow: "visible" }}
        radius="md"
        className="h-34 flex-1"
      >
        <Stack>
          <Group gap="sm">
            <Avatar size={30}>
              <IconPackage color="black" size={20} />
            </Avatar>
            <Title order={3}>{totalStock}</Title>
            <Text c="dimmed" fw={500}>
              Total Stock
            </Text>
          </Group>

          <Progress.Root>
            <ProgressSection value={60} color="black" />
            <ProgressSection value={20} color="gray" />
            <ProgressSection value={20} color="#e9ecef" />
          </Progress.Root>

          <Group gap="lg">
            <ChartLegend color="black" label="In Stock" />
            <ChartLegend color="gray" label="Low Stock" />
            <ChartLegend color="#e9ecef" label="Out of Stock" />
          </Group>
        </Stack>
      </Card>
    </Group>
  );
}

interface ChartLegendProps {
  color: string;
  label: string;
  value?: string;
}

function ChartLegend(props: ChartLegendProps) {
  return (
    <Group gap={6}>
      <IconCircleFilled size={14} color={props.color} />
      <Text size="sm">{props.label}</Text>
      {props.value !== undefined && <Text size="sm">{props.value}</Text>}
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
  const [currentPage, setCurrentPage] = useState(1);

  const { data } = useProductsQuery({
    page: currentPage,
  });

  const handlePageNavigate = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Stack className="flex-1 pb-20">
      <Card withBorder>
        <Grid className="px-5 flex-1" gutter={0}>
          <GridCol span={1.5}>
            <Group>
              <Text size="md" fw={500}>
                Image
              </Text>
            </Group>
          </GridCol>

          <GridCol span={2.5}>
            <Group align="center">
              <Text size="md" fw={500}>
                Name
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
            <Group align="center">
              <Text size="md" fw={500}>
                Brand
              </Text>
            </Group>
          </GridCol>

          <GridCol span={1}>
            <Group justify="center">
              <Text size="md" fw={500}>
                Price
              </Text>
            </Group>
          </GridCol>

          <GridCol span={1}>
            <Group justify="center">
              <Text size="md" fw={500}>
                Stock
              </Text>
            </Group>
          </GridCol>

          <GridCol span={1}>
            <Group justify="center">
              <Text size="md" fw={500}>
                Status
              </Text>
            </Group>
          </GridCol>

          <GridCol span={2}>
            <Group justify="center">
              <Text size="md" fw={500}>
                Actions
              </Text>
            </Group>
          </GridCol>
        </Grid>

        <Divider mt="sm" />

        {data &&
          data.data.products.map((item) => (
            <>
              <InventoryRow
                key={item.id}
                id={`${item.id}`}
                name={item.name}
                category={item.category}
                brand={typeof item.brand === "string" ? item.brand : undefined}
                imageUrl={item.image_url}
                price={item.price}
                stock={item.quantity}
              />
              <Divider my={2} />
            </>
          ))}

        <Group justify="end" className="mt-4 px-4">
          <Pagination
            total={data?.data.totalPages || currentPage}
            value={currentPage}
            disabled={data === undefined}
            onChange={handlePageNavigate}
          />
        </Group>
      </Card>
    </Stack>
  );
}
