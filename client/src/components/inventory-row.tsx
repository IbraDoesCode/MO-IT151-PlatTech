import {
  AspectRatio,
  Card,
  Grid,
  GridCol,
  Group,
  Image,
  Text,
} from "@mantine/core";

interface InventoryRowProps {
  id: string;
  imageUrl: string;
  name: string;
  description: string;
  category: string;
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
      <Grid>
        <GridCol span={1}>
          <AspectRatio ratio={1 / 1}>
            <Image src={props.imageUrl} fit="contain" h={70} />
          </AspectRatio>
        </GridCol>

        <GridCol span={3.5}>
          <Group align="center">
            <Text size="md" fw={500}>
              {props.name}
            </Text>
          </Group>
        </GridCol>

        <GridCol span={3}>
          <Group align="center">
            <Text c="dimmed" size="sm" lineClamp={3}>
              {props.description}
            </Text>
          </Group>
        </GridCol>

        <GridCol span={1.5}>
          <Group align="center">
            <Text className="capitalize">{props.category}</Text>
          </Group>
        </GridCol>

        <GridCol span={1.5}>
          <Group justify="center">{curr.format(props.price)}</Group>
        </GridCol>

        <GridCol span={1.5}>
          <Group justify="center">{props.stock}</Group>
        </GridCol>
      </Grid>
    </Group>
  );
}

export default InventoryRow;
