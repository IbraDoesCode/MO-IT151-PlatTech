import { Group, Stack } from "@mantine/core";
import { useState } from "react";
import ImageHolder from "./image-holder";

interface ImageGalleryProps {
  images: string[];
}

function ImageGallery(props: ImageGalleryProps) {
  const [currentImage, setCurrentImage] = useState(props.images[0]);

  return (
    <Stack>
      <ImageHolder image={currentImage} height={420} />
      <Group className="w-full">
        {props.images.map((image, idx) => (
          <Group
            key={idx}
            className={`cursor-pointer ${
              currentImage === image ? " brightness-90" : ""
            }`}
            onMouseOver={() => setCurrentImage(image)}
          >
            <ImageHolder image={image} height={60} />
          </Group>
        ))}
      </Group>
    </Stack>
  );
}

export default ImageGallery;
