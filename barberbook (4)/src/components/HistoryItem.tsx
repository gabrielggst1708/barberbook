import React from 'react';
import { Appointment } from '../types';
import { Calendar, Clock, FileText, CheckCircle2, XCircle, Clock3 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';

interface HistoryItemProps {
  appointment: Appointment;
}

const statusConfig = {
  pending: { icon: Clock3, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Pendente' },
  confirmed: { icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Confirmado' },
  completed: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Concluído' },
  cancelled: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Cancelado' },
};

export const HistoryItem: React.FC<HistoryItemProps> = ({ appointment }) => {
  const status = statusConfig[appointment.status];
  const StatusIcon = status.icon;
  const date = new Date(appointment.date);

  return (
    <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm mb-3 last:mb-0">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-gray-900">{appointment.serviceName}</h4>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar size={12} />
              {format(date, "dd 'de' MMMM", { locale: ptBR })}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} />
              {format(date, "HH:mm")}
            </div>
          </div>
        </div>
        <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", status.bg, status.color)}>
          <StatusIcon size={10} />
          {status.label}
        </div>
      </div>

      {appointment.notes && (
        <div className="bg-gray-50 p-3 rounded-xl flex gap-2 items-start">
          <FileText size={14} className="text-gray-400 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-600 italic leading-relaxed">
            "{appointment.notes}"
          </p>
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-400">Valor pago:</span>
        <span className="text-sm font-bold text-gray-900">R$ {appointment.price.toFixed(2)}</span>
      </div>
    </div>
  );
};
