import { useState } from "react";
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
import { colors, font, radius, spacing, type } from "../src/design/tokens";
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
    const router = useRouter();
    const { lat, lng } = useLocalSearchParams<{ lat: string; lng: string }>();

    const initialPoint: Coordinates = {
        latitude: Number(lat),
        longitude: Number(lng),
    };

    const [point, setPoint] = useState<Coordinates>(initialPoint);
    const [sport, setSport] = useState(SPORTS[0]);
    const [modality, setModality] = useState(MODALITIES[SPORTS[0]][0]);
    const [placeName, setPlaceName] = useState("");
    const [dayOffset, setDayOffset] = useState(0);
    const [time, setTime] = useState(nextHalfHour());
    const [durationMinutes, setDurationMinutes] = useState(90);
    const [level, setLevel] = useState<SkillLevel>("intermediario");
    const [spots, setSpots] = useState("10");
    const [saving, setSaving] = useState(false);

    const startsAt = composeStart(dayOffset, time);
    const isPast = startsAt !== null && startsAt.getTime() < Date.now();
    const canSave =
        placeName.trim().length > 0 && startsAt !== null && !isPast && !saving;

    const handleSelectSport = (value: string) => {
        setSport(value);
        setModality(MODALITIES[value][0]);
    };

    const handleSave = async () => {
        if (!startsAt) {
            return;
        }

        setSaving(true);

        await createGame({
            sport,
            modality,
            placeName: placeName.trim(),
            startsAt: startsAt.toISOString(),
            durationMinutes,
            level,
            spots: Math.max(2, Number(spots) || 10),
            coordinates: point,
        });

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
                options={SPORTS}
                selected={sport}
                onSelect={handleSelectSport}
            />

            <OptionRow
                label="Modalidade"
                options={MODALITIES[sport]}
                selected={modality}
                onSelect={setModality}
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

const styles = StyleSheet.create({
    content: {
        padding: 16,
        gap: 18,
    },
    field: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontFamily: font.semibold,
        color: colors.ink,
    },
    hint: {
        fontSize: 13,
        color: colors.body,
    },
    mapBox: {
        height: 220,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: colors.canvasSoft,
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
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 3,
        borderColor: "#fff",
        backgroundColor: "#1d4ed8",
    },
    options: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    option: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.mute,
    },
    optionSelected: {
        borderColor: "transparent",
        backgroundColor: colors.ink,
    },
    optionLabel: {
        ...type.bodySm,
        color: colors.body,
    },
    optionLabelSelected: {
        color: colors.onPrimary,
        fontFamily: font.semibold,
    },
    input: {
        ...type.bodyMd,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.ink,
        color: colors.ink,
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    timeInput: {
        width: 90,
        textAlign: "center",
    },
    save: {
        alignItems: "center",
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.primary,
    },
    saveDisabled: {
        backgroundColor: colors.mute,
    },
    saveLabel: {
        ...type.buttonMd,
        color: colors.onPrimary,
    },
});
