import React, { useEffect, useMemo, useState } from 'react';
import { Save, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_FORM_IMAGE_CROP_PROFILES, FORM_IMAGE_CROP_KEYS, FormImageCropKey, FormImageCropProfile, getAspectRatio } from '../../../../config/formImageCropProfiles';
import { formImageCropConfigService } from '../../../../services/formImageCropConfigService';

type LocalState = Record<FormImageCropKey, FormImageCropProfile>;
type SavingState = Partial<Record<FormImageCropKey, boolean>>;

const buildInitialState = (): LocalState => {
  return FORM_IMAGE_CROP_KEYS.reduce((acc, key) => {
    acc[key] = DEFAULT_FORM_IMAGE_CROP_PROFILES[key];
    return acc;
  }, {} as LocalState);
};

const validateConfig = (config: FormImageCropProfile): string | null => {
  if (config.aspectWidth <= 0 || config.aspectHeight <= 0) return 'A proporção deve ter valores positivos.';
  if (config.minWidth <= 0 || config.minHeight <= 0) return 'As dimensões mínimas devem ser maiores que zero.';
  if (config.maxWidth <= 0 || config.maxHeight <= 0) return 'As dimensões máximas devem ser maiores que zero.';
  if (config.minWidth > config.maxWidth) return 'A largura mínima não pode ser maior que a largura máxima.';
  if (config.minHeight > config.maxHeight) return 'A altura mínima não pode ser maior que a altura máxima.';
  return null;
};

const FormCropSettingsPanel: React.FC = () => {
  const [configs, setConfigs] = useState<LocalState>(buildInitialState());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<SavingState>({});

  useEffect(() => {
    const load = async () => {
      try {
        const list = await formImageCropConfigService.list();
        setConfigs((prev) => {
          const next = { ...prev };
          for (const key of FORM_IMAGE_CROP_KEYS) {
            next[key] = list[key] || prev[key];
          }
          return next;
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Falha ao carregar configurações de corte.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const sortedConfigs = useMemo(() => FORM_IMAGE_CROP_KEYS.map((key) => configs[key]), [configs]);

  const updateField = <K extends keyof FormImageCropProfile>(formKey: FormImageCropKey, field: K, value: FormImageCropProfile[K]) => {
    setConfigs((prev) => ({
      ...prev,
      [formKey]: {
        ...prev[formKey],
        [field]: value,
      },
    }));
  };

  const saveConfig = async (formKey: FormImageCropKey) => {
    const config = configs[formKey];
    const validationError = validateConfig(config);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving((prev) => ({ ...prev, [formKey]: true }));
    try {
      const saved = await formImageCropConfigService.upsert(config);
      setConfigs((prev) => ({
        ...prev,
        [formKey]: saved,
      }));
      toast.success(`Configuração salva: ${saved.label}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao salvar configuração.');
    } finally {
      setSaving((prev) => ({ ...prev, [formKey]: false }));
    }
  };

  const restoreDefault = async (formKey: FormImageCropKey) => {
    setSaving((prev) => ({ ...prev, [formKey]: true }));
    try {
      const defaultConfig = await formImageCropConfigService.resetToDefault(formKey);
      setConfigs((prev) => ({
        ...prev,
        [formKey]: defaultConfig,
      }));
      toast.success('Padrão restaurado para este formulário.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao restaurar padrão.');
    } finally {
      setSaving((prev) => ({ ...prev, [formKey]: false }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
      <div className="border-b pb-3">
        <h3 className="text-lg font-semibold text-gray-900">Editor de Corte por Formulário</h3>
        <p className="text-sm text-gray-600 mt-1">Defina proporções, limites e ajuste visual individual para cada formulário.</p>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Carregando configurações dinâmicas...</div>
      ) : (
        <div className="space-y-4">
          {sortedConfigs.map((config) => {
            const ratio = getAspectRatio(config.aspectWidth, config.aspectHeight);
            const isSaving = !!saving[config.formKey];
            return (
              <div key={config.formKey} className="rounded-lg border border-gray-200 p-4 space-y-4 bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{config.label}</p>
                    <p className="text-xs text-gray-600 mt-1">{config.description}</p>
                    <p className="text-xs text-blue-700 mt-1">Proporção ativa: {ratio.toFixed(2)}:1</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={config.isActive}
                      onChange={(event) => updateField(config.formKey, 'isActive', event.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    Ativo
                  </label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Proporção W</label>
                    <input
                      type="number"
                      value={config.aspectWidth}
                      min={1}
                      onChange={(event) => updateField(config.formKey, 'aspectWidth', Number(event.target.value))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Proporção H</label>
                    <input
                      type="number"
                      value={config.aspectHeight}
                      min={1}
                      onChange={(event) => updateField(config.formKey, 'aspectHeight', Number(event.target.value))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Largura mín.</label>
                    <input
                      type="number"
                      value={config.minWidth}
                      min={1}
                      onChange={(event) => updateField(config.formKey, 'minWidth', Number(event.target.value))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Altura mín.</label>
                    <input
                      type="number"
                      value={config.minHeight}
                      min={1}
                      onChange={(event) => updateField(config.formKey, 'minHeight', Number(event.target.value))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Largura máx.</label>
                    <input
                      type="number"
                      value={config.maxWidth}
                      min={1}
                      onChange={(event) => updateField(config.formKey, 'maxWidth', Number(event.target.value))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Altura máx.</label>
                    <input
                      type="number"
                      value={config.maxHeight}
                      min={1}
                      onChange={(event) => updateField(config.formKey, 'maxHeight', Number(event.target.value))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-2">
                    <label className="text-xs font-medium text-gray-600">Preview do corte</label>
                    <div className="mt-1 w-full border border-dashed border-blue-300 bg-white rounded-md p-2">
                      <div className="w-full bg-blue-100 rounded-sm relative overflow-hidden" style={{ aspectRatio: `${config.aspectWidth} / ${config.aspectHeight}` }}>
                        <div className="absolute inset-0 flex items-center justify-center text-[11px] text-blue-900 font-medium">
                          {config.aspectWidth}:{config.aspectHeight} · {config.minWidth}x{config.minHeight}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => restoreDefault(config.formKey)}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-white disabled:opacity-60"
                  >
                    <RefreshCcw size={14} />
                    Restaurar padrão
                  </button>
                  <button
                    type="button"
                    onClick={() => saveConfig(config.formKey)}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
                  >
                    <Save size={14} />
                    {isSaving ? 'Salvando...' : 'Salvar configuração'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FormCropSettingsPanel;
