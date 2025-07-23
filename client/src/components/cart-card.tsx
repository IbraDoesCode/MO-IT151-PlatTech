import {
  Card,
  Grid,
  GridCol,
  Group,
  NumberInput,
  Stack,
  Text,
} from "@mantine/core";
import ImageHolder from "./image-holder";

interface CartCardProps {
  id: string;
  imageUrl: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  onQuantityChange: (val: number | string) => void;
}

function CartCard(props: CartCardProps) {
  const curr = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  });

  return (
    <Card radius="md" shadow="sm">
      <Grid>
        <GridCol span={1.5}>
          <Stack align="center">
            <ImageHolder image={props.imageUrl} width={70} darkBg />
          </Stack>
          {/* <AspectRatio ratio={1 / 1}>
            <Image
              src={props.imageUrl}
              fit="contain"
              h={70}
              className="flex-none"
            />
          </AspectRatio> */}
        </GridCol>

        <GridCol span={4.5}>
          <Stack gap={2} h="100%" justify="center">
            <Text size="md" fw={500}>
              {props.name}
            </Text>
            <Text c="dimmed" size="sm" className="capitalize">
              {props.category}
            </Text>
          </Stack>
        </GridCol>

        <GridCol span={2}>
          <Group justify="center" h="100%" align="center">
            {curr.format(props.price)}
          </Group>
        </GridCol>

        <GridCol span={2}>
          <Group justify="center" h="100%" align="center">
            <NumberInput
              w={80}
              defaultValue={props.quantity}
              allowDecimal={false}
              allowNegative={false}
              min={0}
              onChange={props.onQuantityChange}
            />
          </Group>
        </GridCol>

        <GridCol span={2}>
          <Group justify="center" h="100%" align="center">
            {curr.format(props.quantity * props.price)}
          </Group>
        </GridCol>
      </Grid>
    </Card>
  );
}

export default CartCard;
