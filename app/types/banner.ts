export type BannerType = "alert" | "info" | "warning";

export interface Banner {
  id: number;
  title: string;
  description: string | null;
  type: BannerType;
  visible: string[];
  created_at: string;
  updated_at: string;
}

export type BannersPayload = Banner[];
