import type { PickedImage } from "./pickImage";

export const HAS_CROPPER = false;

interface CropperProps {
    image: PickedImage;
    onCancel: () => void;
    onDone: (recortada: PickedImage) => void;
}

/** No celular o recorte já acontece no editor do sistema, via expo-image-picker. */
export function AvatarCropper(_props: CropperProps) {
    return null;
}
