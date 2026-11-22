export const EQUIPMENT = [
  { id: "dumbbells", label: "Dumbbells", icon: "🏋️" },
  { id: "barbell", label: "Barbell + plates", icon: "🏋️" },
  { id: "squat_rack", label: "Squat / power rack", icon: "🔲" },
  { id: "smith_machine", label: "Smith machine", icon: "🔳" },
  { id: "cable_machine", label: "Cable station", icon: "🎚️" },
  { id: "bench", label: "Adjustable bench", icon: "🪑" },
  { id: "flat_bench", label: "Flat bench", icon: "🪑" },
  { id: "kettlebell", label: "Kettlebells", icon: "🔔" },
  { id: "bands", label: "Resistance bands", icon: "➰" },
  { id: "pullup_bar", label: "Pull-up bar", icon: "🧗" },
  { id: "dip_station", label: "Dip station", icon: "🪜" },
  { id: "suspension", label: "TRX / suspension", icon: "🪢" },
  { id: "leg_press", label: "Leg press", icon: "🦵" },
  { id: "leg_extension", label: "Leg extension", icon: "🦵" },
  { id: "leg_curl", label: "Leg curl", icon: "🦵" },
  { id: "lat_pulldown", label: "Lat pulldown", icon: "⬇️" },
  { id: "row_machine", label: "Seated row machine", icon: "↔️" },
  { id: "chest_press", label: "Chest press machine", icon: "➡️" },
  { id: "shoulder_press", label: "Shoulder press machine", icon: "⬆️" },
  { id: "medicine_ball", label: "Medicine ball", icon: "⚽" },
  { id: "step_box", label: "Plyo box / step", icon: "📦" },
] as const;

export type EquipmentId = (typeof EQUIPMENT)[number]["id"];
export const EQUIPMENT_IDS = EQUIPMENT.map((e) => e.id) as EquipmentId[];

export type GymInventory = {
  items: EquipmentId[];
  /** Heaviest dumbbell available, in lbs (null = unknown). */
  maxDumbbellLbs: number | null;
  notes?: string;
};

export function equipmentLabel(id: EquipmentId) {
  return EQUIPMENT.find((e) => e.id === id)?.label ?? id;
}
