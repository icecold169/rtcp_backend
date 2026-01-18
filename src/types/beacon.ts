export interface BeaconRequest {
  id: string
}

export interface BeaconResponse {
  command: string | null
  interval: number
}
