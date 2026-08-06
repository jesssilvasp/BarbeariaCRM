import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Star,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Award,
  CreditCard,
  QrCode,
  Share2,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Tenant, Service, Barber, Appointment } from '../../types';

interface LandingPageProps {
  tenant: Tenant;
  services: Service[];
  barbers: Barber[];
  onBookAppointment: (appointment: Omit<Appointment, 'id' | 'qrCodeToken' | 'createdAt'>) => void;
  onOpenAdmin: () => void;
  onOpenCustomerApp: () => void;
  onOpenTVMode: () => void;
  onOpenBarberPortal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  tenant,
  services,
  barbers,
  onBookAppointment,
  onOpenAdmin,
  onOpenCustomerApp,
  onOpenTVMode,
  onOpenBarberPortal,
}) => {
  // Booking Form State matching Reference Image steps
  const [selectedService, setSelectedService] = useState<Service | null>(services[0] || null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(barbers[0] || null);
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-05');
  const [selectedTime, setSelectedTime] = useState<string>('16:00');

  // Customer Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Cartão de Crédito' | 'Dinheiro'>('PIX');

  // Confirmation Modal
  const [bookingSuccessModal, setBookingSuccessModal] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const timeSlots = [
    '09:00',
    '10:00',
    '11:00',
    '14:00',
    '15:00',
    '16:00',
    '16:30',
    '17:00',
    '18:00',
    '19:00',
  ];

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedBarber || !customerName || !customerPhone) {
      alert('Por favor, preencha seu Nome e Telefone para concluir o agendamento.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(async () => {
      const newAppt = {
        tenantId: tenant.id,
        customerId: `cust-${Date.now()}`,
        customerName,
        customerPhone,
        customerEmail: customerEmail || `${customerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        barberId: selectedBarber.id,
        barberName: selectedBarber.name,
        date: selectedDate,
        time: selectedTime,
        durationMinutes: selectedService.durationMinutes,
        status: 'Agendado' as const,
        paymentMethod,
        paymentStatus: 'Pendente' as const,
        whatsappSent: true,
      };

      onBookAppointment(newAppt);

      // Trigger Celebration Confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Call Backend to generate Calendar URL and simulate WhatsApp
      try {
        const calRes = await fetch('/api/calendar/add-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceName: selectedService.name,
            barberName: selectedBarber.name,
            date: selectedDate,
            time: selectedTime,
            customerName,
            address: tenant.address,
          }),
        });
        const calData = await calRes.json();

        setBookingSuccessModal({
          ...newAppt,
          qrToken: `QR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          gcalUrl: calData.googleCalendarUrl,
        });
      } catch (err) {
        setBookingSuccessModal({
          ...newAppt,
          qrToken: `QR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          gcalUrl: '#',
        });
      }

      setIsSubmitting(false);
    }, 800);
  };

  const faqs = [
    {
      q: 'Preciso pagar antecipadamente para agendar?',
      a: 'Não! Você pode escolher pagar no momento do atendimento via PIX, Cartão ou Dinheiro, ou optar pelo pagamento online no momento da reserva.',
    },
    {
      q: 'Como funciona se eu precisar reagendar ou cancelar?',
      a: 'Você receberá uma mensagem no WhatsApp com o link direto para reagendar ou cancelar com até 2 horas de antecedência sem nenhuma taxa.',
    },
    {
      q: 'Onde a barbearia está localizada?',
      a: `${tenant.address} - ${tenant.city}/${tenant.state}. Possuímos estacionamento com manobrista cortesia para nossos clientes.`,
    },
    {
      q: 'Como funciona o Clube VIP de Assinatura?',
      a: 'Com o Plano Gentleman VIP você paga uma mensalidade fixa e tem direito a cortes ilimitados, chopp grátis e desconto em produtos.',
    },
  ];

  return (
    <div className="min-w-full min-h-screen bg-[#09090B] text-slate-300 font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* SaaS Admin / Shortcut Demo Navigation Bar */}
      <div className="bg-[#09090B] border-b border-white/10 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-400">
        <div className="flex items-center space-[#0.5rem] gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
            SaaS Multi-Tenant CRM
          </span>
          <span className="font-semibold text-white">{tenant.name}</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">{tenant.address}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenAdmin}
            className="px-3 py-1 bg-gradient-to-tr from-[#D4AF37] to-[#F5E1A4] text-black font-bold rounded-lg hover:opacity-90 transition flex items-center gap-1 shadow"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Painel Admin CRM
          </button>
          <button
            onClick={onOpenBarberPortal}
            className="px-3 py-1 bg-white/5 text-slate-200 rounded-lg hover:bg-white/10 transition flex items-center gap-1 border border-white/10"
          >
            <Scissors className="w-3.5 h-3.5 text-[#D4AF37]" /> Portal Barbeiro
          </button>
          <button
            onClick={onOpenCustomerApp}
            className="px-3 py-1 bg-white/5 text-slate-200 rounded-lg hover:bg-white/10 transition flex items-center gap-1 border border-white/10"
          >
            <User className="w-3.5 h-3.5 text-[#D4AF37]" /> App VIP PWA
          </button>
          <button
            onClick={onOpenTVMode}
            className="px-3 py-1 bg-white/5 text-slate-200 rounded-lg hover:bg-white/10 transition flex items-center gap-1 border border-white/10"
          >
            <QrCode className="w-3.5 h-3.5 text-[#D4AF37]" /> TV Recepção
          </button>
        </div>
      </div>

      {/* Main Header matching Sleek theme */}
      <header className="sticky top-0 z-40 bg-[#09090B]/90 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#F5E1A4] flex items-center justify-center text-black font-black text-xs shadow-md">
              <Scissors className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-widest text-[#D4AF37] uppercase">
                BARBEARIA EXCLUSIVA
              </h1>
              <p className="text-[10px] tracking-widest text-slate-400 uppercase">
                Estilo • Tradição • Excelência
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-widest uppercase text-slate-300">
            <a href="#inicio" className="hover:text-[#D4AF37] transition">INÍCIO</a>
            <a href="#agendamento" className="hover:text-[#D4AF37] transition">SERVIÇOS</a>
            <a href="#barbeiros" className="hover:text-[#D4AF37] transition">BARBEIROS</a>
            <a href="#galeria" className="hover:text-[#D4AF37] transition">GALERIA</a>
            <a href="#contato" className="hover:text-[#D4AF37] transition">CONTATO</a>
          </nav>

          <a
            href="#agendamento"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#F5E1A4] hover:opacity-95 text-black font-bold text-xs tracking-wider uppercase transition flex items-center gap-2 shadow-lg shadow-[#D4AF37]/10"
          >
            AGENDAR <CalendarIcon className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Hero Section matching Reference Image */}
      <section
        id="inicio"
        className="relative min-h-[520px] flex items-center justify-center bg-cover bg-center px-6 py-20 border-b border-zinc-900"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(9, 9, 11, 0.95), rgba(9, 9, 11, 0.7)), url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1600&fit=crop&q=80')`,
        }}
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" /> ESTILO • CONFIANÇA • ATITUDE
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-zinc-100 leading-tight">
              Seu estilo, <br />
              <span className="text-amber-400 font-serif italic">nossa paixão.</span>
            </h2>
            <p className="text-zinc-400 text-base md:text-lg max-w-xl">
              Agende seu horário e viva a melhor experiência de barbearia da cidade. Atendimento VIP, ambiente exclusivo e bebidas cortesia.
            </p>
            <div className="pt-2">
              <a
                href="#agendamento"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm tracking-wider uppercase transition shadow-xl shadow-amber-500/20"
              >
                AGENDAR AGORA <CalendarIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-xs font-semibold text-amber-400 tracking-wider uppercase flex items-center gap-2">
                  <Award className="w-4 h-4" /> BARBEARIA PREMIUM
                </span>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.9 (480+ avaliações)
                </span>
              </div>
              <p className="text-xs text-zinc-300 italic">
                "Atendimento nota 10. O barboterapia com toalha quente é sensacional. Recomendadíssimo!"
              </p>
              <div className="flex items-center gap-3 pt-2">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop"
                  alt="Cliente"
                  className="w-10 h-10 rounded-full border border-amber-500/40 object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Carlos Eduardo</h4>
                  <p className="text-[10px] text-zinc-400">Cliente Mensalista VIP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Online Booking Flow Widget matching Reference Image layout */}
      <section id="agendamento" className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight font-serif">
              Agende seu horário
            </h2>
            <div className="w-12 h-1 bg-amber-500 mt-2 rounded-full" />
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>ATENDIMENTO: <strong className="text-zinc-200">SEG - SÁB: 09h às 20h</strong></span>
          </div>
        </div>

        {/* Visual Steps Indicator */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { num: 1, title: 'Serviço', sub: 'Escolha o serviço', active: true },
            { num: 2, title: 'Barbeiro', sub: 'Escolha o profissional', active: !!selectedService },
            { num: 3, title: 'Data e hora', sub: 'Selecione data e horário', active: !!selectedBarber },
            { num: 4, title: 'Confirmar', sub: 'Revise e confirme', active: !!selectedTime },
          ].map((step) => (
            <div
              key={step.num}
              className={`p-3.5 rounded-xl border transition flex items-center gap-3 ${
                step.active
                  ? 'bg-zinc-900/90 border-amber-500/40 text-amber-400'
                  : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-500'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                  step.active ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {step.num}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-200 truncate">{step.title}</p>
                <p className="text-[10px] text-zinc-400 truncate">{step.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 4 Columns Booking Container matching Reference Layout */}
        <div className="p-6 md:p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Step 1: Escolha o serviço */}
          <div className="lg:col-span-3 space-y-4 border-b lg:border-b-0 lg:border-r border-zinc-800/80 lg:pr-6 pb-6 lg:pb-0">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-400" /> Escolha o serviço
            </h3>
            <div className="space-y-3">
              {services.map((srv) => {
                const isSelected = selectedService?.id === srv.id;
                return (
                  <button
                    key={srv.id}
                    onClick={() => setSelectedService(srv)}
                    className={`w-full text-left p-3.5 rounded-xl border transition relative flex items-center justify-between ${
                      isSelected
                        ? 'bg-zinc-950 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                        : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-zinc-200">{srv.name}</p>
                      <p className="text-xs font-extrabold text-amber-400 mt-0.5">
                        R$ {srv.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500 text-zinc-950'
                          : 'border-zinc-700 bg-zinc-900 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-zinc-400 italic flex items-center gap-1 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Todos os serviços incluem toalha quente e finalização.
            </p>
          </div>

          {/* Step 2: Escolha o barbeiro */}
          <div className="lg:col-span-3 space-y-4 border-b lg:border-b-0 lg:border-r border-zinc-800/80 lg:pr-6 pb-6 lg:pb-0">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" /> Escolha o barbeiro
            </h3>
            <div className="space-y-3">
              {barbers.map((barber) => {
                const isSelected = selectedBarber?.id === barber.id;
                return (
                  <button
                    key={barber.id}
                    onClick={() => setSelectedBarber(barber)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-zinc-950 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                        : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={barber.avatarUrl}
                        alt={barber.name}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                      />
                      <div>
                        <p className="text-xs font-bold text-zinc-200">{barber.name}</p>
                        <p className="text-[11px] text-amber-400 flex items-center gap-1 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400" /> {barber.rating}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500 text-zinc-950'
                          : 'border-zinc-700 bg-zinc-900 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Escolha a data & horário */}
          <div className="lg:col-span-3 space-y-4 border-b lg:border-b-0 lg:border-r border-zinc-800/80 lg:pr-6 pb-6 lg:pb-0">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-400" /> Escolha a data
            </h3>

            {/* Mini Calendar Picker */}
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-center">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-xs font-bold text-zinc-300">
                <span>&lt;</span>
                <span className="text-amber-400">Agosto 2026</span>
                <span>&gt;</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-[10px] text-zinc-400 mb-1 font-semibold">
                <span>DOM</span><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {daysInMonth.slice(0, 14).map((day) => {
                  const dateStr = `2026-08-${day < 10 ? '0' + day : day}`;
                  const isSelected = selectedDate === dateStr;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`py-1.5 rounded text-xs font-bold transition ${
                        isSelected
                          ? 'bg-amber-500 text-zinc-950'
                          : 'hover:bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Picker */}
            <h4 className="text-xs font-bold text-zinc-300 pt-1">Escolha o horário</h4>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => {
                const isSelected = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      isSelected
                        ? 'bg-amber-500 border-amber-500 text-zinc-950'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Resumo do agendamento & Form */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" /> Resumo do agendamento
            </h3>

            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span>Serviço:</span>
                <strong className="text-zinc-100">{selectedService?.name || '-'}</strong>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Barbeiro:</span>
                <strong className="text-zinc-100">{selectedBarber?.name || '-'}</strong>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Data:</span>
                <strong className="text-amber-400">{selectedDate}</strong>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Horário:</span>
                <strong className="text-amber-400">{selectedTime}</strong>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Duração:</span>
                <strong className="text-zinc-100">{selectedService?.durationMinutes} min</strong>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-bold">
                <span className="text-zinc-200">Total:</span>
                <span className="text-amber-400 font-serif text-base">
                  R$ {selectedService?.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Customer Contact Details */}
            <form onSubmit={handleConfirmBooking} className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Carlos Silva"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  WhatsApp com DDD *
                </label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="PIX">PIX (Pagar na recepção ou online)</option>
                  <option value="Cartão de Crédito">Cartão de Crédito / Débito</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs tracking-wider uppercase transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>PROCESSANDO...</span>
                ) : (
                  <>CONFIRMAR AGENDAMENTO <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
              <p className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-500" /> Seus dados estão seguros conosco.
              </p>
            </form>
          </div>
        </div>

        {/* Feature Highlights Banner matching Reference Image bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-200">Agendamento rápido</h4>
              <p className="text-[11px] text-zinc-400">Marque seu horário em poucos cliques.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-200">Profissionais qualificados</h4>
              <p className="text-[11px] text-zinc-400">Barbeiros experientes para um resultado impecável.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-200">Ambiente premium</h4>
              <p className="text-[11px] text-zinc-400">Conforto e qualidade que você merece.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-200">Pagamento facilitado</h4>
              <p className="text-[11px] text-zinc-400">Diversas formas de pagamento para sua comodidade.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Detailed Catalog */}
      <section className="bg-zinc-900/50 border-y border-zinc-900 py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
              NOSSO MENU DE SERVIÇOS
            </span>
            <h2 className="text-3xl font-extrabold text-zinc-100 font-serif">
              Tradição e Estilo em Cada Detalhe
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto">
              Utilizamos produtos de alta cosmética masculina e técnicas modernas de corte e visagismo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-amber-500/40 transition group"
              >
                {srv.imageUrl && (
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src={srv.imageUrl}
                      alt={srv.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    {srv.isPopular && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500 text-zinc-950 font-bold text-[10px] tracking-wider uppercase rounded-full shadow">
                        MAIS PEDIDO
                      </span>
                    )}
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-base font-bold text-zinc-100">{srv.name}</h3>
                    <span className="text-amber-400 font-serif font-bold text-base">
                      R$ {srv.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{srv.description}</p>

                  {srv.includedItems && (
                    <ul className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                      {srv.includedItems.map((item, idx) => (
                        <li key={idx} className="text-[11px] text-zinc-300 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  <a
                    href="#agendamento"
                    onClick={() => setSelectedService(srv)}
                    className="block text-center w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 font-semibold text-xs tracking-wider uppercase text-zinc-200 transition"
                  >
                    AGENDAR ESTE SERVIÇO
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Barbers Showcase */}
      <section id="barbeiros" className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
            MESTRES BARBEIROS
          </span>
          <h2 className="text-3xl font-extrabold text-zinc-100 font-serif">
            Nossa Equipe de Especialistas
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto">
            Profissionais certificados apaixonados pela arte da barbearia tradicional e moderna.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-3 hover:border-amber-500/40 transition"
            >
              <img
                src={barber.avatarUrl}
                alt={barber.name}
                className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-amber-500/40 shadow-xl"
              />
              <div>
                <h3 className="text-base font-bold text-zinc-100">{barber.name}</h3>
                <p className="text-xs text-amber-400 font-semibold flex items-center justify-center gap-1 mt-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {barber.rating} ({barber.reviewCount} avaliações)
                </p>
              </div>
              <p className="text-xs text-zinc-400 leading-snug">{barber.bio}</p>
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {barber.specialties.map((spec, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] rounded-full font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VIP Club Banner */}
      <section className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-amber-500/10 border-y border-amber-500/20 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              CLUBE GENTLEMAN VIP
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-zinc-100 font-serif">
              Cortes Ilimitados por Apenas R$ 149/mês
            </h3>
            <p className="text-zinc-300 text-xs md:text-sm max-w-xl">
              Assine o plano mensal e mantenha o visual sempre impecável sem se preocupar com valores individuais. Inclui chopp grátis e desconto em produtos.
            </p>
          </div>
          <button
            onClick={onOpenCustomerApp}
            className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs tracking-wider uppercase transition shadow-xl shadow-amber-500/20 shrink-0"
          >
            CONHECER PLANO VIP
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
            TIRE SUAS DÚVIDAS
          </span>
          <h2 className="text-3xl font-extrabold text-zinc-100 font-serif">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full text-left p-4 font-bold text-xs md:text-sm text-zinc-200 flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                {openFaqIndex === idx ? (
                  <ChevronUp className="w-4 h-4 text-amber-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                )}
              </button>
              {openFaqIndex === idx && (
                <div className="px-4 pb-4 text-xs text-zinc-400 border-t border-zinc-800/60 pt-3 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact & Map Footer Section matching Reference Image */}
      <footer id="contato" className="bg-zinc-950 border-t border-zinc-900 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-zinc-900">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Scissors className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-amber-400 uppercase font-serif tracking-wider">
                BARBEARIA EXCLUSIVA
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Mais que um corte, uma experiência. Estilo, atitude e qualidade em cada detalhe.
            </p>
            <div className="flex items-center gap-3 pt-2 text-zinc-400">
              <a href="#" className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:text-amber-400 transition">
                <Share2 className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:text-amber-400 transition">
                <MessageSquare className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-200 tracking-wider uppercase">NAVEGAÇÃO</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><a href="#inicio" className="hover:text-amber-400 transition">Início</a></li>
              <li><a href="#agendamento" className="hover:text-amber-400 transition">Serviços</a></li>
              <li><a href="#barbeiros" className="hover:text-amber-400 transition">Barbeiros</a></li>
              <li><a href="#contato" className="hover:text-amber-400 transition">Contato</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-200 tracking-wider uppercase">CONTATO</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-amber-400" /> {tenant.phone}</li>
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-amber-400" /> {tenant.email}</li>
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-amber-400" /> {tenant.address}</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-200 tracking-wider uppercase">HORÁRIO DE FUNCIONAMENTO</h4>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex justify-between"><span>Segunda a Sexta</span> <strong className="text-zinc-200">09h às 20h</strong></li>
              <li className="flex justify-between"><span>Sábado</span> <strong className="text-zinc-200">09h às 20h</strong></li>
              <li className="flex justify-between"><span>Domingo</span> <strong className="text-red-400">Fechado</strong></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© 2026 Barbearia Exclusiva. BarberFlow CRM SaaS. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Desenvolvido com <span className="text-red-500">♥</span> para barbearias de alto padrão
          </p>
        </div>
      </footer>

      {/* Confirmation Success Modal */}
      <AnimatePresence>
        {bookingSuccessModal && (
          <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 text-center relative"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto text-2xl">
                ✓
              </div>

              <div>
                <h3 className="text-xl font-bold text-zinc-100 font-serif">Agendamento Confirmado!</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Enviamos o comprovante para seu WhatsApp. Apresente este QR Code na recepção.
                </p>
              </div>

              {/* QR Code Container */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col items-center space-y-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${bookingSuccessModal.qrToken}`}
                  alt="QR Code Agendamento"
                  className="w-32 h-32 rounded bg-white p-2"
                />
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                  {bookingSuccessModal.qrToken}
                </span>
              </div>

              <div className="text-xs text-zinc-300 space-y-1 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800 text-left">
                <div className="flex justify-between"><span>Cliente:</span> <strong>{bookingSuccessModal.customerName}</strong></div>
                <div className="flex justify-between"><span>Serviço:</span> <strong>{bookingSuccessModal.serviceName}</strong></div>
                <div className="flex justify-between"><span>Barbeiro:</span> <strong>{bookingSuccessModal.barberName}</strong></div>
                <div className="flex justify-between"><span>Data & Hora:</span> <strong className="text-amber-400">{bookingSuccessModal.date} às {bookingSuccessModal.time}</strong></div>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href={bookingSuccessModal.gcalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition"
                >
                  <CalendarIcon className="w-4 h-4 text-amber-400" /> Adicionar ao Google Agenda
                </a>

                <button
                  onClick={() => setBookingSuccessModal(null)}
                  className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition"
                >
                  CONCLUÍDO
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
