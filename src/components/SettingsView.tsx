import { useTheme } from "next-themes";
import { Monitor, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const themes = [
  { id: "system", label: "System", icon: Monitor },
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
] as const;

const SettingsView = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold font-display text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your preferences.</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5 max-w-md">
        <h3 className="font-display text-sm font-medium text-foreground mb-1">Appearance</h3>
        <p className="text-xs text-muted-foreground mb-4">Choose your preferred theme.</p>
        <div className="grid grid-cols-3 gap-2">
          {themes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-md border px-3 py-3 text-xs font-medium transition-colors",
                theme === id
                  ? "border-accent bg-accent/10 text-accent-foreground"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
