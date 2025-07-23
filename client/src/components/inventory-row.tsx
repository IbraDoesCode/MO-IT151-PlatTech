import {
  ActionIcon,
  Chip,
  Grid,
  GridCol,
  Group,
  Menu,
  Text,
  Tooltip,
} from "@mantine/core";
import ImageHolder from "./image-holder";
import {
  IconCircleFilled,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconPackage,
  IconTrash,
} from "@tabler/icons-react";

interface InventoryRowProps {
  id: string;
  imageUrl: string;
  name: string;
  category: string;
  brand: string | undefined;
  price: number;
  status: "active" | "inactive" | "discontinued";
  stock: number;
  onStatusToggleClick?: () => void;
  onEditClick?: () => void;
  onDiscontinueClick?: () => void;
  onDeleteClick?: () => void;
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
          <Group h="100%" justify="center" align="center">
            <Chip
              variant="light"
              icon={<IconCircleFilled size={14} />}
              color={
                props.status === "active"
                  ? "green"
                  : props.status === "inactive"
                  ? "red"
                  : "dark"
              }
              checked
              readOnly
            >
              {props.status === "discontinued" ? "discont." : props.status}
            </Chip>
          </Group>
        </GridCol>

        <GridCol span={2}>
          <RowActions
            status={props.status}
            onStatusToggleClick={props.onStatusToggleClick}
            onEditClick={props.onEditClick}
            onDiscontinueClick={props.onDiscontinueClick}
            onDeleteClick={props.onDeleteClick}
          />
        </GridCol>
      </Grid>
    </Group>
  );
}

interface RowActionProps {
  status: "active" | "inactive" | "discontinued";
  onStatusToggleClick?: () => void;
  onEditClick?: () => void;
  onDiscontinueClick?: () => void;
  onDeleteClick?: () => void;
}

function RowActions(props: RowActionProps) {
  return (
    <Group h="100%" align="center" justify="center" gap="sm">
      <Tooltip label="Status">
        <ActionIcon
          variant="subtle"
          size="md"
          radius="xl"
          disabled={props.status === "discontinued"}
          onClick={props.onStatusToggleClick}
        >
          {props.status === "active" ? <IconEye /> : <IconEyeOff />}
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Edit">
        <ActionIcon
          variant="subtle"
          size="md"
          radius="xl"
          onClick={props.onEditClick}
        >
          <IconEdit />
        </ActionIcon>
      </Tooltip>

      <Menu>
        <Menu.Target>
          <Tooltip label="More">
            <ActionIcon variant="subtle" size="md" radius="xl">
              <IconDotsVertical />
            </ActionIcon>
          </Tooltip>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            leftSection={<IconPackage size={14} />}
            onClick={props.onDiscontinueClick}
          >
            {props.status === "discontinued" ? "Relist" : "Discontinue"}
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={props.onDeleteClick}
          >
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}

export default InventoryRow;
