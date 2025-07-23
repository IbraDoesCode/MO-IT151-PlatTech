import { ActionIcon, Box, Group, Image, Stack, Text } from "@mantine/core";
import {
  Dropzone,
  MIME_TYPES,
  type DropzoneProps,
  type FileWithPath,
} from "@mantine/dropzone";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";

interface ImageUpladProps extends DropzoneProps {
  files: FileWithPath[];
  onRemoveFile: (file: FileWithPath) => void;
}

function ImageUpload(props: ImageUpladProps) {
  const previews = props.files.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return (
      <Box pos="relative">
        <ActionIcon
          pos="absolute"
          top={4}
          right={4}
          variant="light"
          radius="xl"
          color="white"
          size="sm"
          onClick={() => props.onRemoveFile(file)}
        >
          <IconX />
        </ActionIcon>
        <Image
          key={index}
          src={imageUrl}
          onLoad={() => URL.revokeObjectURL(imageUrl)}
          h={80}
          w={80}
          radius="md"
        />
      </Box>
    );
  });

  return (
    <Stack>
      <Dropzone
        accept={[MIME_TYPES.png, MIME_TYPES.jpeg]}
        maxFiles={4}
        maxSize={5 * 1024 ** 2}
        {...props}
      >
        <Group
          justify="center"
          gap="md"
          mih={140}
          style={{ pointerEvents: "none" }}
        >
          <Dropzone.Accept>
            <IconUpload
              size={52}
              color="var(--mantine-color-blue-6)"
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto
              size={52}
              color="var(--mantine-color-dimmed)"
              stroke={1.5}
            />
          </Dropzone.Idle>

          <div>
            <Text size="md" inline>
              Drag images here or click to select files
            </Text>
            <Text size="xs" c="dimmed" inline mt={7}>
              Attach up to 4 files, each file should not exceed 5mb
            </Text>
          </div>
        </Group>
      </Dropzone>
      <Group gap="sm">{previews}</Group>
    </Stack>
  );
}

export default ImageUpload;
