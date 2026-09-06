import * as ImagePicker from "expo-image-picker";

export interface PickedImage {
    uri: string;
    name: string;
    type: string;
    file?: unknown;
}

export async function pickImage(): Promise<PickedImage | null> {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
        return null;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
    });

    if (resultado.canceled || resultado.assets.length === 0) {
        return null;
    }

    const asset = resultado.assets[0];

    return {
        uri: asset.uri,
        name: asset.fileName ?? "avatar.jpg",
        type: asset.mimeType ?? "image/jpeg",
    };
}
