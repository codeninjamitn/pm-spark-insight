import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Monitor, Sun, Moon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const themes = [
  { id: "system", label: "System", icon: Monitor },
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
] as const;

const SettingsView = () => {
  const { theme, setTheme } = useTheme();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? "");
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (data?.full_name) setFullName(data.full_name);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);
      if (error) toast.error("Failed to update profile");
      else toast.success("Profile updated");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold font-display text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your preferences.</p>
      </div>

      {/* Profile */}
      <div className="bg-card border border-border rounded-lg p-5 max-w-md">
        <h3 className="font-display text-sm font-medium text-foreground mb-1">Profile</h3>
        <p className="text-xs text-muted-foreground mb-4">Your account information.</p>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" value={email} disabled className="opacity-60" />
            </div>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {saving && <Loader2 className="w-3 h-3 animate-spin mr-1.5" />}
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Appearance */}
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
