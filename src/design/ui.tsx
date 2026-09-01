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

import { colors, radius, spacing, type } from "./tokens";

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
                    variant === "text" ? type.buttonSm : type.buttonMd,
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
            <Text style={[type.bodySmStrong, styles.fieldLabel]}>{label}</Text>

            <TextInput
                style={[type.bodyMd, styles.input]}
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
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: radius.md,
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
        backgroundColor: colors.canvas,
        borderColor: colors.ink,
    },
    buttonText: {
        backgroundColor: "transparent",
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
    },
    buttonDisabled: {
        backgroundColor: colors.mute,
        borderColor: "transparent",
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
        color: colors.ink,
    },
    input: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderWidth: 1,
        borderColor: colors.ink,
        borderRadius: radius.sm,
        backgroundColor: colors.canvas,
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
        color: colors.body,
    },
});
