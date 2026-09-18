import { useState } from 'react'
import { motion } from 'motion/react'
import { useDevices } from '../hooks/useDevices'
import { DeviceScene } from '../components/hardware/DeviceScene'
import { sectionVariants } from '../lib/motionVariants'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function HardwarePage() {
  useDocumentTitle('thrax-site — Hardware')
  const { devices, loading, error } = useDevices()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedDevice = devices.find((d) => d.id === selectedId) ?? devices[0]

  return (
    <motion.div variants={sectionVariants} className="flex flex-col gap-4">
      <h1 className="font-mono text-xs font-semibold tracking-wide text-muted uppercase">
        <span className="text-accent">❯</span> Hardware
      </h1>

      {loading ? (
        <p className="font-mono text-sm text-muted">
          $ loading devices<span className="terminal-cursor text-accent">_</span>
        </p>
      ) : error ? (
        <p className="font-mono text-sm text-red-400">Couldn't load devices: {error}</p>
      ) : devices.length === 0 ? (
        <p className="font-mono text-sm text-muted">
          <span className="text-accent">❯</span> no devices added yet
        </p>
      ) : selectedDevice ? (
        <>
          <div className="flex flex-wrap gap-2">
            {devices.map((device) => (
              <button
                key={device.id}
                type="button"
                aria-pressed={device.id === selectedDevice.id}
                onClick={() => setSelectedId(device.id)}
                className={
                  device.id === selectedDevice.id
                    ? 'rounded border border-accent bg-accent/10 px-2 py-1 font-mono text-xs text-accent transition-colors'
                    : 'rounded border border-border px-2 py-1 font-mono text-xs text-muted transition-colors hover:border-accent-2 hover:text-fg'
                }
              >
                --{device.id}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-2">
              {selectedDevice.modelUrl ? (
                <DeviceScene key={selectedDevice.id} modelUrl={selectedDevice.modelUrl} />
              ) : (
                <div className="flex h-full min-h-128 w-full items-center justify-center rounded-md border border-border bg-bg">
                  <p className="font-mono text-sm text-muted">No 3D model uploaded yet.</p>
                </div>
              )}
              {selectedDevice.modelCredit && (
                <p className="font-mono text-xs text-muted">
                  3D model by{' '}
                  <a
                    href={selectedDevice.modelCredit.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    {selectedDevice.modelCredit.creator}
                  </a>{' '}
                  — via Sketchfab{selectedDevice.modelCredit.license ? ` (${selectedDevice.modelCredit.license})` : ''}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4">
              <p className="font-mono text-sm font-medium text-fg">{selectedDevice.name}</p>
              {selectedDevice.specs.length === 0 ? (
                <p className="font-mono text-xs text-muted">No specs listed yet.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {selectedDevice.specs.map((spec) => (
                    <li key={spec.label} className="font-mono text-xs">
                      <span className="text-accent">❯</span> <span className="text-muted">{spec.label}:</span>{' '}
                      <span className="text-fg">{spec.value}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      ) : null}
    </motion.div>
  )
}
