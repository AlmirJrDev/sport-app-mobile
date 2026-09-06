import { useEffect, useRef, useState } from "react";
import {
    Image,
    PanResponder,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { colors, radius, spacing, type } from "../design/tokens";
import type { PickedImage } from "./pickImage";

export const HAS_CROPPER = true;

const BOX = 260;
const OUT = 512;
const ZOOM_STEP = 0.2;
const ZOOM_MAX = 4;

interface CropperProps {
    image: PickedImage;
    onCancel: () => void;
    onDone: (recortada: PickedImage) => void;
}

export function AvatarCropper({ image, onCancel, onDone }: CropperProps) {
    const [natural, setNatural] = useState<{ w: number; h: number } | null>(
        null,
    );
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const offsetRef = useRef(offset);
    const inicioRef = useRef(offset);
    const zoomRef = useRef(zoom);
    const naturalRef = useRef(natural);

    offsetRef.current = offset;
    zoomRef.current = zoom;
    naturalRef.current = natural;

    useEffect(() => {
        const elemento = new window.Image();

        elemento.onload = () => {
            setNatural({ w: elemento.naturalWidth, h: elemento.naturalHeight });
        };

        elemento.src = image.uri;
    }, [image.uri]);

    const escalaBase = natural
        ? BOX / Math.min(natural.w, natural.h)
        : 1;
    const escala = escalaBase * zoom;
    const larguraExibida = natural ? natural.w * escala : BOX;
    const alturaExibida = natural ? natural.h * escala : BOX;

    const limitar = (valor: { x: number; y: number }) => {
        const minX = BOX - larguraExibida;
        const minY = BOX - alturaExibida;

        return {
            x: Math.min(0, Math.max(minX, valor.x)),
            y: Math.min(0, Math.max(minY, valor.y)),
        };
    };

    const pan = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                inicioRef.current = offsetRef.current;
            },
            onPanResponderMove: (_evento, gesto) => {
                const atual = naturalRef.current;

                if (!atual) {
                    return;
                }

                const base = BOX / Math.min(atual.w, atual.h);
                const escalaAtual = base * zoomRef.current;
                const largura = atual.w * escalaAtual;
                const altura = atual.h * escalaAtual;

                const bruto = {
                    x: inicioRef.current.x + gesto.dx,
                    y: inicioRef.current.y + gesto.dy,
                };

                setOffset({
                    x: Math.min(0, Math.max(BOX - largura, bruto.x)),
                    y: Math.min(0, Math.max(BOX - altura, bruto.y)),
                });
            },
        }),
    ).current;

    useEffect(() => {
        if (natural) {
            setOffset((atual) => limitar(atual));
        }
    }, [natural, zoom]);

    const ajustarZoom = (delta: number) => {
        setZoom((atual) => Math.min(ZOOM_MAX, Math.max(1, atual + delta)));
    };

    const recortar = async () => {
        if (!natural) {
            return;
        }

        const elemento = new window.Image();

        elemento.src = image.uri;
        await elemento.decode();

        const canvas = document.createElement("canvas");

        canvas.width = OUT;
        canvas.height = OUT;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
            onDone(image);

            return;
        }

        const lado = BOX / escala;

        ctx.drawImage(
            elemento,
            -offset.x / escala,
            -offset.y / escala,
            lado,
            lado,
            0,
            0,
            OUT,
            OUT,
        );

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    onDone(image);

                    return;
                }

                const arquivo = new File([blob], "avatar.jpg", {
                    type: "image/jpeg",
                });

                onDone({
                    uri: URL.createObjectURL(blob),
                    name: "avatar.jpg",
                    type: "image/jpeg",
                    file: arquivo,
                });
            },
            "image/jpeg",
            0.9,
        );
    };

    return (
        <View style={styles.fundo}>
            <View style={styles.painel}>
                <Text style={[type.headlineSm, styles.titulo]}>
                    Ajuste a foto
                </Text>
                <Text style={[type.caption, styles.dica]}>
                    Arraste para enquadrar e use o zoom.
                </Text>

                <View style={styles.caixa} {...pan.panHandlers}>
                    <Image
                        source={{ uri: image.uri }}
                        style={{
                            position: "absolute",
                            left: offset.x,
                            top: offset.y,
                            width: larguraExibida,
                            height: alturaExibida,
                        }}
                    />
                    <View style={styles.mascara} pointerEvents="none" />
                </View>

                <View style={styles.zoom}>
                    <Pressable
                        style={styles.zoomBotao}
                        onPress={() => ajustarZoom(-ZOOM_STEP)}
                    >
                        <Text style={[type.statMd, styles.zoomTexto]}>−</Text>
                    </Pressable>

                    <Text style={[type.label, styles.zoomRotulo]}>
                        {Math.round(zoom * 100)}%
                    </Text>

                    <Pressable
                        style={styles.zoomBotao}
                        onPress={() => ajustarZoom(ZOOM_STEP)}
                    >
                        <Text style={[type.statMd, styles.zoomTexto]}>+</Text>
                    </Pressable>
                </View>

                <View style={styles.acoes}>
                    <Pressable style={styles.secundario} onPress={onCancel}>
                        <Text style={[type.label, styles.secundarioTexto]}>
                            Cancelar
                        </Text>
                    </Pressable>

                    <Pressable style={styles.principal} onPress={recortar}>
                        <Text style={[type.label, styles.principalTexto]}>
                            Usar esta foto
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    fundo: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.lg,
        backgroundColor: "rgba(32, 21, 21, 0.6)",
        zIndex: 20,
    },
    painel: {
        width: "100%",
        maxWidth: 340,
        alignItems: "center",
        gap: spacing.md,
        padding: spacing.xl,
        borderRadius: radius.md,
        backgroundColor: colors.canvas,
    },
    titulo: {
        color: colors.ink,
    },
    dica: {
        color: colors.body,
        textAlign: "center",
    },
    caixa: {
        width: BOX,
        height: BOX,
        overflow: "hidden",
        borderRadius: radius.sm,
        backgroundColor: colors.canvasSoft,
    },
    mascara: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: BOX / 2,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    zoom: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.lg,
    },
    zoomBotao: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.ink,
    },
    zoomTexto: {
        color: colors.ink,
    },
    zoomRotulo: {
        minWidth: 56,
        textAlign: "center",
        color: colors.body,
    },
    acoes: {
        flexDirection: "row",
        gap: spacing.sm,
        alignSelf: "stretch",
    },
    secundario: {
        flex: 1,
        alignItems: "center",
        paddingVertical: spacing.md,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.ink,
    },
    secundarioTexto: {
        color: colors.ink,
    },
    principal: {
        flex: 1,
        alignItems: "center",
        paddingVertical: spacing.md,
        borderRadius: radius.sm,
        backgroundColor: colors.primary,
    },
    principalTexto: {
        color: colors.onPrimary,
    },
});
