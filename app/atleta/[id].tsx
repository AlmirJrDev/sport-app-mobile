import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { colors, radius, spacing, type } from "../../src/design/tokens";
import { getProfile, type Profile } from "../../src/profile/remote";
import { profileText } from "../../src/share/invite";
import { shareInvite } from "../../src/share/share";

export default function AtletaScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [perfil, setPerfil] = useState<Profile | null>(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        getProfile(id).then((encontrado) => {
            setPerfil(encontrado);
            setCarregando(false);
        });
    }, [id]);

    if (carregando) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator color={colors.ink} />
            </View>
        );
    }

    if (!perfil) {
        return (
            <View style={styles.centro}>
                <Text style={[type.headlineSm, styles.titulo]}>
                    Atleta não encontrado
                </Text>
                <Text style={[type.bodySm, styles.texto]}>
                    O link pode estar errado, ou o perfil saiu do ar.
                </Text>
            </View>
        );
    }

    const iniciais = perfil.name
        .split(" ")
        .slice(0, 2)
        .map((parte) => parte.slice(0, 1))
        .join("")
        .toUpperCase();

    const etiquetas = [
        perfil.mainSport,
        perfil.city,
        perfil.height
            ? `${(perfil.height / 100).toFixed(2).replace(".", ",")} m`
            : null,
        perfil.weight ? `${perfil.weight} kg` : null,
    ].filter((item): item is string => Boolean(item));

    return (
        <ScrollView contentContainerStyle={styles.conteudo}>
            <View style={styles.capa}>
                {perfil.avatarUrl ? (
                    <Image
                        source={{ uri: perfil.avatarUrl }}
                        style={styles.foto}
                    />
                ) : (
                    <View style={[styles.foto, styles.fotoVazia]}>
                        <Text style={[type.statLg, styles.iniciais]}>
                            {iniciais || "?"}
                        </Text>
                    </View>
                )}

                <Text style={[type.headlineMd, styles.nome]}>
                    {perfil.name || "Atleta"}
                </Text>

                {perfil.bio ? (
                    <Text style={[type.caption, styles.bio]}>{perfil.bio}</Text>
                ) : null}

                {etiquetas.length > 0 ? (
                    <View style={styles.etiquetas}>
                        {etiquetas.map((tag) => (
                            <View key={tag} style={styles.etiqueta}>
                                <Text style={[type.label, styles.etiquetaTexto]}>
                                    {tag}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : null}
            </View>

            <Pressable
                style={styles.compartilhar}
                onPress={() =>
                    shareInvite(profileText(perfil.name || "Atleta", perfil.id))
                }
            >
                <Text style={[type.label, styles.compartilharTexto]}>
                    Compartilhar este perfil
                </Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    conteudo: {
        padding: spacing.lg,
        gap: spacing.lg,
    },
    centro: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xl,
        gap: spacing.sm,
    },
    titulo: {
        color: colors.ink,
    },
    texto: {
        color: colors.body,
        textAlign: "center",
    },
    capa: {
        alignItems: "center",
        gap: spacing.sm,
        padding: spacing.xl,
        borderRadius: radius.md,
        backgroundColor: colors.canvasSoft,
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
        backgroundColor: colors.canvas,
    },
    iniciais: {
        color: colors.primary,
    },
    nome: {
        color: colors.ink,
        marginTop: spacing.xs,
    },
    bio: {
        color: colors.body,
        textAlign: "center",
    },
    etiquetas: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    etiqueta: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: colors.canvas,
    },
    etiquetaTexto: {
        color: colors.body,
    },
    compartilhar: {
        alignItems: "center",
        paddingVertical: spacing.md,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.ink,
    },
    compartilharTexto: {
        color: colors.ink,
    },
});
