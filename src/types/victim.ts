export interface Victim {
  id: string
  firstSeen: string
  lastSeen: string
  country: string
  userAgent: string
  status: "online" | "offline"
}
