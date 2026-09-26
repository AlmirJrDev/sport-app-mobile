import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useTheme, useThemedStyles } from "../design/theme";
import { radius, spacing, type, type Palette } from "../design/tokens";

interface CaixaMotivoProps {
    titulo: string;
    explicacao: string;
    motivos: string[];
    rotuloEnviar: string;
    onCancelar: () => void;
    onEnviar: (motivo: string, detalhe: string) => Promise<void>;
}

/** Caixa de motivo usada pela denúncia de jogo e pelo bloqueio de pessoa. */
export default function CaixaMotivo({
    titulo,
    explicacao,
    motivos,
    rotuloEnviar,
    onCancelar,
    onEnviar,
}: CaixaMotivoProps) {
    const { colors } = useTheme();
    const styles = useThemedStyles(criarEstilos);

    const [motivo, setMotivo] = useState<string | null>(null);
    const [detalhe, setDetalhe] = useState("");
    const [erro, setErro] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);

    const enviar = async () => {
        if (!motivo) {
            return;
        }

        setErro(null);
        setEnviando(true);

        try {
            await onEnviar(motivo, detalhe);
        } catch (raw) {
            setErro(
                raw instanceof Error
                    ? raw.message
                    : "Não deu para enviar agora. Tente de novo.",
            );
            setEnviando(false);
        }
    };

    return (
        <View style={styles.caixa}>
            <Text style={[type.nomeLista, styles.titulo]}>{titulo}</Text>
            <Text style={[type.corpoSm, styles.texto]}>{explicacao}</Text>

            <View style={styles.motivos}>
                {motivos.map((item) => (
                    <Pressable
                        key={item}
                        style={[
                            styles.motivo,
                            item === motivo && styles.motivoAtivo,
                        ]}
                        onPress={() => setMotivo(item)}
                    >
                        <Text
                            style={[
                                type.labelCampo,
                                item === motivo
                                    ? styles.motivoTextoAtivo
                                    : styles.motivoTexto,
                            ]}
                        >
                            {item}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <TextInput
                style={[type.corpoSm, styles.campo]}
                value={detalhe}
                onChangeText={setDetalhe}
                placeholder="Conte o que aconteceu (opcional)"
                placeholderTextColor={colors.mute}
                multiline
                maxLength={1000}
            />

            {erro ? (
                <Text style={[type.corpoSm, styles.erro]}>{erro}</Text>
            ) : null}

            <View style={styles.botoes}>
                <Pressable
                    style={styles.voltar}
                    disabled={enviando}
                    onPress={onCancelar}
                >
                    <Text style={[type.labelCampo, styles.voltarTexto]}>
                        Cancelar
                    </Text>
                </Pressable>

                <Pressable
                    style={[styles.enviar, !motivo && styles.enviarTravado]}
                    disabled={!motivo || enviando}
                    onPress={enviar}
                >
                    <Text style={[type.labelCampo, styles.enviarTexto]}>
                        {enviando ? "Enviando…" : rotuloEnviar}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const criarEstilos = (c: Palette) =>
    StyleSheet.create({
        caixa: {
            gap: spacing.md,
            padding: spacing.lg,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: c.primary,
        },
        titulo: {
            color: c.ink,
        },
        texto: {
            color: c.body,
        },
        motivos: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
        },
        motivo: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: c.chipBorder,
        },
        motivoAtivo: {
            borderColor: "transparent",
            backgroundColor: c.ink,
        },
        motivoTexto: {
            color: c.body,
        },
        motivoTextoAtivo: {
            color: c.canvas,
        },
        campo: {
            minHeight: 72,
            padding: spacing.md,
            borderRadius: radius.sm,
            borderWidth: 1,
            borderColor: c.line,
            color: c.ink,
            textAlignVertical: "top",
        },
        erro: {
            color: c.primary,
        },
        botoes: {
            flexDirection: "row",
            gap: spacing.sm,
        },
        voltar: {
            flex: 1,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.sm,
            borderWidth: 1,
            borderColor: c.chipBorder,
        },
        voltarTexto: {
            color: c.ink,
        },
        enviar: {
            flex: 1,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.sm,
            backgroundColor: c.primary,
        },
        enviarTravado: {
            opacity: 0.5,
        },
        enviarTexto: {
            color: c.onPrimary,
        },
    });
