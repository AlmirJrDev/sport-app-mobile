export interface PickedImage {
    uri: string;
    name: string;
    type: string;
    file?: unknown;
}

export async function pickImage(): Promise<PickedImage | null> {
    return new Promise((resolve) => {
        const input = document.createElement("input");

        input.type = "file";
        input.accept = "image/*";
        input.style.display = "none";

        input.onchange = () => {
            const file = input.files?.[0] ?? null;

            document.body.removeChild(input);

            if (!file) {
                resolve(null);

                return;
            }

            resolve({
                uri: URL.createObjectURL(file),
                name: file.name,
                type: file.type || "image/jpeg",
                file,
            });
        };

        document.body.appendChild(input);
        input.click();
    });
}
