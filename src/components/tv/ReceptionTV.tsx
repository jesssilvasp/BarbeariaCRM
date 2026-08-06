import React, { useState, useEffect } from 'react';
import { Scissors, Clock, ArrowLeft, QrCode, Sparkles } from 'lucide-react';
import { Tenant, Appointment } from '../../types';

interface ReceptionTVProps {
  tenant: Tenant;
  appointments: Appointment[];
  onBackToAdmin: () => void;
}

export const ReceptionTV: React.FC<ReceptionTVProps> = ({
  tenant,
  appointments,
  onBackToAdmin,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const inService = appointments.filter((a) => a.status === 'Em Atendimento');
  const upcoming = appointments.filter((a) => a.status === 'Confirmado' || a.status === 'Agendado');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-8 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Top Header Row for TV */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            <Scissors className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-amber-400 uppercase font-serif">
              {tenant.name}
            </h1>
            <p className="text-xs text-zinc-400 uppercase tracking-widest">Painel Digital da Recepção</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={onBackToAdmin}
            className="text-xs text-zinc-500 hover:text-amber-400 underline"
          >
            Sair do Modo TV
          </button>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">{timeStr || '16:00:00'}</span>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">São Paulo - SP</p>
          </div>
        </div>
      </div>

      {/* Main TV Content Area */}
      <div className="grid grid-cols-12 gap-8 my-8 flex-1 items-stretch">
        {/* Chair Status Column (Em Atendimento) */}
        <div className="col-span-7 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between shadow-2xl">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Scissors className="w-5 h-5" /> EM ATENDIMENTO NAS CADEIRAS
          </h2>

          <div className="grid grid-cols-2 gap-4 flex-1">
            {inService.length > 0 ? (
              inService.map((appt, i) => (
                <div
                  key={appt.id}
                  className="p-5 rounded-2xl bg-zinc-950 border border-amber-500/40 space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500 text-zinc-950 font-bold text-xs">
                      Cadeira #{i + 1}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 animate-pulse">● Ao Vivo</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-zinc-100">{appt.customerName}</h3>
                    <p className="text-xs text-zinc-400">{appt.serviceName}</p>
                    <p className="text-xs text-amber-400 font-semibold mt-1">Barbeiro: {appt.barberName}</p>
                  </div>

                  <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                    Início: {appt.time} • Término estimado em 15 min
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 flex items-center justify-center p-8 text-zinc-500 text-sm">
                Nenhum atendimento ao vivo no momento.
              </div>
            )}
          </div>

          {/* Wi-Fi & Promo Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-400">
            <span className="flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4" /> Wi-Fi Cortesia: BarberExclusiva_Guest | Senha: gentleman2026
            </span>
            <span className="text-zinc-300">Peça seu expresso ou chopp na recepção!</span>
          </div>
        </div>

        {/* Next in Line Column */}
        <div className="col-span-5 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between shadow-2xl">
          <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" /> PRÓXIMOS DA FILA
          </h2>

          <div className="space-y-3 flex-1">
            {upcoming.slice(0, 4).map((appt, i) => (
              <div
                key={appt.id}
                className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-zinc-800 text-amber-400 font-bold text-xs flex items-center justify-center">
                    #{i + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100">{appt.customerName}</h4>
                    <p className="text-xs text-zinc-400">{appt.serviceName}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-amber-400 font-serif">{appt.time}</span>
                  <p className="text-[10px] text-zinc-500">{appt.barberName}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Scan QR Code to Book Walk-in */}
          <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-zinc-100">Agende pelo Celular</h4>
              <p className="text-[10px] text-zinc-400">Aponte a câmera para agendar o próximo horário</p>
            </div>
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://barberflow.app"
              alt="QR Code"
              className="w-16 h-16 rounded bg-white p-1"
            />
          </div>
        </div>
      </div>

      {/* TV Marquee Footer */}
      <div className="border-t border-zinc-900 pt-4 text-center text-xs text-zinc-500 uppercase tracking-widest font-semibold">
        BarberFlow CRM SaaS • Atendimento com Hora Marcada • Barbearia Exclusiva
      </div>
    </div>
  );
};
