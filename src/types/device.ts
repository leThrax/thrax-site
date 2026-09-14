export interface DeviceSpec {
  label: string
  value: string
}

export interface ModelCredit {
  creator: string
  sourceUrl: string
  license?: string
}

export interface Device {
  id: string
  name: string
  specs: DeviceSpec[]
  modelUrl?: string
  modelCredit?: ModelCredit
}
