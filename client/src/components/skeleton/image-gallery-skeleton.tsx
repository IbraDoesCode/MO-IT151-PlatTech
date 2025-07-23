import { AspectRatio, Skeleton, Stack } from "@mantine/core";

function ImageGallerySkeleton() {
  return (
    <Stack h={476}>
      <AspectRatio ratio={1 / 1} mah={400} className="rounded-lg">
        <Skeleton height={420} />
      </AspectRatio>
    </Stack>
  );
}

export default ImageGallerySkeleton;
