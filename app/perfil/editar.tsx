import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useSession } from "../../src/auth/useSession";
import { listSports, prettify, type Sport } from "../../src/api/catalog";
import { colors, radius, spacing, type } from "../../src/design/tokens";
import { Button, Field } from "../../src/design/ui";
import { pickImage, type PickedImage } from "../../src/profile/pickImage";
import { getProfile, updateProfile } from "../../src/profile/remote";

export default function EditarPerfilScreen() {
    const router = useRouter();
    const { account, reload } = useSession();

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const [foto, setFoto] = useState<PickedImage | null>(null);
    const [fotoAtual, setFotoAtual] = useState<string | null>(null);
    const [nome, setNome] = useState("");
    const [sobrenome, setSobrenome] = useState("");
    const [bio, setBio] = useState("");
    const [altura, setAltura] = useState("");
    const [peso, setPeso] = useState("");
    const [esporte, setEsporte] = useState<string | null>(null);
    const [esportes, setEsportes] = useState<Sport[]>([]);

    useEffect(() => {
        if (!account) {
            return;
        }

        Promise.all([getProfile(account.id), listSports().catch(() => [])])
            .then(([perfil, lista]) => {
                setEsportes(lista);

                if (perfil) {
                    const partes = perfil.name.split(" ");

                    setNome(partes[0] ?? "");
                    setSobrenome(partes.slice(1).join(" "));
                    setBio(perfil.bio ?? "");
                    setAltura(perfil.height ? String(perfil.height) : "");
                    setPeso(perfil.weight ? String(perfil.weight) : "");
                    setFotoAtual(perfil.avatarUrl);
                }

                setCarregando(false);
            })
            .catch(() => setCarregando(false));
    }, [account?.id]);

    if (carregando) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator color={colors.ink} />
            </View>
        );
    }

    const escolherFoto = async () => {
        const escolhida = await pickImage();

        if (escolhida) {
            setFoto(escolhida);
        }
    };

    const salvar = async () => {
        if (!account) {
            return;
        }

        setSalvando(true);
        setErro(null);

        try {
            await updateProfile(
                account.id,
                {
                    firstName: nome.trim() || undefined,
                    lastName: sobrenome.trim() || undefined,
                    bio: bio.trim() || undefined,
                    height: altura ? Number(altura) : undefined,
                    weight: peso ? Number(peso.replace(",", ".")) : undefined,
                    mainSportId: esporte ?? undefined,
                },
                foto,
            );

            reload();
            router.back();
        } catch (raw) {
            setErro(
                raw instanceof Error
                    ? raw.message
                    : "Não deu para salvar o perfil.",
            );
            setSalvando(false);
        }
    };

    const previa = foto?.uri ?? fotoAtual;

    return (
        <ScrollView contentContainerStyle={styles.conteudo}>
            <View style={styles.fotoBloco}>
                {previa ? (
                    <Image source={{ uri: previa }} style={styles.foto} />
                ) : (
                    <View style={[styles.foto, styles.fotoVazia]}>
                        <Text style={[type.label, styles.fotoVaziaTexto]}>
                            sem foto
                        </Text>
                    </View>
                )}

                <Pressable style={styles.trocar} onPress={escolherFoto}>
                    <Text style={[type.label, styles.trocarTexto]}>
                        {previa ? "Trocar foto" : "Escolher foto"}
                    </Text>
                </Pressable>
            </View>

            <Field
                label="Nome"
                value={nome}
                onChangeText={setNome}
                placeholder="Como te chamam"
            />

            <Field
                label="Sobrenome"
                value={sobrenome}
                onChangeText={setSobrenome}
                placeholder="Sobrenome"
            />

            <Field
                label="Bio"
                value={bio}
                onChangeText={setBio}
                placeholder="Uma linha sobre você"
                multiline
            />

            <View style={styles.linha}>
                <View style={styles.metade}>
                    <Field
                        label="Altura (cm)"
                        value={altura}
                        onChangeText={setAltura}
                        placeholder="180"
                        keyboardType="number-pad"
                    />
                </View>

                <View style={styles.metade}>
                    <Field
                        label="Peso (kg)"
                        value={peso}
                        onChangeText={setPeso}
                        placeholder="75"
                        keyboardType="decimal-pad"
                    />
                </View>
            </View>

            {esportes.length > 0 ? (
                <View style={styles.esportes}>
                    <Text style={[type.bodySmStrong, styles.rotulo]}>
                        Esporte principal
                    </Text>

                    <View style={styles.chips}>
                        {esportes.map((item) => (
                            <Pressable
                                key={item.id}
                                style={[
                                    styles.chip,
                                    esporte === item.id && styles.chipAtivo,
                                ]}
                                onPress={() =>
                                    setEsporte(
                                        esporte === item.id ? null : item.id,
                                    )
                                }
                            >
                                <Text
                                    style={[
                                        type.label,
                                        esporte === item.id
                                            ? styles.chipTextoAtivo
                                            : styles.chipTexto,
                                    ]}
                                >
                                    {prettify(item.description)}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            ) : null}

            {erro ? <Text style={[type.caption, styles.erro]}>{erro}</Text> : null}

            <Button
                label={salvando ? "Salvando…" : "Salvar perfil"}
                disabled={salvando}
                onPress={salvar}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    conteudo: {
        padding: spacing.lg,
        paddingBottom: spacing.xxxl,
        gap: spacing.lg,
    },
    centro: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xl,
    },
    fotoBloco: {
        alignItems: "center",
        gap: spacing.md,
    },
    foto: {
        width: 112,
        height: 112,
        borderRadius: radius.pill,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    fotoVazia: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.canvasSoft,
        borderColor: colors.mute,
    },
    fotoVaziaTexto: {
        color: colors.bodyMid,
    },
    trocar: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.ink,
    },
    trocarTexto: {
        color: colors.ink,
    },
    linha: {
        flexDirection: "row",
        gap: spacing.md,
    },
    metade: {
        flex: 1,
    },
    esportes: {
        gap: spacing.sm,
    },
    rotulo: {
        color: colors.ink,
    },
    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
    },
    chip: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.mute,
    },
    chipAtivo: {
        borderColor: "transparent",
        backgroundColor: colors.ink,
    },
    chipTexto: {
        color: colors.body,
    },
    chipTextoAtivo: {
        color: colors.onPrimary,
    },
    erro: {
        color: colors.primary,
    },
});
