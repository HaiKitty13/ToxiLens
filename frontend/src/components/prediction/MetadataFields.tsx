
import type { MetadataFieldConfig } from '@/config/metadata';
import { SelectField } from '@/components/ui/SelectField';
import { cn } from '@/lib/utils';
import type { MetadataValues } from '@/types/api';

interface MetadataFieldsProps {
  fields: MetadataFieldConfig[];
  values: MetadataValues;
  errors: Record<string, string>;
  onChange: (key: string, value: string) => void;
  disabled?: boolean;
}

/** Renders whichever metadata fields the selected model variant needs. */
export function MetadataFields({
  fields,
  values,
  errors,
  onChange,
  disabled,
}: MetadataFieldsProps) {
  return (
    <fieldset className="animate-fade-in space-y-3" disabled={disabled}>
      <legend className="text-sm font-semibold">
        Annotator metadata
      </legend>

      <p className="text-xs text-muted-foreground">
        {fields.length === 1
          ? 'Only the annotator domicile is used by this model.'
          : 'Describe the annotator whose perspective the prediction should reflect.'}
      </p>

      <div className={cn('grid gap-4', fields.length > 1 && 'sm:grid-cols-2')}>
        {fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            {field.type === 'number' ? (
              <>
                <label
                  htmlFor={`metadata-${field.key}`}
                  className="text-sm font-medium"
                >
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-destructive">*</span>
                  )}
                </label>

                <input
                  id={`metadata-${field.key}`}
                  type="number"
                  min={1}
                  max={120}
                  step={1}
                  value={values[field.key] ?? ''}
                  placeholder={field.placeholder}
                  disabled={disabled}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  aria-invalid={Boolean(errors[field.key])}
                  className={cn(
                    'flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm',
                    'placeholder:text-muted-foreground/70',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    errors[field.key]
                      ? 'border-destructive'
                      : 'border-input',
                  )}
                />

                <p className="text-xs text-muted-foreground">
                  {field.description}
                </p>

                {errors[field.key] && (
                  <p className="text-xs text-destructive" role="alert">
                    {errors[field.key]}
                  </p>
                )}
              </>
            ) : (
              <SelectField
                label={field.label}
                description={field.description}
                placeholder={field.placeholder}
                options={field.options}
                required={field.required}
                value={values[field.key] ?? ''}
                error={errors[field.key]}
                onChange={(value) => onChange(field.key, value)}
              />
            )}
          </div>
        ))}
      </div>
    </fieldset>
  );
}
