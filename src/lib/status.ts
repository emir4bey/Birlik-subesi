export type AppStatus = "BEKLEMEDE" | "INCELENIYOR" | "KABUL_EDILDI" | "REDDEDILDI";

export const STATUS_LABEL: Record<AppStatus, string> = {
  BEKLEMEDE: "Beklemede",
  INCELENIYOR: "İnceleniyor",
  KABUL_EDILDI: "Kabul Edildi",
  REDDEDILDI: "Red Edildi",
};

export const STATUS_CLASS: Record<AppStatus, string> = {
  BEKLEMEDE: "border-mute text-mute",
  INCELENIYOR: "border-signal text-signal",
  KABUL_EDILDI: "border-olivebright text-olivebright",
  REDDEDILDI: "border-danger text-danger",
};
