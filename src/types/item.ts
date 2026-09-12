export type IconRef =
  | { kind: 'simple-icons'; slug: string }
  | { kind: 'custom'; url: string; tint?: string }

export interface InstallCommand {
  manager: string
  command: string
}

export interface TechItem {
  id: string
  name: string
  tags: string[]
  icon: IconRef
  description?: string
  url?: string
  category?: string
  installCommands: InstallCommand[]
}
