import type { PropsWithChildren } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    type StyleProp,
    type TextInputProps,
    type ViewStyle,
} from "react-native";

import { useTheme, useThemedStyles } from "./theme";
import {
    radius,
    size,
    spacing,
    type,
    type Palette,
} from "./tokens";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "text";

interface ButtonProps {
    label: string;
    onPress: () => void;
    variant?: ButtonVariant;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}

export function Button({
    label,
    onPress,
    variant = "primary",
    disabled = false,
    style,
}: ButtonProps) {
    const styles = useThemedStyles(criarEstilos);

    return (
        <Pressable
            style={[
                styles.button,
                variant === "primary" && styles.buttonPrimary,
                variant === "secondary" && styles.buttonSecondary,
                variant === "tertiary" && styles.buttonTertiary,
                variant === "text" && styles.buttonText,
                disabled && styles.buttonDisabled,
                style,
            ]}
            disabled={disabled}
            onPress={onPress}
        >
            <Text
                style={[
                    variant === "text" ? type.labelCampo : type.botao,
                    variant === "primary" || variant === "secondary"
                        ? styles.labelOnDark
                        : styles.labelOnLight,
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
}

interface FieldProps extends TextInputProps {
    label: string;
    error?: string;
}

export function Field({ label, error, ...rest }: FieldProps) {
    const { colors } = useTheme();
    const styles = useThemedStyles(criarEstilos);
    return (
        <View style={styles.field}>
            <Text style={[type.labelCampo, styles.fieldLabel]}>{label}</Text>

            <TextInput
                style={[type.valorCampo, styles.input]}
                placeholderTextColor={colors.mute}
                {...rest}
            />

            {error ? (
                <Text style={[type.caption, styles.error]}>{error}</Text>
            ) : null}
        </View>
    );
}

export function Card({
    children,
    style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
    const styles = useThemedStyles(criarEstilos);

    return <View style={[styles.card, style]}>{children}</View>;
}

export function Eyebrow({ children }: PropsWithChildren) {
    const styles = useThemedStyles(criarEstilos);
    return <Text style={[type.eyebrow, styles.eyebrow]}>{children}</Text>;
}

const criarEstilos = (c: Palette) =>
    StyleSheet.create({
    button: {
        minHeight: size.cta,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.xl,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: "transparent",
    },
    buttonPrimary: {
        backgroundColor: c.primary,
    },
    buttonSecondary: {
        backgroundColor: c.ink,
    },
    buttonTertiary: {
        backgroundColor: "transparent",
        borderColor: c.chipBorder,
    },
    buttonText: {
        backgroundColor: "transparent",
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
    },
    buttonDisabled: {
        backgroundColor: c.canvasSoft,
        borderColor: c.line,
    },
    labelOnDark: {
        color: c.onPrimary,
    },
    labelOnLight: {
        color: c.ink,
    },
    field: {
        gap: spacing.sm,
    },
    fieldLabel: {
        color: c.mute,
    },
    input: {
        minHeight: size.input,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderWidth: 1,
        borderColor: c.line,
        borderRadius: radius.sm,
        backgroundColor: c.canvasSoft,
        color: c.ink,
    },
    error: {
        color: c.primary,
    },
    card: {
        padding: spacing.xl,
        borderRadius: radius.md,
        backgroundColor: c.canvasSoft,
    },
    eyebrow: {
        color: c.primary,
    },
});
