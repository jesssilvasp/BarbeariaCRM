import React from 'react';
import {
  Scissors,
  CheckCircle2,
  Clock,
  DollarSign,
  User,
  Star,
  Award,
  ArrowLeft,
} from 'lucide-react';
import { Barber, Appointment } from '../../types';

interface BarberPortalProps {
  barber?: Barber;
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: any) => void;
  onBackToAdmin: () => void;
}

export const BarberPortal: React.FC<BarberPortalProps> = ({
  barber = {
    id: 'barber-lucas',
    name: 'Lucas Ferreira',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    rating: 4.9,
    reviewCount: 148,
    specialties: ['Fade / Degradê', 'Barboterapia'],
    bio: 'Mestre barbeiro',
    commissionRatePercent: 45,
    workingHours: { start: '09:00', end: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
    isActive: true,
  },
  appointments,
  onUpdateStatus,
  onBackToAdmin,
}) => {
  const myAppts = appointments.filter((a) => a.barberId === barber.id || a.barberName.includes('Lucas'));
  const completedToday = myAppts.filter((a) => a.status === 'Concluído');
  const earnedCommissionToday = completedToday.reduce(
    (acc, curr) => acc + curr.servicePrice * (barber.commissionRatePercent / 100),
    0
  );

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-300 font-sans p-4 max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <button
          onClick={onBackToAdmin}
          className="text-xs text-slate-400 hover:text-[#D4AF37] flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Painel Admin
        </button>
        <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Portal do Barbeiro</span>
      </div>

      {/* Barber Header Card */}
      <div className="p-4 rounded-2xl bg-[#111114] border border-white/10 flex items-center gap-4">
        <img
          src={barber.avatarUrl}
          alt={barber.name}
          className="w-14 h-14 rounded-2xl object-cover border-2 border-[#D4AF37]"
        />
        <div>
          <h2 className="text-base font-bold text-white">{barber.name}</h2>
          <p className="text-xs text-[#D4AF37] font-semibold flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[#D4AF37]" /> {barber.rating} • Comissão {barber.commissionRatePercent}%
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-[#111114] border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Atendidos Hoje</span>
          <p className="text-xl font-bold text-white mt-1">{completedToday.length} clientes</p>
        </div>

        <div className="p-4 rounded-xl bg-[#111114] border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Comissão Estimada</span>
          <p className="text-xl font-bold text-[#D4AF37] font-mono mt-1">
            R$ {earnedCommissionToday.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </div>

      {/* Today's Barber Schedule */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
          Sua Agenda para Hoje
        </h3>

        <div className="space-y-3">
          {myAppts.map((appt) => (
            <div
              key={appt.id}
              className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-amber-400 font-serif">{appt.time}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {appt.status}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-zinc-100">{appt.customerName}</h4>
                <p className="text-[11px] text-zinc-400">{appt.serviceName}</p>
                <p className="text-[10px] text-zinc-500 mt-1 italic">
                  Prefere tesoura no topo e fade médio. Servir café expresso.
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-zinc-200">
                  R$ {appt.servicePrice.toFixed(2)}
                </span>

                {appt.status !== 'Concluído' && (
                  <button
                    onClick={() => onUpdateStatus(appt.id, 'Concluído')}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg transition"
                  >
                    Concluir Atendimento ✓
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
