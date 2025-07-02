import { AspectRatio, Card, Skeleton } from "@mantine/core";

function ProductCardSkeleton() {
  return (
    <Card style={{ overflow: "visible" }}>
      <Card.Section className="mb-4">
        <AspectRatio ratio={1 / 1} className="rounded-lg bg-[#f7f7f7]">
          <Skeleton height="100%" width="100%" />
        </AspectRatio>
      </Card.Section>
      <Skeleton height={10} width="70%" className="mt-[12.5px]" />
      <Skeleton height={10} width="45%" className="mt-[12.5px]" />
      <Skeleton height={10} width="25%" className="mt-[14.5px]" />
    </Card>
  );
}

export default ProductCardSkeleton;
