export type VenueComponentType = "SECTION" | "TABLE" | "STAGE" | "TEXT";

export type VenueComponent = {
  id: string;
  type: VenueComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
  props: {
    name?: string;
    rows?: number;
    cols?: number;
    seatCount?: number;
    label?: string;
    text?: string;
  };
};

export type VenueLayout = {
  canvasWidth: number;
  canvasHeight: number;
  components: VenueComponent[];
};

export const SIDEBAR_ITEM_TYPES = {
  SECTION: "SECTION",
  TABLE: "TABLE",
  STAGE: "STAGE",
  TEXT: "TEXT",
} as const;

export const DEFAULT_COMPONENTS: Record<
  VenueComponentType,
  Omit<VenueComponent, "id" | "x" | "y">
> = {
  SECTION: {
    type: "SECTION",
    width: 200,
    height: 200,
    props: { name: "Section", rows: 10, cols: 10 },
  },
  TABLE: {
    type: "TABLE",
    width: 80,
    height: 80,
    props: { name: "Table", seatCount: 8 },
  },
  STAGE: {
    type: "STAGE",
    width: 200,
    height: 60,
    props: { label: "Stage" },
  },
  TEXT: {
    type: "TEXT",
    width: 120,
    height: 32,
    props: { text: "Label" },
  },
};
