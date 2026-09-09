import { useEffect, useState } from "react";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { listSports, prettify, type Sport } from "../src/api/catalog";
import { useSession } from "../src/auth/useSession";
import { Stripes } from "../src/design/pieces";
import { useTheme, useThemedStyles } from "../src/design/theme";
import {
    radius,
    size,
    spacing,
    type,
    type Palette,
} from "../src/design/tokens";
import { Button, Field } from "../src/design/ui";
import { AvatarCropper, HAS_CROPPER } from "../src/profile/cropper";
import { pickImage, type PickedImage } from "../src/profile/pickImage";
import { getMyProfile, updateProfile } from "../src/profile/remote";

const TOTAL = 3;

export default function OnboardingScreen() {
    const { colors } = useTheme();
    const styles = useThemedStyles(criarEstilos);
    const router = useRouter();
    const { novo } = useLocalSearchParams<{ novo?: string }>();
    const { account, loading, reload } = useSession();

    /** ?novo=1 mostra o fluxo como quem acabou de criar conta vê. */
    const simulandoNovo = novo === "1";

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [passo, setPasso] = useState(1);
    const [jaTinhaPerfil, setJaTinhaPerfil] = useState(false);

    const [foto, setFoto] = useState<PickedImage | null>(null);
    const [fotoAtual, setFotoAtual] = useState<string | null>(null);
    const [recortando, setRecortando] = useState<PickedImage | null>(null);
    const [perfilId, setPerfilId] = useState<string | null>(null);
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

        Promise.all([getMyProfile(), listSports().catch(() => [])])
            .then(([perfil, lista]) => {
                setEsportes(lista);

                if (perfil) {
                    setPerfilId(perfil.id);
                }

                if (perfil && !simulandoNovo) {
                    const partes = perfil.name.split(" ");

                    setNome(partes[0] ?? "");
                    setSobrenome(partes.slice(1).join(" "));
                    setBio(perfil.bio ?? "");
                    setAltura(perfil.height ? String(perfil.height) : "");
                    setPeso(perfil.weight ? String(perfil.weight) : "");
                    setFotoAtual(perfil.avatarUrl);
                    setJaTinhaPerfil(
                        Boolean(
                            perfil.avatarUrl ||
                                perfil.bio ||
                                perfil.height ||
                                perfil.mainSport,
                        ),
                    );
                }

                setCarregando(false);
            })
            .catch(() => setCarregando(false));
    }, [account?.id]);

    if (loading) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator color={colors.ink} />
            </View>
        );
    }

    if (!account) {
        return <Redirect href="/entrar" />;
    }

    if (carregando) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator color={colors.ink} />
            </View>
        );
    }

    if (recortando) {
        return (
            <AvatarCropper
                image={recortando}
                onCancel={() => setRecortando(null)}
                onDone={(recortada) => {
                    setFoto(recortada);
                    setRecortando(null);
                }}
            />
        );
    }

    const escolherFoto = async () => {
        const escolhida = await pickImage();

        if (!escolhida) {
            return;
        }

        if (HAS_CROPPER) {
            setRecortando(escolhida);
        } else {
            setFoto(escolhida);
        }
    };

    const sair = () => {
        if (simulandoNovo) {
            router.back();

            return;
        }

        if (jaTinhaPerfil) {
            router.back();
        } else {
            router.replace("/");
        }
    };

    const salvar = async () => {
        const alvo = perfilId ?? account.id;

        if (!alvo || alvo === "sem-id") {
            setErro(
                "A API não informou o seu id nesta sessão. Saia e entre de novo.",
            );

            return;
        }

        setSalvando(true);
        setErro(null);

        try {
            await updateProfile(
                alvo,
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
            sair();
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

    const titulos = [
        jaTinhaPerfil ? "Sua foto" : "Bora colocar uma foto?",
        "Seu esporte",
        "Sobre você",
    ];

    const legendas = [
        "É por ela que o pessoal te reconhece na quadra.",
        "O que você mais joga. Dá para mudar depois.",
        "Nada aqui é obrigatório — preencha o que quiser mostrar.",
    ];

    return (
        <ScrollView contentContainerStyle={styles.conteudo}>
            <View style={styles.cabecalho}>
                <Text style={[type.eyebrow, styles.contador]}>
                    Passo {passo} de {TOTAL}
                </Text>
                <Text style={[type.tituloPasso, styles.titulo]}>
                    {titulos[passo - 1]}
                </Text>
                <Text style={[type.corpo, styles.legenda]}>
                    {legendas[passo - 1]}
                </Text>

                <View style={styles.trilha}>
                    {[1, 2, 3].map((item) => (
                        <View
                            key={item}
                            style={[
                                styles.marca,
                                item <= passo && styles.marcaAtiva,
                            ]}
                        />
                    ))}
                </View>
            </View>

            {passo === 1 ? (
                <View style={styles.fotoBloco}>
                    {previa ? (
                        <Image source={{ uri: previa }} style={styles.foto} />
                    ) : (
                        <Stripes
                            caption="sem foto"
                            style={styles.foto}
                            rounded={75}
                        />
                    )}

                    <Pressable style={styles.contorno} onPress={escolherFoto}>
                        <Text style={[type.label, styles.contornoTexto]}>
                            {previa ? "Trocar foto" : "Escolher foto"}
                        </Text>
                    </Pressable>
                </View>
            ) : null}

            {passo === 2 ? (
                esportes.length > 0 ? (
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
                ) : (
                    <Text style={[type.caption, styles.aviso]}>
                        Não deu para carregar a lista de esportes agora. Você
                        pode escolher depois, no seu perfil.
                    </Text>
                )
            ) : null}

            {passo === 3 ? (
                <View style={styles.campos}>
                    <Field label="Nome" value={nome} onChangeText={setNome} />

                    <Field
                        label="Sobrenome"
                        value={sobrenome}
                        onChangeText={setSobrenome}
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

                    <Field
                        label="Bio"
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Uma linha sobre você"
                        multiline
                    />
                </View>
            ) : null}

            {simulandoNovo ? (
                <Text style={[type.caption, styles.aviso]}>
                    Prévia de como quem acaba de criar conta vê esta tela. Seus
                    dados atuais não foram carregados, e salvar aqui só grava o
                    que você preencher.
                </Text>
            ) : null}

            {erro ? (
                <Text style={[type.caption, styles.erro]}>{erro}</Text>
            ) : null}

            <View style={styles.rodape}>
                {passo < TOTAL ? (
                    <Button
                        label="Continuar"
                        onPress={() => setPasso(passo + 1)}
                    />
                ) : (
                    <Button
                        label={salvando ? "Salvando…" : "Salvar perfil"}
                        disabled={salvando}
                        onPress={salvar}
                    />
                )}

                <View style={styles.secundarias}>
                    {passo > 1 ? (
                        <Pressable
                            onPress={() => setPasso(passo - 1)}
                            hitSlop={8}
                        >
                            <Text style={[type.label, styles.linkForte]}>
                                Voltar
                            </Text>
                        </Pressable>
                    ) : (
                        <View />
                    )}

                    <Pressable onPress={sair} hitSlop={8}>
                        <Text style={[type.label, styles.link]}>
                            {jaTinhaPerfil ? "Cancelar" : "Deixar para depois"}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}

const criarEstilos = (c: Palette) =>
    StyleSheet.create({
    conteudo: {
        padding: spacing.lg,
        paddingBottom: spacing.xxxl,
        gap: spacing.xl,
    },
    centro: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xl,
    },
    cabecalho: {
        gap: spacing.xs,
    },
    contador: {
        color: c.primary,
    },
    titulo: {
        color: c.ink,
    },
    legenda: {
        color: c.body,
    },
    trilha: {
        flexDirection: "row",
        gap: 6,
        marginTop: spacing.md,
    },
    marca: {
        flex: 1,
        height: 4,
        borderRadius: radius.pill,
        backgroundColor: c.line,
    },
    marcaAtiva: {
        backgroundColor: c.primary,
    },
    fotoBloco: {
        alignItems: "center",
        gap: spacing.lg,
    },
    foto: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 2,
        borderColor: c.primary,
    },
    contorno: {
        height: 50,
        justifyContent: "center",
        paddingHorizontal: spacing.xl,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: c.ink,
    },
    contornoTexto: {
        color: c.ink,
    },
    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
    },
    chip: {
        height: size.onboardingChip,
        justifyContent: "center",
        paddingHorizontal: spacing.xl,
        borderRadius: 23,
        borderWidth: 1,
        borderColor: c.line,
    },
    chipAtivo: {
        borderColor: "transparent",
        backgroundColor: c.primary,
    },
    chipTexto: {
        color: c.body,
    },
    chipTextoAtivo: {
        color: c.onPrimary,
    },
    aviso: {
        color: c.body,
    },
    campos: {
        gap: spacing.md,
    },
    linha: {
        flexDirection: "row",
        gap: spacing.md,
    },
    metade: {
        flex: 1,
    },
    erro: {
        color: c.primary,
    },
    rodape: {
        gap: spacing.lg,
    },
    secundarias: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    link: {
        color: c.bodyMid,
    },
    linkForte: {
        color: c.ink,
    },
});
