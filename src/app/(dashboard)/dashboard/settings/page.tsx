import { SettingsClient } from "./settings-client"

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                <p className="text-muted-foreground">
                    Configure your terminal preferences. These settings are saved locally on this device.
                </p>
            </div>

            <SettingsClient />
        </div>
    )
}
