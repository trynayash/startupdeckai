import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { OllamaSettings } from "@shared/schema";

const settingsSchema = z.object({
  endpoint: z.string().url("Please enter a valid URL"),
  model: z.string().min(1, "Please select a model"),
  autoSave: z.boolean(),
});

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: OllamaSettings;
  onSave: (settings: OllamaSettings) => void;
  availableModels: Array<{ name: string; size: number }>;
}

export function SettingsModal({
  open,
  onClose,
  settings,
  onSave,
  availableModels,
}: SettingsModalProps) {
  const [selectedModel, setSelectedModel] = useState(settings.model);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      endpoint: settings.endpoint,
      model: settings.model,
      autoSave: settings.autoSave,
    },
  });

  useEffect(() => {
    form.reset({
      endpoint: settings.endpoint,
      model: settings.model,
      autoSave: settings.autoSave,
    });
    setSelectedModel(settings.model);
  }, [settings, form]);

  const onSubmit = (values: z.infer<typeof settingsSchema>) => {
    onSave(values);
    onClose();
  };

  const defaultModels = [
    { name: "llama3.2", displayName: "Llama 3.2 (3B)" },
    { name: "mistral", displayName: "Mistral 7B" },
    { name: "deepseek-r1", displayName: "DeepSeek-R1" },
    { name: "phi3", displayName: "Phi-3 Mini" },
  ];

  // Combine available models with defaults
  const allModels = [
    ...defaultModels,
    ...availableModels
      .filter(m => !defaultModels.some(dm => dm.name === m.name))
      .map(m => ({ name: m.name, displayName: m.name }))
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="endpoint">Ollama Endpoint</Label>
            <Input
              id="endpoint"
              {...form.register("endpoint")}
              placeholder="http://localhost:11434"
              className="mt-1"
            />
            {form.formState.errors.endpoint && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.endpoint.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="model">Model</Label>
            <Select
              value={selectedModel}
              onValueChange={(value) => {
                setSelectedModel(value);
                form.setValue("model", value);
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {allModels.map((model) => (
                  <SelectItem key={model.name} value={model.name}>
                    {model.displayName || model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.model && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.model.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="autoSave">Auto-save generations</Label>
            <Switch
              id="autoSave"
              checked={form.watch("autoSave")}
              onCheckedChange={(checked) => form.setValue("autoSave", checked)}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-blue-600">
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
