import { Marker } from "@maplibre/maplibre-react-native";
import { createContext, useId, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

export interface MarkerContextValue {
  coordinate: [number, number];
}

export const MarkerContext = createContext<MarkerContextValue | null>(null);

function anchorObjectToAnchorString(anchor: { x: number; y: number }) {
  const horizontal = anchor.x <= 0.25 ? "left" : anchor.x >= 0.75 ? "right" : "center";
  const vertical = anchor.y <= 0.25 ? "top" : anchor.y >= 0.75 ? "bottom" : "center";

  if (horizontal === "center" && vertical === "center") return "center";
  if (horizontal === "center") return vertical;
  if (vertical === "center") return horizontal;

  return `${vertical}-${horizontal}` as "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export type MapMarkerProps = {
  children?: ReactNode;
  label?: string;
  /** Anchor point for the marker (0.0 to 1.0). Default is center (0.5, 0.5) */
  anchor?: { x: number; y: number };
  /** Allow marker to overlap with other markers. MapLibre has no native equivalent -- documented as a no-op here (see MAP_CAPABILITIES on the Mapbox side, which honors it). */
  allowOverlap?: boolean;
  /** Callback when marker is pressed */
  onPress?: () => void;
} & (
  | { coordinate: [number, number]; longitude?: never; latitude?: never }
  | { longitude: number; latitude: number; coordinate?: never }
);

/** A native marker view pinned to a coordinate. Prefer `MapGeoJSON`/`MapClusterLayer` above ~100 markers. */
export function MapMarker({
  children,
  label,
  anchor = { x: 0.5, y: 0.5 },
  allowOverlap: _allowOverlap = false,
  onPress,
  ...positionProps
}: MapMarkerProps) {
  const id = useId();

  const coordinate: [number, number] =
    "coordinate" in positionProps && positionProps.coordinate
      ? positionProps.coordinate
      : [positionProps.longitude, positionProps.latitude];

  return (
    <MarkerContext value={{ coordinate }}>
      <Marker id={id} lngLat={coordinate} anchor={anchorObjectToAnchorString(anchor)}>
        <Pressable onPress={onPress}>
          <View style={markerStyles.row}>
            {children || <DefaultMarkerIcon />}
            {label && <MarkerLabel>{label}</MarkerLabel>}
          </View>
        </Pressable>
      </Marker>
    </MarkerContext>
  );
}

export type MarkerContentProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function MarkerContent({ children, style }: MarkerContentProps) {
  return <View style={[markerStyles.content, style]}>{children || <DefaultMarkerIcon />}</View>;
}

function DefaultMarkerIcon() {
  return <View style={markerStyles.icon} />;
}

export type MarkerLabelProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  position?: "top" | "bottom";
};

export function MarkerLabel({ children, style, textStyle, position = "top" }: MarkerLabelProps) {
  return (
    <View
      style={[
        markerStyles.label,
        position === "top" ? markerStyles.labelTop : markerStyles.labelBottom,
        style,
      ]}
    >
      <Text style={[markerStyles.labelText, textStyle]}>{children}</Text>
    </View>
  );
}

const markerStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#3b82f6",
    elevation: 5,
  },
  label: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: "-50%" }],
  },
  labelTop: {
    bottom: "100%",
    marginBottom: 4,
  },
  labelBottom: {
    top: "100%",
    marginTop: 4,
  },
  labelText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#111",
  },
});
