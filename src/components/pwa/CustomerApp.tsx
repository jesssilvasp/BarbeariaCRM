import React from 'react';
import {
  QrCode,
  Sparkles,
  Award,
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Customer, Appointment, Tenant } from '../../types';

interface CustomerAppProps {
  tenant: Tenant;
  customer?: Customer;
  appointments: Appointment[];
  onOpenPublicBooking: () => void;
  onOpenAdmin: () => void;
}

export const CustomerApp: React.FC<CustomerAppProps> = ({
  tenant,
  customer = {
    id: 'cust-1',
    name: 'Carlos Eduardo Silva',
    phone: '(11) 98765-4321',
    whatsapp: '5511987654321',
    email: 'carlos.silva@gmail.com',
    tags: ['VIP', 'Mensalista'],
    totalSpent: 1250,
    visitCount: 14,
    loyaltyPoints: 340,
    cashbackBalance: 45.0,
    isVipMember: true,
    vipPlanName: 'Plano Gentleman VIP',
    createdAt: '2025-11-10',
  },
  appointments,
  onOpenPublicBooking,
  onOpenAdmin,
}) => {
  const customerAppts = appointments.filter((a) => a.customerName.includes('Carlos'));

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-300 flex flex-col font-sans max-w-md mx-auto border-x border-white/10 shadow-2xl relative pb-20">
      {/* Top Mobile PWA App Header */}
      <div className="p-4 bg-[#09090B]/90 border-b border-white/10 backdrop-blur sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#F5E1A4] flex items-center justify-center text-black font-black text-xs shadow-md">
            <Scissors className="w-4 h-4 text-black" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-white uppercase tracking-wider">
              {tenant.name}
            </h1>
            <span className="text-[9px] text-[#D4AF37] font-semibold">App VIP do Cliente</span>
          </div>
        </div>

        <button
          onClick={onOpenAdmin}
          className="text-[10px] text-slate-400 hover:text-[#D4AF37] transition font-medium"
        >
          Painel Admin →
        </button>
      </div>

      {/* Customer VIP Profile Card */}
      <div className="p-5 space-y-5">
        <div className="p-5 rounded-2xl bg-[#111114] border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#F5E1A4] text-black flex items-center justify-center font-black text-lg shadow-lg">
                {customer.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">{customer.name}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#D4AF37] text-black">
                  <Award className="w-3 h-3" /> CLIENTE GENTLEMAN VIP
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400">Saldo Cashback</span>
              <p className="text-base font-bold text-[#D4AF37] font-mono">
                R$ {customer.cashbackBalance.toFixed(2).replace('.', ',')}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400">Pontos Fidelidade</span>
              <p className="text-base font-bold text-emerald-400">
                {customer.loyaltyPoints} pts
              </p>
            </div>
          </div>
        </div>

        {/* Live Queue Status Banner */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-bold text-xs shrink-0">
              #1
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-400">Você é o próximo da fila!</h3>
              <p className="text-[10px] text-zinc-300">
                Aguarde na recepção. Tempo estimado: <strong className="text-zinc-100">8 min</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Check-In QR Code Card */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-3">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1">
            <QrCode className="w-4 h-4" /> CARTÃO DE CHECK-IN RÁPIDO
          </span>
          <p className="text-xs text-zinc-400">
            Apresente na recepção para liberar seu atendimento e seu chopp cortesia.
          </p>
          <div className="p-3 bg-white rounded-xl inline-block shadow-lg">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=VIP-CHECKIN-CARLOS-SILVA"
              alt="QR Code Checkin"
              className="w-32 h-32"
            />
          </div>
          <p className="text-[10px] text-zinc-500 font-mono">TOKEN: VIP-GENTLEMAN-2026</p>
        </div>

        {/* Customer Active Bookings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Seus Agendamentos
            </h3>
            <button
              onClick={onOpenPublicBooking}
              className="text-amber-400 font-bold text-[11px] flex items-center gap-1 hover:underline"
            >
              + Agendar <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {customerAppts.map((appt) => (
            <div
              key={appt.id}
              className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-zinc-100">{appt.serviceName}</h4>
                  <p className="text-[11px] text-amber-400">Com {appt.barberName}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {appt.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-amber-400" /> {appt.date} às {appt.time}
                </span>
                <span className="font-bold text-zinc-200">R$ {appt.servicePrice.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom PWA Mobile Nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-zinc-900/95 border-t border-zinc-800 p-2 grid grid-cols-4 text-center text-[10px] font-bold text-zinc-400">
        <button className="py-1 text-amber-400 flex flex-col items-center gap-1">
          <Zap className="w-4 h-4" /> Início
        </button>
        <button onClick={onOpenPublicBooking} className="py-1 hover:text-amber-400 flex flex-col items-center gap-1">
          <CalendarIcon className="w-4 h-4" /> Agendar
        </button>
        <button className="py-1 hover:text-amber-400 flex flex-col items-center gap-1">
          <Award className="w-4 h-4" /> Clube VIP
        </button>
        <button className="py-1 hover:text-amber-400 flex flex-col items-center gap-1">
          <User className="w-4 h-4" /> Perfil
        </button>
      </div>
    </div>
  );
};
