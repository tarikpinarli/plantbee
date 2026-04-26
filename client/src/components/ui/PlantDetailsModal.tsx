import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPlantById } from '@/api/plants.api';
import { SharedButton } from './CustomedButton';
import { deletePlant } from '@/utils/deleteAPI';
import { useCurrentOwnerId } from '@/hooks/useCurrentOwnerId';
import { Trans, useTranslation } from 'react-i18next';

interface PlantDetailsModalProps {
  plantId: number;
  onClose: () => void;
}

export const PlantDetailsModal: React.FC<PlantDetailsModalProps> = ({ plantId, onClose }) => {
  const { t, i18n } = useTranslation();
  const { data: plant, isLoading, error } = useQuery({
    queryKey: ['plant', plantId],
    queryFn: () => fetchPlantById(plantId),
  });

  const localeMap: Record<string, string> = { en: 'en-US', fr: 'fr-FR', fi: 'fi-FI' };
  const dateLocale = localeMap[i18n.language] ?? 'en-US';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(dateLocale, {
        year: 'numeric', month: 'long', day: 'numeric'
    });
  }
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(dateLocale, {
        hour: '2-digit', minute: '2-digit'
    });
  }

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deletePlant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants']});
      queryClient.invalidateQueries({queryKey: ['plant', plantId]});
      onClose();
    },
  });

  const handleDelete = () => {
    const confirmed = window.confirm(t('plantDetails.confirmDelete'));

    if (!confirmed) return;

    deleteMutation.mutate(plantId);
  };

  const { data: user } = useCurrentOwnerId();

  const currentUserId = user ? Number(user.id) : null;

  const canDelete = plant && (plant.owner_id === 0 || plant.owner_id === currentUserId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors">✕</button>

        {isLoading && <div className="p-10 text-center text-slate-500">{t('plantDetails.loading')}</div>}
        {error && <div className="p-10 text-center text-red-500">{t('plantDetails.error')}</div>}

        {plant && (
          <div className="overflow-y-auto pb-6">
            {/* Header Image */}
            <div className="w-full h-48 bg-slate-200 relative">
              {plant.image_url ? (
                <img src={`http://localhost:8080${plant.image_url}`} alt={plant.name} className="w-full h-full object-cover"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">🌱</div>
              )}
            </div>

            {/* Details Content */}
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-green-900">{plant.name}</h2>
                {plant.species && <p className="text-slate-500 italic mt-1">{plant.species}</p>}
                <p className="text-sm text-slate-400 mt-2">
                  <Trans
                    i18nKey="plantDetails.addedBy"
                    values={{ name: plant.owner_name, date: formatDate(plant.created_at) }}
                    components={{ strong: <span className="font-semibold text-slate-600" /> }}
                  />
                </p>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{t('plantDetails.category')}</p>
                  <p className="font-medium text-slate-800">{plant.category || t('plantDetails.na')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{t('plantDetails.lightNeed')}</p>
                  <p className="font-medium text-slate-800">{plant.light_need || t('plantDetails.na')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{t('plantDetails.potVolume')}</p>
                  <p className="font-medium text-slate-800">
                    {plant.pot_volume_l || plant.pot_volume_liters ? t('plantDetails.potVolumeValue', { value: plant.pot_volume_l || plant.pot_volume_liters }) : t('plantDetails.na')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{t('plantDetails.sensorId')}</p>
                  <p className="font-medium text-slate-800 font-mono text-sm bg-slate-100 px-2 py-0.5 rounded inline-block">{plant.sensor_id || t('plantDetails.na')}</p>
                </div>

                {/* Moisture Section */}
                <div className="col-span-2 bg-slate-50 border border-slate-100 rounded-xl p-5 mt-2">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                        <span className="text-blue-500 text-base">💧</span> {t('plantDetails.currentMoisture')}
                      </p>
                      <p className="font-bold text-2xl text-blue-600">{plant.current_moisture !== undefined ? `${plant.current_moisture}%` : t('plantDetails.na')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{t('plantDetails.target')}</p>
                      <p className="font-bold text-lg text-green-600">{plant.target_moisture ? `${plant.target_moisture}%` : "50%"}</p>
                    </div>
                  </div>

                  {plant.current_moisture !== undefined && (
                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative mt-1">
                      {plant.target_moisture && (
                        <div className="absolute top-0 bottom-0 w-1.5 bg-green-500 z-10" style={{ left: `${plant.target_moisture}%`, transform: 'translateX(-50%)' }} />
                      )}
                      <div className={`h-full rounded-full transition-all duration-1000 ${plant.current_moisture < (plant.target_moisture || 50) ? 'bg-orange-400' : 'bg-blue-500'}`} style={{ width: `${plant.current_moisture}%` }} />
                    </div>
                  )}
                </div>

                {/* ACTIVE TASKS */}
                <div className="col-span-2 mt-2">
                    <h3 className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                       {t('plantDetails.activeTasks')}
                    </h3>
                    {plant.active_tasks && plant.active_tasks.length > 0 ? (
                        <div className="space-y-3">
                            {plant.active_tasks.map((task: { id: number, type: string, status: string, water_amount: number, message: string, volentee_id: number }) => {
                                const statusLabel = task.status === 'in_progress'
                                    ? t('plantDetails.statusInProgress')
                                    : task.status === 'completed'
                                        ? t('plantDetails.statusCompleted')
                                        : t('plantDetails.statusOpen');
                                return (
                                <div key={task.id} className={`flex flex-col border ${task.type === 'water' ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'} p-3 rounded-xl`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="font-bold text-sm flex items-center gap-1.5">
                                            {task.type === 'water' ? t('plantDetails.needsWatering') : t('plantDetails.systemError')}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${task.status === 'in_progress' ? 'bg-yellow-200 text-yellow-800' : 'bg-slate-200 text-slate-700'}`}>
                                            {statusLabel}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        {task.type === 'water' ? t('plantDetails.targetAmount', { amount: task.water_amount }) : task.message}
                                    </div>
                                    {task.status === 'in_progress' && (
                                        <div className="text-xs text-slate-500 mt-2 italic">
                                            {t('plantDetails.volunteerHandling')}
                                        </div>
                                    )}
                                </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                            {t('plantDetails.noActiveTasks')}
                        </p>
                    )}
                </div>

                {/* RECENT SENSOR LOGS */}
                <div className="col-span-2 mt-2 pt-4 border-t border-slate-100">
                    <h3 className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">{t('plantDetails.recentLogs')}</h3>
                    {plant.recent_readings && plant.recent_readings.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {plant.recent_readings.map((log: { id: number, recorded_at: string, moisture: number, battery_level?: number }) => (
                                <div key={log.id} className="flex justify-between items-center bg-white border border-slate-200 shadow-sm p-2.5 rounded-lg text-sm">
                                    <div className="text-slate-600 font-medium">
                                        {formatDate(log.recorded_at)} <span className="text-slate-400 text-xs ml-1">{formatTime(log.recorded_at)}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1">💧 {log.moisture}%</span>
                                        {log.battery_level !== undefined && (
                                            <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1">🔋 {log.battery_level}%</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">{t('plantDetails.noLogs')}</p>
                    )}
                </div>


              </div>

              {/* DELETE BUTTON */}
              {canDelete && (
                <div className="flex items-center justify-center pt-4 border-t border-slate-100 mt-4">
                  <SharedButton
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleteMutation.isPending ? t('plantDetails.deleting') : t('plantDetails.delete')}
                  </SharedButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};