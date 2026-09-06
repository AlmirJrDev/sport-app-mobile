export async function shareInvite(texto: string): Promise<boolean> {
    if (typeof navigator !== "undefined" && navigator.share) {
        try {
            await navigator.share({ text: texto });

            return true;
        } catch {
            return false;
        }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(texto);

            return true;
        } catch {
            return false;
        }
    }

    return false;
}
