import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import GameMap from "../src/components/GameMap";
import {
    listModalities,
    listSports,
    prettify,
    type Modality,
    type Sport,
} from "../src/api/catalog";
import { useTheme, useThemedStyles } from "../src/design/theme";
import {
    font,
    radius,
    size,
    spacing,
    type,
    type Palette,
} from "../src/design/tokens";
import { FALLBACK_CENTER } from "../src/games/mock";
import { createGame } from "../src/games/service";
import {
    DURATIONS,
    MODALITIES,
    SKILL_LABEL,
    SPORTS,
    type Coordinates,
    type SkillLevel,
} from "../src/games/types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
});

function nextHalfHour(): string {
    const now = new Date();

    now.setMinutes(now.getMinutes() + 30 - (now.getMinutes() % 30), 0, 0);

    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function parseTime(value: string): { hours: number; minutes: number } | null {
    const match = value.match(/^(\d{1,2}):(\d{2})$/);

    if (!match) {
        return null;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (hours > 23 || minutes > 59) {
        return null;
    }

    return { hours, minutes };
}

function composeStart(dayOffset: number, time: string): Date | null {
    const parsed = parseTime(time);

    if (!parsed) {
        return null;
    }

    const date = new Date();

    date.setDate(date.getDate() + dayOffset);
    date.setHours(parsed.hours, parsed.minutes, 0, 0);

    return date;
}

interface OptionRowProps {
    label: string;
    options: string[];
    selected: string;
    onSelect: (value: string) => void;
}

function OptionRow({ label, options, selected, onSelect }: OptionRowProps) {
    const { colors } = useTheme();
    const styles = useThemedStyles(criarEstilos);
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.options}>
                {options.map((option) => (
                    <Pressable
                        key={option}
                        style={[
                            styles.option,
                            option === selected && styles.optionSelected,
                        ]}
                        onPress={() => onSelect(option)}
                    >
                        <Text
                            style={[
                                styles.optionLabel,
                                option === selected && styles.optionLabelSelected,
                            ]}
                        >
                            {option}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

export default function NewGameScreen() {
    const { colors } = useTheme();
    const styles = useThemedStyles(criarEstilos);
    const router = useRouter();
    const { lat, lng } = useLocalSearchParams<{ lat: string; lng: string }>();

    const initialPoint: Coordinates = {
        latitude: Number(lat) || FALLBACK_CENTER.latitude,
        longitude: Number(lng) || FALLBACK_CENTER.longitude,
    };

    const [point, setPoint] = useState<Coordinates>(initialPoint);
    const [sports, setSports] = useState<Sport[]>([]);
    const [modalities, setModalities] = useState<Modality[]>([]);
    const [sportId, setSportId] = useState("");
    const [modalityId, setModalityId] = useState("");
    const [offline, setOffline] = useState(false);
    const [sport, setSport] = useState(SPORTS[0]);
    const [modality, setModality] = useState(MODALITIES[SPORTS[0]][0]);
    const [placeName, setPlaceName] = useState("");
    const [dayOffset, setDayOffset] = useState(0);
    const [time, setTime] = useState(nextHalfHour());
    const [durationMinutes, setDurationMinutes] = useState(90);
    const [level, setLevel] = useState<SkillLevel>("intermediario");
    const [spots, setSpots] = useState("10");
    const [visibilidade, setVisibilidade] = useState("Todo mundo");
    const [atrasado, setAtrasado] = useState("Não pode");
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        listSports()
            .then(async (list) => {
                if (!active || list.length === 0) {
                    return;
                }

                setSports(list);
                setSportId(list[0].id);
                setSport(prettify(list[0].description));

                const mods = await listModalities(list[0].id);

                if (active && mods.length > 0) {
                    setModalities(mods);
                    setModalityId(mods[0].id);
                    setModality(mods[0].description);
                }
            })
            .catch(() => {
                if (active) {
                    setOffline(true);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    const startsAt = composeStart(dayOffset, time);
    const isPast = startsAt !== null && startsAt.getTime() < Date.now();
    const canSave =
        placeName.trim().length > 0 && startsAt !== null && !isPast && !saving;

    const handleSelectSport = async (value: string) => {
        if (offline) {
            setSport(value);
            setModality(MODALITIES[value][0]);
            return;
        }

        const chosen = sports.find((one) => prettify(one.description) === value);

        if (!chosen) {
            return;
        }

        setSport(value);
        setSportId(chosen.id);
        setModalities([]);
        setModality("");
        setModalityId("");

        const mods = await listModalities(chosen.id);

        setModalities(mods);

        if (mods.length > 0) {
            setModality(mods[0].description);
            setModalityId(mods[0].id);
        }
    };

    const handleSelectModality = (value: string) => {
        setModality(value);

        const chosen = modalities.find((one) => one.description === value);

        if (chosen) {
            setModalityId(chosen.id);
        }
    };

    const sportOptions = offline
        ? SPORTS
        : sports.map((one) => prettify(one.description));

    const modalityOptions = offline
        ? MODALITIES[sport] ?? []
        : modalities.map((one) => one.description);

    const handleSave = async () => {
        if (!startsAt) {
            return;
        }

        setSaving(true);
        setNotice(null);

        const { fallbackReason } = await createGame(
            {
                sport,
                modality,
                placeName: placeName.trim(),
                startsAt: startsAt.toISOString(),
                durationMinutes,
                level,
                spots: Math.max(2, Number(spots) || 10),
                coordinates: point,
                isPublic: visibilidade === "Todo mundo",
                allowJoinAfterStart: atrasado === "Pode",
            },
            { sportId, modalityId },
        );

        if (fallbackReason) {
            setSaving(false);
            setNotice(
                `Não deu para salvar na API (${fallbackReason}). Marquei como jogo de demonstração, só neste aparelho.`,
            );
            return;
        }

        router.back();
    };

    return (
        <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.field}>
                <Text style={styles.label}>Onde vai ser</Text>

                <View style={styles.mapBox}>
                    <GameMap
                        center={initialPoint}
                        games={[]}
                        selectedGameId={null}
                        onSelectGame={() => {}}
                        onClearSelection={() => {}}
                        onCenterChange={setPoint}
                    />

                    <View style={styles.crosshair} pointerEvents="none">
                        <View style={styles.crosshairPin} />
                    </View>
                </View>

                <Text style={styles.hint}>
                    Arraste o mapa até o alvo ficar em cima da quadra.
                </Text>
            </View>

            <OptionRow
                label="Esporte"
                options={sportOptions}
                selected={sport}
                onSelect={handleSelectSport}
            />

            <OptionRow
                label="Modalidade"
                options={modalityOptions}
                selected={modality}
                onSelect={handleSelectModality}
            />

            <View style={styles.field}>
                <Text style={styles.label}>Local</Text>
                <TextInput
                    style={styles.input}
                    value={placeName}
                    onChangeText={setPlaceName}
                    placeholder="Quadra do Taquaral"
                    placeholderTextColor={colors.mute}
                />
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Quando</Text>

                <View style={styles.options}>
                    {[
                        { offset: 0, label: "Hoje" },
                        { offset: 1, label: "Amanhã" },
                        { offset: 2, label: "Depois de amanhã" },
                    ].map((day) => (
                        <Pressable
                            key={day.offset}
                            style={[
                                styles.option,
                                day.offset === dayOffset && styles.optionSelected,
                            ]}
                            onPress={() => setDayOffset(day.offset)}
                        >
                            <Text
                                style={[
                                    styles.optionLabel,
                                    day.offset === dayOffset &&
                                        styles.optionLabelSelected,
                                ]}
                            >
                                {day.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <View style={styles.timeRow}>
                    <TextInput
                        style={[styles.input, styles.timeInput]}
                        value={time}
                        onChangeText={setTime}
                        placeholder="19:30"
                        placeholderTextColor={colors.mute}
                        keyboardType="numbers-and-punctuation"
                        maxLength={5}
                    />

                    <Text style={styles.hint}>
                        {startsAt === null
                            ? "Hora inválida — use HH:MM"
                            : isPast
                              ? "Esse horário já passou"
                              : dateFormatter.format(startsAt)}
                    </Text>
                </View>
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Duração</Text>

                <View style={styles.options}>
                    {DURATIONS.map((option) => (
                        <Pressable
                            key={option.minutes}
                            style={[
                                styles.option,
                                option.minutes === durationMinutes &&
                                    styles.optionSelected,
                            ]}
                            onPress={() => setDurationMinutes(option.minutes)}
                        >
                            <Text
                                style={[
                                    styles.optionLabel,
                                    option.minutes === durationMinutes &&
                                        styles.optionLabelSelected,
                                ]}
                            >
                                {option.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <Text style={styles.hint}>
                    {startsAt === null
                        ? "Defina a hora para calcular o fim."
                        : `Some do mapa 30 min depois de terminar, às ${timeFormatter.format(
                              new Date(
                                  startsAt.getTime() +
                                      (durationMinutes + 30) * 60 * 1000,
                              ),
                          )}.`}
                </Text>
            </View>

            <OptionRow
                label="Nível"
                options={Object.values(SKILL_LABEL)}
                selected={SKILL_LABEL[level]}
                onSelect={(value) => {
                    const found = (
                        Object.keys(SKILL_LABEL) as SkillLevel[]
                    ).find((key) => SKILL_LABEL[key] === value);

                    if (found) {
                        setLevel(found);
                    }
                }}
            />

            <View style={styles.field}>
                <Text style={styles.label}>Vagas</Text>
                <TextInput
                    style={styles.input}
                    value={spots}
                    onChangeText={setSpots}
                    keyboardType="number-pad"
                />
            </View>

            <OptionRow
                label="Quem vê"
                options={["Todo mundo", "Só com o link"]}
                selected={visibilidade}
                onSelect={setVisibilidade}
            />

            <Text style={styles.hint}>
                Só com o link, o jogo some das listas e do mapa dos outros.
            </Text>

            <OptionRow
                label="Entrar atrasado"
                options={["Não pode", "Pode"]}
                selected={atrasado}
                onSelect={setAtrasado}
            />

            <Text style={styles.hint}>
                Se puder, alguém ainda consegue confirmar presença depois do
                horário de início.
            </Text>

            {notice ? <Text style={styles.notice}>{notice}</Text> : null}

            <Pressable
                style={[styles.save, !canSave && styles.saveDisabled]}
                disabled={!canSave}
                onPress={handleSave}
            >
                <Text style={styles.saveLabel}>
                    {saving ? "Marcando…" : "Marcar jogo"}
                </Text>
            </Pressable>
        </ScrollView>
    );
}

const criarEstilos = (c: Palette) =>
    StyleSheet.create({
    content: {
        padding: spacing.xl,
        paddingBottom: spacing.xxxl,
        gap: spacing.xxl,
    },
    field: {
        gap: 8,
    },
    label: {
        ...type.labelCampo,
        color: c.mute,
    },
    hint: {
        ...type.metadado,
        color: c.mute,
    },
    mapBox: {
        height: 180,
        borderRadius: radius.md,
        overflow: "hidden",
        backgroundColor: c.canvasSoft,
    },
    crosshair: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    crosshairPin: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 3,
        borderColor: c.canvas,
        backgroundColor: c.primary,
    },
    options: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    option: {
        height: size.formChip,
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: c.line,
    },
    optionSelected: {
        borderColor: "transparent",
        backgroundColor: c.primary,
    },
    optionLabel: {
        ...type.labelCampo,
        color: c.body,
    },
    optionLabelSelected: {
        ...type.labelCampo,
        color: c.onPrimary,
    },
    input: {
        ...type.valorCampo,
        minHeight: size.input,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: c.line,
        backgroundColor: c.canvasSoft,
        color: c.ink,
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    timeInput: {
        ...type.statCard,
        width: 104,
        textAlign: "center",
        borderWidth: 1.5,
        borderColor: c.primary,
        backgroundColor: c.canvas,
    },
    notice: {
        ...type.bodySm,
        color: c.primary,
    },
    save: {
        minHeight: size.cta,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.sm,
        backgroundColor: c.primary,
    },
    saveDisabled: {
        backgroundColor: c.canvasSoft,
    },
    saveLabel: {
        ...type.botao,
        color: c.onPrimary,
    },
});
