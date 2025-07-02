import { Card, Text } from "@mantine/core";
import ImageHolder from "./image-holder";
// import { motion } from "motion/react";

interface ProductCardProps {
  id: string;
  imageUrl: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

function ProductCard(props: ProductCardProps) {
  return (
    <Card style={{ overflow: "visible" }}>
      <Card.Section className="mb-4">
        <ImageHolder image={props.imageUrl} />
      </Card.Section>
      <Text fw={500}>{props.name}</Text>
      <Text c="dimmed" className="capitalize">
        {props.category}
      </Text>
      <Text size="lg" fw={500}>
        ₱{props.price}
      </Text>
    </Card>
  );
}

export default ProductCard;
