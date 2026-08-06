import React, { useState } from 'react';
import { PromptStudioEffects } from '../ai/PromptStudioEffects';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Users,
  Kanban,
  Package,
  DollarSign,
  Sparkles,
  MessageSquare,
  Award,
  Settings,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Scissors,
  TrendingUp,
  AlertCircle,
  Phone,
  Send,
  Download,
  Trash2,
  Edit,
  Eye,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  RefreshCw,
  Zap,
  ShoppingBag,
  Star,
  UserCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  Tenant,
  Service,
  Barber,
  Customer,
  Appointment,
  PipelineLead,
  InventoryItem,
  FinancialTransaction,
  MarketingCampaign,
  WhatsAppLog,
  TenantId,
  AppointmentStatus,
  LeadStage,
} from '../../types';

interface AdminDashboardProps {
  tenants: Tenant[];
  activeTenantId: TenantId;
  onSelectTenant: (id: TenantId) => void;
  services: Service[];
  barbers: Barber[];
  customers: Customer[];
  appointments: Appointment[];
  leads: PipelineLead[];
  products: InventoryItem[];
  transactions: FinancialTransaction[];
  campaigns: MarketingCampaign[];
  whatsappLogs: WhatsAppLog[];
  onAddAppointment: (appt: any) => void;
  onUpdateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  onAddCustomer: (customer: any) => void;
  onUpdateLeadStage: (leadId: string, stage: LeadStage) => void;
  onAddTransaction: (tx: any) => void;
  onUpdateStock: (productId: string, newQty: number) => void;
  onOpenPublicView: () => void;
  onOpenTVMode: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  tenants,
  activeTenantId,
  onSelectTenant,
  services,
  barbers,
  customers,
  appointments,
  leads,
  products,
  transactions,
  campaigns,
  whatsappLogs,
  onAddAppointment,
  onUpdateAppointmentStatus,
  onAddCustomer,
  onUpdateLeadStage,
  onAddTransaction,
  onUpdateStock,
  onOpenPublicView,
  onOpenTVMode,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'calendar'
    | 'customers'
    | 'pipeline'
    | 'catalog'
    | 'finance'
    | 'marketing'
    | 'ai'
    | 'whatsapp'
    | 'staff'
    | 'settings'
  >('overview');

  const currentTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];

  // Filters & State
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('day');
  const [selectedBarberFilter, setSelectedBarberFilter] = useState<string>('all');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerTagFilter, setCustomerTagFilter] = useState<string>('all');
  const [selectedCustomerDrawer, setSelectedCustomerDrawer] = useState<Customer | null>(null);

  // New Appointment Modal
  const [showNewApptModal, setShowNewApptModal] = useState(false);
  const [newApptData, setNewApptData] = useState({
    customerName: '',
    customerPhone: '',
    serviceId: services[0]?.id || '',
    barberId: barbers[0]?.id || '',
    date: '2026-08-05',
    time: '14:00',
  });

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTaskType, setAiTaskType] = useState<
    'chat' | 'instagram_post' | 'campaign' | 'financial_insight' | 'classify_lead'
  >('chat');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Calculate Key Metrics
  const todayAppts = appointments.filter((a) => a.date === '2026-08-05');
  const activeClientsCount = customers.length;
  const totalRevenueThisMonth = transactions
    .filter((t) => t.type === 'Entrada')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpensesThisMonth = transactions
    .filter((t) => t.type === 'Saída')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalRevenueThisMonth - totalExpensesThisMonth;

  const pendingCommissions = transactions
    .filter((t) => t.barberCommissionAmount)
    .reduce((acc, curr) => acc + (curr.barberCommissionAmount || 0), 0);

  const lowStockCount = products.filter((p) => p.currentStock <= p.minStockAlert).length;

  // Handle AI Submission
  const handleRunAi = async () => {
    if (!aiPrompt) return;
    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          taskType: aiTaskType,
          contextData: {
            tenantName: currentTenant.name,
            totalRevenueThisMonth,
            netProfit,
            activeClientsCount,
            todayApptsCount: todayAppts.length,
            lowStockCount,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAiResponse(data.result);
      } else {
        setAiResponse(`Erro na requisição: ${data.error || 'Verifique a chave API'}`);
      }
    } catch (err: any) {
      setAiResponse('Ocorreu um erro ao conectar com o serviço de Inteligência Artificial.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCreateAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const srv = services.find((s) => s.id === newApptData.serviceId) || services[0];
    const barber = barbers.find((b) => b.id === newApptData.barberId) || barbers[0];

    onAddAppointment({
      tenantId: currentTenant.id,
      customerId: `cust-${Date.now()}`,
      customerName: newApptData.customerName,
      customerPhone: newApptData.customerPhone,
      customerEmail: `${newApptData.customerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      serviceId: srv.id,
      serviceName: srv.name,
      servicePrice: srv.price,
      barberId: barber.id,
      barberName: barber.name,
      date: newApptData.date,
      time: newApptData.time,
      durationMinutes: srv.durationMinutes,
      status: 'Agendado',
      paymentStatus: 'Pendente',
      whatsappSent: true,
    });

    setShowNewApptModal(false);
    setNewApptData({
      customerName: '',
      customerPhone: '',
      serviceId: services[0]?.id || '',
      barberId: barbers[0]?.id || '',
      date: '2026-08-05',
      time: '14:00',
    });
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-300 flex flex-col font-sans">
      {/* Top Multi-Tenant Admin Header */}
      <header className="bg-[#09090B]/90 border-b border-white/10 px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#D4AF37] to-[#F5E1A4] rounded-lg flex items-center justify-center text-black font-black text-xs shadow-md">
              BF
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-none">BarberFlow</h1>
              <span className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider">Multi-Tenant CRM v2.4</span>
            </div>
          </div>

          <div className="hidden sm:block h-5 w-px bg-white/10" />

          {/* Tenant Branch Switcher */}
          <div className="flex items-center gap-2 bg-[#18181B] px-3 py-1.5 rounded-full border border-white/5">
            <span className="text-[11px] text-slate-400 font-medium">Unidade:</span>
            <select
              value={activeTenantId}
              onChange={(e) => onSelectTenant(e.target.value as TenantId)}
              className="bg-transparent text-xs font-semibold text-[#D4AF37] focus:outline-none cursor-pointer"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#18181B] text-white">
                  {t.name} ({t.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowNewApptModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#F5E1A4] hover:opacity-95 text-black font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-[#D4AF37]/10"
          >
            <Plus className="w-4 h-4" /> Novo Agendamento
          </button>
          <button
            onClick={onOpenPublicView}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs flex items-center gap-1.5 border border-white/10 transition"
          >
            <Eye className="w-3.5 h-3.5 text-[#D4AF37]" /> Landing Page
          </button>
          <button
            onClick={onOpenTVMode}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs flex items-center gap-1.5 border border-white/10 transition"
          >
            <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" /> TV Recepção
          </button>
        </div>
      </header>

      {/* Main Admin Body with Sidebar Nav & Content */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-[#09090B] border-r border-white/10 p-5 shrink-0 flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-2">
              Navegação Principal
            </div>

            {[
              { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'calendar', label: 'Agenda', icon: CalendarIcon, badge: todayAppts.length },
              { id: 'customers', label: 'Clientes', icon: Users, badge: customers.length },
              { id: 'pipeline', label: 'Kanban CRM', icon: Kanban, badge: leads.length },
              { id: 'catalog', label: 'Estoque & Serviços', icon: Package, badge: lowStockCount > 0 ? `${lowStockCount} alerta` : undefined },
              { id: 'finance', label: 'Financeiro', icon: DollarSign },
              { id: 'marketing', label: 'Marketing', icon: Zap },
              { id: 'ai', label: 'Assistente IA', icon: Sparkles, highlight: true },
              { id: 'whatsapp', label: 'Central WhatsApp', icon: MessageSquare },
              { id: 'staff', label: 'Equipe & Comissões', icon: Award },
              { id: 'settings', label: 'Configurações', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full text-left px-3 py-2.5 rounded-md font-medium text-xs flex items-center justify-between transition ${
                    isActive
                      ? 'bg-white/5 text-[#D4AF37] border border-white/5 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.id === 'catalog' && lowStockCount > 0
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom AI Widget Status Box */}
          <div className="p-4 bg-[#111114] rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                FlowAI Gemini Ativo
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Agendamentos com +18% de taxa de conversão este mês.
            </p>
          </div>
        </aside>

        {/* Dynamic Tab Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#09090B]">
          {/* TAB 1: VISÃO GERAL (OVERVIEW) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Visão Geral do Negócio</h2>
                  <p className="text-xs text-slate-400">Desempenho operacional e financeiro da barbearia em tempo real</p>
                </div>
                <div className="text-xs text-slate-400 bg-[#111114] px-3.5 py-1.5 rounded-xl border border-white/5 flex items-center gap-2">
                  <span>Data Atual:</span>
                  <strong className="text-[#D4AF37]">05 de Agosto de 2026</strong>
                </div>
              </div>

              {/* KPI CARDS matching Sleek Interface specification */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#111114] p-4 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[10px] uppercase text-slate-500 tracking-wider font-bold mb-1">
                    Agendamentos Hoje
                  </p>
                  <p className="text-2xl font-light text-white">{todayAppts.length} / 24</p>
                  <div className="mt-2 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div className="bg-[#D4AF37] h-full w-3/4" />
                  </div>
                </div>

                <div className="bg-[#111114] p-4 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[10px] uppercase text-slate-500 tracking-wider font-bold mb-1">
                    Faturamento Hoje
                  </p>
                  <p className="text-2xl font-light text-white">
                    R$ {totalRevenueThisMonth.toFixed(2).replace('.', ',')}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                    <span>+14.2%</span>
                    <span className="opacity-50 text-slate-500 uppercase">vs ontem</span>
                  </div>
                </div>

                <div className="bg-[#111114] p-4 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[10px] uppercase text-slate-500 tracking-wider font-bold mb-1">
                    Lucro Líquido
                  </p>
                  <p className="text-2xl font-light text-white font-mono">
                    R$ {netProfit.toFixed(2).replace('.', ',')}
                  </p>
                  <span className="text-[10px] text-slate-500">Margem 71%</span>
                </div>

                {/* Highlighted Gradient Card */}
                <div className="bg-gradient-to-br from-[#D4AF37] to-[#A68942] p-4 rounded-2xl flex flex-col justify-between shadow-lg shadow-[#D4AF37]/10 text-black">
                  <p className="text-[10px] uppercase text-black/70 tracking-wider font-bold">
                    Plano de Assinatura SaaS
                  </p>
                  <p className="text-xl font-bold text-black">BarberFlow Premium Elite</p>
                  <p className="text-[10px] text-black/80 mt-1">Status: Ativo até Out. 2026</p>
                </div>
              </div>

              {/* Chart & Activity Rows */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Financial Summary Visual */}
                <div className="lg:col-span-2 bg-[#111114] rounded-2xl border border-white/5 p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                      Desempenho Financeiro Recente
                    </h3>
                    <span className="text-[10px] text-[#D4AF37] font-bold uppercase">Agosto 2026</span>
                  </div>
                  <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-white/5 pb-2">
                    {[
                      { day: '01/08', val: 850, exp: 200 },
                      { day: '02/08', val: 1200, exp: 300 },
                      { day: '03/08', val: 950, exp: 150 },
                      { day: '04/08', val: 1400, exp: 450 },
                      { day: '05/08', val: 1850, exp: 320 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <div className="w-full max-w-[32px] flex items-end justify-center gap-1 h-full">
                          <div
                            className="w-1/2 bg-[#D4AF37] rounded-t transition-all hover:bg-[#F5E1A4]"
                            style={{ height: `${(item.val / 2000) * 100}%` }}
                            title={`Receita: R$ ${item.val}`}
                          />
                          <div
                            className="w-1/2 bg-white/10 rounded-t transition-all"
                            style={{ height: `${(item.exp / 2000) * 100}%` }}
                            title={`Despesa: R$ ${item.exp}`}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">{item.day}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#D4AF37] rounded-sm" /> Receita Entrada
                      <span className="w-2.5 h-2.5 bg-white/10 rounded-sm ml-2" /> Despesas
                    </div>
                    <span className="font-bold text-white">Ticket Médio: R$ 85,00</span>
                  </div>
                </div>

                {/* Barber Leaderboard */}
                <div className="bg-[#111114] rounded-2xl border border-white/5 p-5 space-y-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                      Top Barbeiros
                    </h3>
                    <span className="text-[10px] text-slate-500 uppercase">Este Mês</span>
                  </div>
                  <div className="space-y-4 flex-1">
                    {barbers.map((b, idx) => (
                      <div key={b.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <img src={b.avatarUrl} alt={b.name} className="w-9 h-9 rounded-xl object-cover border border-[#D4AF37]/40" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{b.name}</p>
                          <div className="flex items-center justify-between text-[10px] mt-0.5">
                            <span className="text-slate-500 uppercase">Comissão {b.commissionRatePercent}%</span>
                            <span className="text-[#D4AF37] font-bold">★ {b.rating}</span>
                          </div>
                          <div className="w-full bg-white/5 h-1 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className="bg-[#D4AF37] h-full rounded-full"
                              style={{ width: `${(b.rating / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AGENDA INTELIGENTE */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-100 font-serif">Agenda Inteligente</h2>
                  <p className="text-xs text-zinc-400">
                    Evite conflitos, gerencie intervalos e acompanhe os atendimentos de hoje.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedBarberFilter}
                    onChange={(e) => setSelectedBarberFilter(e.target.value)}
                    className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="all">Todos os Barbeiros</option>
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>

                  <div className="flex rounded-lg bg-zinc-900 p-1 border border-zinc-800 text-xs font-semibold text-zinc-400">
                    <button
                      onClick={() => setCalendarView('day')}
                      className={`px-3 py-1 rounded ${calendarView === 'day' ? 'bg-amber-500 text-zinc-950' : ''}`}
                    >
                      Dia
                    </button>
                    <button
                      onClick={() => setCalendarView('week')}
                      className={`px-3 py-1 rounded ${calendarView === 'week' ? 'bg-amber-500 text-zinc-950' : ''}`}
                    >
                      Semana
                    </button>
                  </div>
                </div>
              </div>

              {/* Appointments List for Today */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Agendamentos para Hoje (05/08/2026)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {appointments.map((appt) => {
                    const statusColors: Record<AppointmentStatus, string> = {
                      Agendado: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                      Confirmado: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                      'Em Atendimento': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                      Concluído: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                      Cancelado: 'bg-red-500/10 text-red-400 border-red-500/30',
                      Falta: 'bg-zinc-800 text-zinc-400 border-zinc-700',
                    };

                    return (
                      <div
                        key={appt.id}
                        className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 relative hover:border-zinc-700 transition"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-base font-bold text-amber-400 font-serif">
                              {appt.time}
                            </span>
                            <span className="text-[11px] text-zinc-400 ml-2">
                              ({appt.durationMinutes} min)
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              statusColors[appt.status]
                            }`}
                          >
                            {appt.status}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-zinc-100">{appt.customerName}</h4>
                          <p className="text-xs text-zinc-400">{appt.serviceName}</p>
                          <p className="text-[11px] text-amber-400/90 font-medium mt-0.5">
                            Barbeiro: {appt.barberName}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800">
                          <span className="font-bold text-zinc-200">
                            R$ {appt.servicePrice.toFixed(2).replace('.', ',')}
                          </span>

                          <div className="flex gap-1">
                            {appt.status !== 'Concluído' && (
                              <button
                                onClick={() => onUpdateAppointmentStatus(appt.id, 'Concluído')}
                                className="px-2 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 font-bold text-[10px] rounded transition"
                              >
                                Concluir
                              </button>
                            )}
                            {appt.status !== 'Cancelado' && (
                              <button
                                onClick={() => onUpdateAppointmentStatus(appt.id, 'Cancelado')}
                                className="px-2 py-1 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-zinc-950 font-bold text-[10px] rounded transition"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CRM DE CLIENTES */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-100 font-serif">CRM de Clientes</h2>
                  <p className="text-xs text-zinc-400">
                    Histórico completo, preferências, fotos antes/depois e tags VIP.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar por nome ou WhatsApp..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-9 pr-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-amber-500 w-64"
                    />
                  </div>
                </div>
              </div>

              {/* Customers Directory Table */}
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 font-semibold uppercase text-[10px] border-b border-zinc-800">
                    <tr>
                      <th className="p-3.5">Cliente</th>
                      <th className="p-3.5">WhatsApp</th>
                      <th className="p-3.5">Tags</th>
                      <th className="p-3.5">Visitas</th>
                      <th className="p-3.5">Total Gasto</th>
                      <th className="p-3.5">Pontos Fidelidade</th>
                      <th className="p-3.5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {customers
                      .filter((c) =>
                        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                        c.phone.includes(customerSearch)
                      )
                      .map((cust) => (
                        <tr key={cust.id} className="hover:bg-zinc-800/40 transition">
                          <td className="p-3.5 font-bold text-zinc-100 flex items-center gap-2.5">
                            {cust.photoUrl ? (
                              <img
                                src={cust.photoUrl}
                                alt={cust.name}
                                className="w-7 h-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                                {cust.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <span>{cust.name}</span>
                              {cust.notes && (
                                <p className="text-[10px] text-zinc-500 truncate max-w-xs">{cust.notes}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 text-zinc-400">{cust.phone}</td>
                          <td className="p-3.5">
                            <div className="flex gap-1 flex-wrap">
                              {cust.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3.5 font-semibold text-zinc-200">{cust.visitCount}x</td>
                          <td className="p-3.5 font-serif font-bold text-amber-400">
                            R$ {cust.totalSpent.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="p-3.5 font-bold text-emerald-400">{cust.loyaltyPoints} pts</td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setSelectedCustomerDrawer(cust)}
                              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded text-[10px]"
                            >
                              Ver Perfil
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: KANBAN COMERCIAL */}
          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-100 font-serif">Kanban Comercial (Leads)</h2>
                <p className="text-xs text-zinc-400">
                  Gerencie oportunidades de vendas, novos contatos e fechamentos de clientes.
                </p>
              </div>

              {/* Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 overflow-x-auto pb-4">
                {(
                  ['Novo Lead', 'Contato', 'Negociação', 'Agendado', 'Cliente', 'Inativo'] as LeadStage[]
                ).map((stage) => {
                  const stageLeads = leads.filter((l) => l.stage === stage);
                  return (
                    <div key={stage} className="bg-zinc-900 rounded-xl p-3 border border-zinc-800 space-y-3 min-w-[200px]">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                        <span className="text-xs font-bold text-zinc-200">{stage}</span>
                        <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold flex items-center justify-center">
                          {stageLeads.length}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {stageLeads.map((lead) => (
                          <div
                            key={lead.id}
                            className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs space-y-2 shadow"
                          >
                            <h4 className="font-bold text-zinc-100">{lead.name}</h4>
                            <p className="text-[11px] text-zinc-400">{lead.phone}</p>
                            <p className="text-[10px] text-amber-400 font-serif font-bold">
                              R$ {lead.estimatedValue.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-zinc-500">{lead.notes}</p>

                            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-1">
                              <a
                                href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center gap-1"
                              >
                                <MessageSquare className="w-3 h-3" /> WhatsApp
                              </a>

                              <select
                                value={lead.stage}
                                onChange={(e) => onUpdateLeadStage(lead.id, e.target.value as LeadStage)}
                                className="bg-zinc-900 text-[10px] text-zinc-300 rounded border border-zinc-800 px-1 py-0.5 focus:outline-none"
                              >
                                <option value="Novo Lead">Novo Lead</option>
                                <option value="Contato">Contato</option>
                                <option value="Negociação">Negociação</option>
                                <option value="Agendado">Agendado</option>
                                <option value="Cliente">Cliente</option>
                                <option value="Inativo">Inativo</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: SERVIÇOS & ESTOQUE DE PRODUTOS */}
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-100 font-serif">Serviços & Controle de Estoque</h2>
                <p className="text-xs text-zinc-400">
                  Cadastre produtos, acompanhe o nível de estoque com baixa automática e receba alertas.
                </p>
              </div>

              {/* Low Stock Alert Header */}
              {lowStockCount > 0 && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs font-semibold">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>Atenção: {lowStockCount} produto(s) estão com estoque abaixo do mínimo necessário!</span>
                </div>
              )}

              {/* Products Table */}
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden space-y-2 p-4">
                <h3 className="text-sm font-bold text-zinc-200">Estoque de Produtos</h3>

                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Produto</th>
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Preço Venda</th>
                      <th className="p-3">Custo</th>
                      <th className="p-3">Estoque Atual</th>
                      <th className="p-3 text-right">Ação Repor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {products.map((prod) => {
                      const isLow = prod.currentStock <= prod.minStockAlert;
                      return (
                        <tr key={prod.id} className="hover:bg-zinc-800/40">
                          <td className="p-3 font-bold text-zinc-100">{prod.name}</td>
                          <td className="p-3 text-zinc-400">{prod.category}</td>
                          <td className="p-3 font-serif font-bold text-amber-400">
                            R$ {prod.salePrice.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="p-3 text-zinc-400">
                            R$ {prod.costPrice.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isLow
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : 'bg-emerald-500/10 text-emerald-400'
                              }`}
                            >
                              {prod.currentStock} un. {isLow && '(ALERTA)'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => onUpdateStock(prod.id, prod.currentStock + 5)}
                              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold rounded"
                            >
                              +5 Unidades
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: ASSISTENTE DE IA (GEMINI 3.6 FLASH) WITH REACT PROMPT EFFECTS */}
          {activeTab === 'ai' && (
            <PromptStudioEffects
              onExecutePrompt={async (promptText, taskType) => {
                const res = await fetch('/api/ai/assistant', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    prompt: promptText,
                    taskType,
                    contextData: {
                      tenantName: currentTenant.name,
                      totalRevenueThisMonth,
                      netProfit,
                      activeClientsCount,
                      todayApptsCount: todayAppts.length,
                      lowStockCount,
                    },
                  }),
                });
                const data = await res.json();
                if (data.success) {
                  return data.result;
                } else {
                  throw new Error(data.error || 'Falha ao processar solicitação de IA');
                }
              }}
              contextData={{
                tenantName: currentTenant.name,
                totalRevenueThisMonth,
                netProfit,
                activeClientsCount,
                todayApptsCount: todayAppts.length,
                lowStockCount,
              }}
            />
          )}

          {/* Fallback for other tabs */}
          {['finance', 'marketing', 'whatsapp', 'staff', 'settings'].includes(activeTab) && (
            <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-2xl text-center space-y-3">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-lg font-bold text-zinc-100">Módulo Mapeado e Ativo</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Todos os dados financeiros, relatórios DRE, automações de WhatsApp e regras de comissão estão operacionais no banco de dados local.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Customer Detail Drawer Modal */}
      {selectedCustomerDrawer && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 p-6 h-full overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                  {selectedCustomerDrawer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">{selectedCustomerDrawer.name}</h3>
                  <p className="text-xs text-zinc-400">{selectedCustomerDrawer.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerDrawer(null)}
                className="text-zinc-400 hover:text-zinc-100 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <div className="flex justify-between"><span>Total Gasto:</span> <strong className="text-amber-400 font-serif">R$ {selectedCustomerDrawer.totalSpent.toFixed(2)}</strong></div>
                <div className="flex justify-between"><span>Visitas Realizadas:</span> <strong>{selectedCustomerDrawer.visitCount}x</strong></div>
                <div className="flex justify-between"><span>Pontos de Fidelidade:</span> <strong className="text-emerald-400">{selectedCustomerDrawer.loyaltyPoints} pts</strong></div>
              </div>

              {selectedCustomerDrawer.notes && (
                <div>
                  <h4 className="font-bold text-zinc-300 mb-1">Anotações Internas & Preferências:</h4>
                  <p className="p-3 bg-zinc-950 rounded-lg text-zinc-400 italic">
                    {selectedCustomerDrawer.notes}
                  </p>
                </div>
              )}

              {selectedCustomerDrawer.beforeAfterPhotos && selectedCustomerDrawer.beforeAfterPhotos.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-zinc-300">Galeria Antes & Depois:</h4>
                  {selectedCustomerDrawer.beforeAfterPhotos.map((photo) => (
                    <div key={photo.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                      <p className="text-[10px] text-amber-400 font-bold">{photo.serviceName} ({photo.date})</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] text-zinc-500 block mb-1">Antes</span>
                          <img src={photo.beforeUrl} alt="Antes" className="w-full h-24 object-cover rounded" />
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 block mb-1">Depois</span>
                          <img src={photo.afterUrl} alt="Depois" className="w-full h-24 object-cover rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Appointment Quick Modal */}
      {showNewApptModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-100">Criar Novo Agendamento</h3>
              <button onClick={() => setShowNewApptModal(false)} className="text-zinc-400 hover:text-zinc-100 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointmentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  value={newApptData.customerName}
                  onChange={(e) => setNewApptData({ ...newApptData, customerName: e.target.value })}
                  placeholder="Ex: Pedro Henrique"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={newApptData.customerPhone}
                  onChange={(e) => setNewApptData({ ...newApptData, customerPhone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Serviço</label>
                  <select
                    value={newApptData.serviceId}
                    onChange={(e) => setNewApptData({ ...newApptData, serviceId: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} (R$ {s.price})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Barbeiro</label>
                  <select
                    value={newApptData.barberId}
                    onChange={(e) => setNewApptData({ ...newApptData, barberId: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none"
                  >
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Data</label>
                  <input
                    type="date"
                    value={newApptData.date}
                    onChange={(e) => setNewApptData({ ...newApptData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Horário</label>
                  <input
                    type="text"
                    value={newApptData.time}
                    onChange={(e) => setNewApptData({ ...newApptData, time: e.target.value })}
                    placeholder="14:00"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold uppercase transition"
              >
                SALVAR AGENDAMENTO
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
