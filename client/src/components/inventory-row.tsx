import { ActionIcon, Grid, GridCol, Group, Text } from "@mantine/core";
import ImageHolder from "./image-holder";
import { IconEdit, IconEye, IconTrash } from "@tabler/icons-react";

interface InventoryRowProps {
  id: string;
  imageUrl: string;
  name: string;
  category: string;
  brand: string | undefined;
  price: number;
  stock: number;
}

function InventoryRow(props: InventoryRowProps) {
  const curr = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  });

  return (
    <Group className="p-5 hover:bg-neutral-300/20 hover:cursor-pointer transition-all">
      <Grid gutter={0} className="flex-1">
        <GridCol span={1.5}>
          <Group align="center">
            <ImageHolder image={props.imageUrl} height={70} />
          </Group>
        </GridCol>

        <GridCol span={2.5}>
          <Group h="100%" align="center">
            <Text size="md" fw={500}>
              {props.name}
            </Text>
          </Group>
        </GridCol>

        <GridCol span={1.5}>
          <Group h="100%" align="center">
            <Text className="capitalize">{props.category}</Text>
          </Group>
        </GridCol>

        <GridCol span={1.5}>
          <Group h="100%" align="center">
            <Text className="capitalize">{props.brand || "-"}</Text>
          </Group>
        </GridCol>

        <GridCol span={1}>
          <Group h="100%" align="center" justify="center">
            {curr.format(props.price)}
          </Group>
        </GridCol>

        <GridCol span={1}>
          <Group h="100%" align="center" justify="center">
            {props.stock}
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
          <RowActions />
        </GridCol>
      </Grid>
    </Group>
  );
}

function RowActions() {
  return (
    <Group h="100%" align="center" justify="center" gap="sm">
      <ActionIcon variant="subtle" size="md" radius="xl">
        <IconEye />
      </ActionIcon>

      <ActionIcon variant="subtle" size="md" radius="xl">
        <IconEdit />
      </ActionIcon>

      <ActionIcon variant="subtle" size="md" radius="xl">
        <IconTrash />
      </ActionIcon>
    </Group>
  );
}

export default InventoryRow;
