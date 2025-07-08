import { ActionIcon, Button, Card, Stack, Text } from "@mantine/core";
import ImageHolder from "./image-holder";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";

interface ProductCardProps {
  id: string;
  imageUrl: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  cartButton?: boolean;
  onCartClick?: () => void;
  favoritesButton?: boolean;
  isFavorite?: boolean;
  onFavoriteClick?: () => void;
}

function ProductCard(props: ProductCardProps) {
  return (
    <Card
      style={{ overflow: "visible" }}
      radius="md"
      shadow="sm"
      className="h-full"
    >
      <Card.Section className="mb-4">
        <Stack pos="relative">
          <ImageHolder image={props.imageUrl} />
          {props.favoritesButton && (
            <ActionIcon
              variant="subtle"
              pos="absolute"
              radius="xl"
              size="lg"
              className="right-1.5 top-1.5 z-10"
              onClick={(e) => {
                e.preventDefault();
                if (props.onFavoriteClick) props.onFavoriteClick();
              }}
            >
              {props.isFavorite ? <IconHeartFilled /> : <IconHeart />}
            </ActionIcon>
          )}
        </Stack>
      </Card.Section>

      <Stack gap={0} className="flex-1">
        <Text fw={500}>{props.name}</Text>
        <Text c="dimmed" className="capitalize">
          {props.category}
        </Text>
        <Text size="lg" fw={500}>
          ₱{props.price}
        </Text>
      </Stack>

      {props.cartButton && (
        <Card.Section className="px-3 mt-2 pb-3">
          <Button
            // variant="outline"
            fullWidth
            size="sm"
            radius="lg"
            className="flex-none"
            onClick={(e) => {
              e.preventDefault();
              if (props.onCartClick) props.onCartClick();
            }}
          >
            Add to Cart
          </Button>
        </Card.Section>
      )}
    </Card>
  );
}

export default ProductCard;
