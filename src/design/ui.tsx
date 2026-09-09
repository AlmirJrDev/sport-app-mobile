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

import { colors, radius, size, spacing, type } from "./tokens";

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
    return <View style={[styles.card, style]}>{children}</View>;
}

export function Eyebrow({ children }: PropsWithChildren) {
    return <Text style={[type.eyebrow, styles.eyebrow]}>{children}</Text>;
}

const styles = StyleSheet.create({
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
        backgroundColor: colors.primary,
    },
    buttonSecondary: {
        backgroundColor: colors.ink,
    },
    buttonTertiary: {
        backgroundColor: "transparent",
        borderColor: colors.chipBorder,
    },
    buttonText: {
        backgroundColor: "transparent",
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
    },
    buttonDisabled: {
        backgroundColor: colors.canvasSoft,
        borderColor: colors.line,
    },
    labelOnDark: {
        color: colors.onPrimary,
    },
    labelOnLight: {
        color: colors.ink,
    },
    field: {
        gap: spacing.sm,
    },
    fieldLabel: {
        color: colors.mute,
    },
    input: {
        minHeight: size.input,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: radius.sm,
        backgroundColor: colors.canvasSoft,
        color: colors.ink,
    },
    error: {
        color: colors.primary,
    },
    card: {
        padding: spacing.xl,
        borderRadius: radius.md,
        backgroundColor: colors.canvasSoft,
    },
    eyebrow: {
        color: colors.primary,
    },
});
