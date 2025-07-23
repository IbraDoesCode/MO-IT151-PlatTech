import { AspectRatio, Image } from "@mantine/core";
import { useState } from "react";
import { motion } from "motion/react";

interface ImageHolderProps {
  image: string;
  height?: number;
  width?: number;
  darkBg?: boolean;
}

function ImageHolder(props: ImageHolderProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <AspectRatio
      ratio={1 / 1}
      mah={400}
      className={`overflow-hidden flex-none rounded-lg ${
        props.darkBg ? "bg-[#f7f7f7]" : "bg-white"
      } `}
    >
      <Image
        component={motion.img}
        src={props.image}
        fit="contain"
        h={props.height}
        w={props.width}
        className="flex-none mix-blend-multiply"
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
        onLoad={() => setLoaded(true)}
      />
    </AspectRatio>
  );
}

export default ImageHolder;
