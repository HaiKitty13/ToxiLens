import { FileText, Layers, MapPin, Users } from 'lucide-react';
import { METADATA_VARIANTS, MODES, type ModelCategory } from '@/config/modes';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import type { PredictionMode } from '@/types/api';

interface ModelSelectorProps {
  category: ModelCategory;
  onCategoryChange: (category: ModelCategory) => void;
  metadataVariant: PredictionMode;
  onVariantChange: (variant: PredictionMode) => void;
  disabled?: boolean;
}

/** Two-level model picker: category (text-only / metadata) → variant (full / domicile-only). */
export function ModelSelector({ category, onCategoryChange, metadataVariant, onVariantChange }: ModelSelectorProps) {
  const activeMode = MODES[category === 'text-only' ? 'text-only' : metadataVariant];

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Model type</p>
        <SegmentedControl
          ariaLabel="Model type"
          value={category}
          onChange={onCategoryChange}
          options={[
            { value: 'text-only', label: 'Text-Only', icon: FileText },
            { value: 'metadata', label: 'Metadata-Based', icon: Users },
          ]}
        />
      </div>

      {category === 'metadata' && (
        <div className="animate-fade-in space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Metadata variant</p>
          <SegmentedControl
            ariaLabel="Metadata variant"
            value={metadataVariant}
            onChange={onVariantChange}
            options={METADATA_VARIANTS.map((id) => ({
              value: id,
              label: MODES[id].shortLabel,
              icon: id === 'metadata-full' ? Layers : MapPin,
            }))}
          />
        </div>
      )}

      <p className="rounded-lg bg-accent px-3 py-2 text-sm text-accent-foreground">
        <span className="font-medium">{activeMode.label}.</span> {activeMode.description}
      </p>
    </div>
  );
}
