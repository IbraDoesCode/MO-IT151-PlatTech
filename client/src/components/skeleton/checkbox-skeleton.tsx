import { Group, Skeleton } from "@mantine/core";

function CheckboxSkeleton() {
  return (
    <Group className="w-full" gap="sm">
      <Skeleton height={20} width={20} radius="sm" />
      <Skeleton height={10} width="50%" />
      <Skeleton height={10} width="6%" />
    </Group>
  );
}

export default CheckboxSkeleton;
