export type TenantId = 'barbearia-exclusiva' | 'barberflow-concept' | 'barber-kings';

export interface Tenant {
  id: TenantId;
  name: string;
  tagline: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  primaryColor: string;
  accentColor: string;
  pixKey: string;
  mercadoPagoConfigured: boolean;
  stripeConfigured: boolean;
  googleCalendarConnected: boolean;
  openingTime: string; // "09:00"
  closingTime: string; // "20:00"
  workingDays: number[]; // [1, 2, 3, 4, 5, 6] (Mon-Sat)
}

export type ServiceCategory = 'cabelo' | 'barba' | 'combo' | 'estetica' | 'pacote';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: ServiceCategory;
  imageUrl?: string;
  isPopular?: boolean;
  includedItems?: string[];
}

export interface Barber {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  bio: string;
  commissionRatePercent: number;
  workingHours: {
    start: string;
    end: string;
    lunchStart: string;
    lunchEnd: string;
  };
  isActive: boolean;
}

export type CustomerTag = 'VIP' | 'Premium' | 'Mensalista' | 'Inadimplente' | 'Lead' | 'Aniversariante';

export interface BeforeAfterPhoto {
  id: string;
  date: string;
  serviceName: string;
  beforeUrl: string;
  afterUrl: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  birthdate?: string;
  cpf?: string;
  photoUrl?: string;
  address?: string;
  notes?: string;
  tags: CustomerTag[];
  favoriteBarberId?: string;
  favoriteProducts?: string[];
  totalSpent: number;
  visitCount: number;
  lastVisitDate?: string;
  loyaltyPoints: number;
  cashbackBalance: number;
  isVipMember: boolean;
  vipPlanName?: string;
  beforeAfterPhotos?: BeforeAfterPhoto[];
  createdAt: string;
}

export type AppointmentStatus =
  | 'Agendado'
  | 'Confirmado'
  | 'Em Atendimento'
  | 'Concluído'
  | 'Cancelado'
  | 'Falta';

export interface Appointment {
  id: string;
  tenantId: TenantId;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  barberId: string;
  barberName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  status: AppointmentStatus;
  paymentMethod?: 'PIX' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro' | 'Assinatura VIP';
  paymentStatus: 'Pendente' | 'Pago' | 'Reembolsado';
  qrCodeToken: string;
  googleCalendarEventId?: string;
  whatsappSent: boolean;
  internalNotes?: string;
  createdAt: string;
}

export type LeadStage = 'Novo Lead' | 'Contato' | 'Negociação' | 'Agendado' | 'Cliente' | 'Inativo';

export interface PipelineLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: 'Instagram' | 'Google' | 'Indicação' | 'WhatsApp' | 'Site';
  stage: LeadStage;
  estimatedValue: number;
  notes: string;
  lastContactDate: string;
  assignedBarberId?: string;
  tags: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  category: 'Pomada' | 'Shampoo' | 'Óleo' | 'Acessório' | 'Perfume' | 'Uso Interno';
  salePrice: number;
  costPrice: number;
  currentStock: number;
  minStockAlert: number;
  code: string; // barcode
  supplierName: string;
  imageUrl?: string;
}

export type PaymentMethod = 'PIX' | 'Dinheiro' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Mercado Pago' | 'Stripe';

export interface FinancialTransaction {
  id: string;
  type: 'Entrada' | 'Saída';
  category: 'Serviço' | 'Venda de Produto' | 'Comissão' | 'Aluguel' | 'Suprimentos' | 'Marketing' | 'Outros';
  amount: number;
  date: string;
  description: string;
  paymentMethod: PaymentMethod;
  barberId?: string;
  barberCommissionAmount?: number;
  customerName?: string;
}

export interface BarberCommissionSummary {
  barberId: string;
  barberName: string;
  totalServicesAmount: number;
  totalProductsAmount: number;
  commissionPercent: number;
  totalCommissionEarned: number;
  paidAmount: number;
  pendingAmount: number;
  servicesCompletedCount: number;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  channel: 'WhatsApp' | 'Email' | 'SMS';
  targetGroup: 'Aniversariantes' | 'Inativos (30+ dias)' | 'VIPs' | 'Todos os Clientes';
  messageText: string;
  scheduledDate: string;
  sentCount: number;
  deliveredCount: number;
  conversionCount: number;
  status: 'Rascunho' | 'Agendado' | 'Enviado';
}

export interface WhatsAppLog {
  id: string;
  customerName: string;
  phone: string;
  messageType: 'Confirmação' | 'Lembrete 2h' | 'Pesquisa NPS' | 'Promoção IA' | 'Reagendamento';
  content: string;
  sentAt: string;
  status: 'Enviado' | 'Lido' | 'Respondido';
}

export interface WaitingQueueEntry {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  preferredBarberName: string;
  joinedAt: string;
  estimatedWaitMinutes: number;
  status: 'Aguardando' | 'Chamar Próximo' | 'Em Cadeira' | 'Concluído';
}

export interface VIPSubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  benefits: string[];
  maxCutsPerMonth: number;
  isPopular?: boolean;
}
