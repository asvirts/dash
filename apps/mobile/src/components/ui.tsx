import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type ScrollViewProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { C, R, matchColor } from "@/lib/theme";

export function Screen({ children, footer, ...rest }: ScrollViewProps & { footer?: ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ padding: 16, paddingBottom: footer ? 140 : 48, gap: 12 }}
        {...rest}
      >
        {children}
      </ScrollView>
      {footer && <View style={s.footer}>{footer}</View>}
    </View>
  );
}

export function Title({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={s.title}>{children}</Text>
      {sub ? <Text style={[s.mute, { marginTop: 4 }]}>{sub}</Text> : null}
    </View>
  );
}

export function Label({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
      <Text style={s.label}>{children}</Text>
      {right}
    </View>
  );
}

export function Card({ children, style, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  if (onPress)
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [s.card, pressed && { opacity: 0.7 }, style]}>
        {children}
      </Pressable>
    );
  return <View style={[s.card, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress?: PressableProps["onPress"];
  variant?: "primary" | "outline" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const v = {
    primary: { bg: C.lime, fg: C.bg, border: C.lime },
    outline: { bg: "transparent", fg: C.lime, border: C.lime },
    ghost: { bg: C.panel, fg: C.ink, border: C.line },
    danger: { bg: "transparent", fg: C.rose, border: C.rose },
  }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: v.bg, borderColor: v.border, opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={v.fg} /> : <Text style={[s.btnText, { color: v.fg }]}>{title}</Text>}
    </Pressable>
  );
}

export function Chip({ label, active, onPress, dot }: { label: string; active?: boolean; onPress?: () => void; dot?: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, active ? { borderColor: C.lime, backgroundColor: "rgba(200,245,60,0.12)" } : null]}
    >
      <Text style={{ color: active ? C.ink : C.mute, fontSize: 14 }} numberOfLines={1}>
        {label}
      </Text>
      {dot ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} /> : null}
    </Pressable>
  );
}

export function MatchPill({ match }: { match: number }) {
  const c = matchColor(match);
  return (
    <View style={{ backgroundColor: c + "26", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
      <Text style={{ color: c, fontWeight: "700", fontSize: 12, fontVariant: ["tabular-nums"] }}>{match}%</Text>
    </View>
  );
}

export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor={C.mute} selectionColor={C.lime} {...props} style={[s.input, props.style]} />;
}

export function Notice({ children, tone = "lime" }: { children: ReactNode; tone?: "lime" | "amber" | "rose" }) {
  const c = C[tone];
  return (
    <View style={{ backgroundColor: c + "1a", borderRadius: R.md, padding: 12 }}>
      <Text style={{ color: c, fontSize: 14, lineHeight: 20 }}>{children}</Text>
    </View>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: C.panel2, overflow: "hidden" }}>
      <View style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`, height: "100%", backgroundColor: C.lime }} />
    </View>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <Text style={[s.mute, { textAlign: "center", paddingVertical: 24 }]}>{children}</Text>;
}

export const s = StyleSheet.create({
  title: { color: C.ink, fontSize: 30, fontWeight: "700", letterSpacing: -0.5 },
  h2: { color: C.ink, fontSize: 17, fontWeight: "600" },
  body: { color: C.ink, fontSize: 15 },
  mute: { color: C.mute, fontSize: 14, lineHeight: 20 },
  mono: { color: C.ink, fontSize: 14, fontVariant: ["tabular-nums"], fontFamily: "Menlo" } as TextStyle,
  label: { color: C.mute, fontSize: 12, fontWeight: "700", letterSpacing: 1.2, textTransform: "uppercase" },
  card: { backgroundColor: C.panel, borderColor: C.line, borderWidth: 1, borderRadius: R.lg, padding: 14 },
  btn: { borderWidth: 1, borderRadius: R.md, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  btnText: { fontSize: 16, fontWeight: "700" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.panel,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  input: {
    backgroundColor: C.panel,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: R.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: C.ink,
    fontSize: 16,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 34,
    backgroundColor: C.bg + "f2",
    borderTopColor: C.line,
    borderTopWidth: 1,
    gap: 10,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
});
