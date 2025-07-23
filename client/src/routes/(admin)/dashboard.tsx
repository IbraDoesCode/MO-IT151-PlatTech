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
  Modal,
  NumberInput,
  Pagination,
  Progress,
  ProgressSection,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
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
import { useState } from "react";
import {
  useAddProductMutation,
  useChangeProductStatusMutation,
  useDashboardKPI,
  useProductsQuery,
} from "@/data/query/adminQuery";
import { useDisclosure } from "@mantine/hooks";
import ImageUpload from "@/components/image-upload";
import { type FileWithPath } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import {
  productFormSchema,
  type ProudctForm,
} from "@/data/validation/productCreate";

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
  const { data } = useDashboardKPI();

  const curr = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

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
            {data && curr.format(data.data.totalAssetValue)}
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
            <Title order={3}>{data && data.data.totalUniqueProducts}</Title>
            <Text c="dimmed" fw={500}>
              Products
            </Text>
          </Group>

          <Progress.Root>
            <ProgressPopover
              value={data?.data.statusBreakdown.active || 0}
              color="black"
              label="Active"
            />
            <ProgressPopover
              value={data?.data.statusBreakdown.inactive || 0}
              color="gray"
              label="Inactive"
            />
            <ProgressPopover
              value={data?.data.statusBreakdown.discontinued || 0}
              color="e9ecef"
              label="Discontinued"
            />
          </Progress.Root>

          <Group gap="lg">
            <ChartLegend
              color="black"
              label="Active"
              value={data?.data.statusBreakdown.active || 0}
            />
            <ChartLegend
              color="gray"
              label="Inactive"
              value={data?.data.statusBreakdown.inactive || 0}
            />
            <ChartLegend
              color="#e9ecef"
              label="Discontinued"
              value={data?.data.statusBreakdown.discontinued || 0}
            />
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
            <Title order={3}>{data && data.data.totalStock}</Title>
            <Text c="dimmed" fw={500}>
              Total Stock
            </Text>
          </Group>

          <Progress.Root>
            <ProgressPopover
              value={data?.data.stockBreakdown.inStock || 0}
              color="black"
              label="In Stock"
            />
            <ProgressPopover
              value={data?.data.stockBreakdown.lowStock || 0}
              color="gray"
              label="Low Stock"
            />
            <ProgressPopover
              value={data?.data.stockBreakdown.noStock || 0}
              color="e9ecef"
              label="No Stock"
            />
          </Progress.Root>

          <Group gap="lg">
            <ChartLegend
              color="black"
              label="In Stock"
              value={data?.data.stockBreakdown.inStock || 0}
            />
            <ChartLegend
              color="gray"
              label="Low Stock"
              value={data?.data.stockBreakdown.lowStock || 0}
            />
            <ChartLegend
              color="#e9ecef"
              label="Out of Stock"
              value={data?.data.stockBreakdown.noStock || 0}
            />
          </Group>
        </Stack>
      </Card>
    </Group>
  );
}

interface ChartLegendProps {
  color: string;
  label: string;
  value?: number;
}

function ChartLegend(props: ChartLegendProps) {
  return (
    <Group gap={6}>
      <IconCircleFilled size={14} color={props.color} />
      {props.value !== undefined && (
        <Text size="sm" fw={500}>
          {props.value}
        </Text>
      )}
      <Text size="sm">{props.label}</Text>
    </Group>
  );
}

interface ProgressPopoverProps {
  value: number;
  color: string;
  label: string;
}

function ProgressPopover(props: ProgressPopoverProps) {
  // const [opened, { close, open }] = useDisclosure(false);

  return (
    // <Popover opened={opened} withArrow>
    //   <PopoverTarget>

    //   </PopoverTarget>
    //   <PopoverDropdown>
    //     <Group>
    //       <Text>{props.value}</Text>
    //     </Group>
    //   </PopoverDropdown>
    // </Popover>
    <Tooltip label={props.value}>
      <ProgressSection
        value={props.value}
        color={props.color}
        className=""
        // onMouseEnter={open}
        // onMouseLeave={close}
      />
    </Tooltip>
  );
}

function ActionBar() {
  const [opened, { open, close }] = useDisclosure(false);

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
      <Button leftSection={<IconPlus />} onClick={open}>
        New Item
      </Button>
      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        title="Add New Product"
        size="lg"
      >
        <AddItemModal onClose={close} />
      </Modal>
    </Group>
  );
}

interface AddItemModalProps {
  onClose: () => void;
}

function AddItemModal(props: AddItemModalProps) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      images: [] as FileWithPath[],
      imageLink: undefined,
      name: "",
      category: "",
      brand: null,
      description: "",
      price: 0,
      quantity: 0,
    },
    validate: zodResolver(productFormSchema),
  });

  const { mutate } = useAddProductMutation();

  const handleAddItem = (val: ProudctForm) => {
    mutate(val);
    props.onClose();
  };

  return (
    <form onSubmit={form.onSubmit((val) => handleAddItem(val))}>
      <Stack>
        <Tabs defaultValue="image">
          <Tabs.List>
            <Tabs.Tab
              value="image"
              flex={1}
              onClick={() => form.setFieldValue("imageLink", undefined)}
            >
              Upload Image
            </Tabs.Tab>
            <Tabs.Tab
              value="link"
              flex={1}
              onClick={() => form.setFieldValue("images", [])}
            >
              Paste Link
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="image">
            <Stack pt="sm">
              <ImageUpload
                files={form.values.images}
                onDrop={(file) =>
                  form.setFieldValue("images", (prev) => [
                    ...prev,
                    ...file.slice(0, 4 - prev.length),
                  ])
                }
                onRemoveFile={(val) =>
                  form.setFieldValue("images", (prev) =>
                    prev.filter((file) => val !== file)
                  )
                }
              />
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value="link">
            <Stack pt="sm">
              <TextInput
                {...form.getInputProps("imageLink")}
                key={form.key("imageLink")}
                variant="filled"
                label="Image Link"
                placeholder="Paste the link of the image here..."
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <TextInput
          {...form.getInputProps("name")}
          key={form.key("name")}
          label="Name"
          placeholder="Name of the product"
          withAsterisk
        />
        <TextInput
          {...form.getInputProps("category")}
          key={form.key("category")}
          label="Category"
          placeholder="Category of the product"
          withAsterisk
        />
        <TextInput
          {...form.getInputProps("brand")}
          key={form.key("brand")}
          label="Brand"
          placeholder="Specific brand if there are any"
        />

        <Group>
          <NumberInput
            {...form.getInputProps("price")}
            key={form.key("price")}
            label="Retail Price"
            min={0}
            allowNegative={false}
            decimalScale={2}
            prefix="₱"
            hideControls
            withAsterisk
            flex={1}
          />
          <NumberInput
            {...form.getInputProps("quantity")}
            key={form.key("quantity")}
            label="Stock Amount"
            min={0}
            allowNegative={false}
            allowDecimal={false}
            withAsterisk
            flex={1}
          />
        </Group>

        <Textarea
          {...form.getInputProps("description")}
          key={form.key("description")}
          label="Description"
          minRows={4}
          autosize
          placeholder="Add product description here..."
          mb="xs"
        />

        <Group justify="end">
          <Button variant="light" onClick={() => props.onClose()}>
            Cancel
          </Button>
          <Button type="submit">Add</Button>
        </Group>
      </Stack>
    </form>
  );
}

function ProductTable() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data } = useProductsQuery({
    page: currentPage,
  });
  const { mutate } = useChangeProductStatusMutation();

  const handlePageNavigate = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusToggle = (
    id: string,
    status: "active" | "inactive" | "discontinued"
  ) => {
    mutate({ id: id, status: status === "active" ? "inactive" : "active" });
  };

  const handleDiscontinueToggle = (
    id: string,
    status: "active" | "inactive" | "discontinued"
  ) => {
    mutate({
      id: id,
      status: status === "discontinued" ? "inactive" : "discontinued",
    });
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
                status={item.status}
                stock={item.quantity}
                onStatusToggleClick={() =>
                  handleStatusToggle(item.id, item.status)
                }
                onDiscontinueClick={() =>
                  handleDiscontinueToggle(item.id, item.status)
                }
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
