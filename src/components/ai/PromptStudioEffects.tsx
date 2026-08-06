import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Zap,
  Copy,
  Check,
  Send,
  Sliders,
  Terminal,
  Bookmark,
  RefreshCw,
  MessageSquare,
  Instagram,
  DollarSign,
  Users,
  Award,
  ChevronRight,
  Flame,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Volume2,
  VolumeX,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface PromptTemplate {
  id: string;
  title: string;
  category: 'vendas' | 'instagram' | 'whatsapp' | 'financeiro' | 'fidelidade';
  categoryLabel: string;
  icon: any;
  promptText: string;
  defaultVariables: Record<string, string>;
  description: string;
  tone: string;
  qualityScore: number;
}

const PRESET_TEMPLATES: PromptTemplate[] = [
  {
    id: 'post-fade',
    title: 'Post Instagram: Combo Cabelo + Barba',
    category: 'instagram',
    categoryLabel: 'Redes Sociais',
    icon: Instagram,
    promptText:
      'Crie uma legenda super atraente para o Instagram promovendo o combo {servico_combos} da barbearia. Destaque o barbeiro {barbeiro_destaque}, inclua 3 benefícios do atendimento premium com toalha quente, preço promocional de R$ {preco_promocional} e CTA chamando para agendar no link da bio.',
    defaultVariables: {
      servico_combos: 'Corte Degradê Navalhado + Barba Therapy',
      barbeiro_destaque: 'Lucas Ferreira',
      preco_promocional: '95,00',
    },
    description: 'Engajamento alto com estética visual elegante e hashtags estratégicas.',
    tone: 'Descontraído Barbearia ✂️',
    qualityScore: 98,
  },
  {
    id: 'recupera-cliente',
    title: 'WhatsApp: Recuperação de Inativos',
    category: 'whatsapp',
    categoryLabel: 'WhatsApp & CRM',
    icon: MessageSquare,
    promptText:
      'Escreva uma mensagem curta e persuasiva de WhatsApp para o cliente {nome_cliente} que não visita a barbearia há {dias_inativo} dias. Ofereça um cashback exclusivo de R$ {valor_cashback} para agendamento até esta sexta-feira.',
    defaultVariables: {
      nome_cliente: 'Gabriel Santos',
      dias_inativo: '35',
      valor_cashback: '20,00',
    },
    description: 'Taxa média de conversão de 28% para reativação de clientes VIP.',
    tone: 'Persuasivo VIP 👑',
    qualityScore: 96,
  },
  {
    id: 'analise-caixa',
    title: 'Análise de Caixa e DRE Executivo',
    category: 'financeiro',
    categoryLabel: 'Financeiro',
    icon: DollarSign,
    promptText:
      'Analise o faturamento atual de R$ {faturamento_mes} e custos de R$ {custos_operacionais} da barbearia. Forneça 3 estratégias práticas para aumentar o lucro líquido em {meta_porcentagem}% mantendo o padrão de qualidade.',
    defaultVariables: {
      faturamento_mes: '38.500,00',
      custos_operacionais: '11.200,00',
      meta_porcentagem: '18',
    },
    description: 'Análise detalhada orientada por métricas de alta performance financeiras.',
    tone: 'Corporativo Elegante 🏛️',
    qualityScore: 94,
  },
  {
    id: 'promo-flash',
    title: 'Campanha Flash: Horários Vagos',
    category: 'vendas',
    categoryLabel: 'Promoções',
    icon: Flame,
    promptText:
      'Crie um anúncio de urgência para preencher {vagas_vagas} horários vagos de hoje ({dia_semana}) com o barbeiro {barbeiro_agenda}. Garanta desconto de {desconto_porcento}% para quem confirmar nas próximas 2 horas.',
    defaultVariables: {
      vagas_vagas: '4',
      dia_semana: 'Quarta-Feira',
      barbeiro_agenda: 'Matheus Silva',
      desconto_porcento: '15',
    },
    description: 'Excelente para dias de menor movimento e otimização de agenda.',
    tone: 'Promocional Urgente 🚀',
    qualityScore: 99,
  },
];

const VARIABLE_CHIPS = [
  { tag: '{nome_cliente}', label: 'Nome Cliente', sample: 'Ricardo Lima' },
  { tag: '{barbeiro_destaque}', label: 'Barbeiro', sample: 'Lucas Ferreira' },
  { tag: '{servico_combos}', label: 'Serviço Combo', sample: 'Corte + Barba' },
  { tag: '{dias_inativo}', label: 'Dias Sem Vir', sample: '30' },
  { tag: '{desconto_porcento}', label: '% Desconto', sample: '15' },
  { tag: '{valor_cashback}', label: 'R$ Cashback', sample: '20,00' },
];

interface PromptStudioEffectsProps {
  onExecutePrompt: (prompt: string, taskType: string) => Promise<string>;
  contextData?: any;
}

export const PromptStudioEffects: React.FC<PromptStudioEffectsProps> = ({
  onExecutePrompt,
  contextData,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [activePromptText, setActivePromptText] = useState<string>(
    PRESET_TEMPLATES[0].promptText
  );
  const [variables, setVariables] = useState<Record<string, string>>(
    PRESET_TEMPLATES[0].defaultVariables
  );
  const [selectedTone, setSelectedTone] = useState<string>('Persuasivo VIP 👑');
  const [activeTaskType, setActiveTaskType] = useState<string>('instagram_post');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [displayedText, setDisplayedText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>(['post-fade']);
  const responseEndRef = useRef<HTMLDivElement>(null);

  // Extract variables from prompt dynamically using regex
  const detectedVariables: string[] = Array.from(
    new Set((activePromptText.match(/\{[a-zA-Z0-9_]+\}/g) || []).map((v) => v.slice(1, -1)))
  );

  // Typewriter streaming effect for AI response
  useEffect(() => {
    if (!rawResponse) {
      setDisplayedText('');
      return;
    }

    setDisplayedText('');
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < rawResponse.length) {
        setDisplayedText((prev) => prev + rawResponse.charAt(currentIndex));
        currentIndex++;
        if (soundEnabled && currentIndex % 12 === 0) {
          // Subtle audio ping or feedback indicator simulation
        }
      } else {
        clearInterval(interval);
      }
    }, 12);

    return () => clearInterval(interval);
  }, [rawResponse, soundEnabled]);

  const handleSelectTemplate = (template: PromptTemplate) => {
    setActivePromptText(template.promptText);
    setVariables(template.defaultVariables);
    setSelectedTone(template.tone);
    if (template.category === 'instagram') setActiveTaskType('instagram_post');
    else if (template.category === 'whatsapp') setActiveTaskType('campaign');
    else if (template.category === 'financeiro') setActiveTaskType('financial_insight');
    else setActiveTaskType('general');
  };

  const handleInjectVariable = (tag: string) => {
    setActivePromptText((prev) => prev + ` ${tag}`);
  };

  const handleVariableChange = (varKey: string, value: string) => {
    setVariables((prev) => ({ ...prev, [varKey]: value }));
  };

  const getComputedPrompt = () => {
    let result = activePromptText;
    Object.entries(variables).forEach(([key, val]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, val || `{${key}}`);
    });
    return `${result}\n\n[Tom de Voz Desejado: ${selectedTone}]`;
  };

  const handleRunAiPrompt = async () => {
    setIsGenerating(true);
    setRawResponse('');
    setDisplayedText('');

    try {
      const finalPrompt = getComputedPrompt();
      const resText = await onExecutePrompt(finalPrompt, activeTaskType);
      setRawResponse(resText);
    } catch (err) {
      setRawResponse('Erro ao comunicar com a IA. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(displayedText || rawResponse);
    setCopied(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#D4AF37', '#F5E1A4', '#10B981'],
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Calculate Prompt Quality Score
  const computeScore = () => {
    let score = 70;
    if (activePromptText.length > 50) score += 10;
    if (detectedVariables.length > 0) score += 10;
    if (selectedTone) score += 10;
    return Math.min(score, 100);
  };

  const filteredTemplates = PRESET_TEMPLATES.filter((t) =>
    selectedCategory === 'todos' ? true : t.category === selectedCategory
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Top Studio Title Banner with Glow */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#111114] via-[#18181C] to-[#111114] border border-[#D4AF37]/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-4 h-4 animate-spin-slow" /> GEMINI 3.6 PROMPT STUDIO
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Gerador de Prompts e Conteúdo com Efeitos React
            </h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl">
              Crie campanhas magnéticas, copies de vendas e análises estratégicas com pré-visualização dinâmica, preenchimento de variáveis e streaming de IA.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-[#D4AF37] transition text-xs flex items-center gap-2"
              title="Alternar efeito sonoro"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#D4AF37]" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Sons Ativos' : 'Mudo'}</span>
            </button>

            <div className="px-4 py-2 rounded-xl bg-[#18181B] border border-white/10 text-xs text-slate-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#D4AF37]" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Motor IA</p>
                <p className="font-bold text-white text-[11px]">Gemini 3.6 Flash</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Prompt Template Selector Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#D4AF37]" /> Prompts Prontos de Alta Conversão
          </h3>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'instagram', label: 'Instagram' },
              { id: 'whatsapp', label: 'WhatsApp' },
              { id: 'financeiro', label: 'Financeiro' },
              { id: 'vendas', label: 'Promoções' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap border ${
                  selectedCategory === cat.id
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 font-bold'
                    : 'bg-[#111114] text-slate-400 border-white/5 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTemplates.map((template) => {
            const IconComponent = template.icon;
            const isFav = favorites.includes(template.id);

            return (
              <motion.div
                key={template.id}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectTemplate(template)}
                className="p-5 rounded-2xl bg-[#111114] border border-white/10 hover:border-[#D4AF37]/50 transition-all cursor-pointer space-y-3 relative group flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(template.id);
                      }}
                      className="p-1 text-slate-500 hover:text-[#D4AF37] transition"
                    >
                      <Bookmark className={`w-4 h-4 ${isFav ? 'fill-[#D4AF37] text-[#D4AF37]' : ''}`} />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition leading-tight">
                    {template.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {template.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">{template.categoryLabel}</span>
                  <span className="text-[#D4AF37] font-bold flex items-center gap-1">
                    Score {template.qualityScore}% <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Prompt Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Prompt Editor & Live Variables */}
        <div className="lg:col-span-2 space-y-5">
          <div className="p-6 bg-[#111114] rounded-2xl border border-white/10 space-y-4 shadow-xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Editor do Prompt Interativo
                </h3>
              </div>

              {/* Quality Score Indicator */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">Qualidade:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {computeScore()}/100 Ótimo
                </span>
              </div>
            </div>

            {/* Quick Variable Inject Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-medium">
                Inserir Variáveis Dinâmicas no Prompt:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {VARIABLE_CHIPS.map((chip) => (
                  <button
                    key={chip.tag}
                    onClick={() => handleInjectVariable(chip.tag)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/40 text-[#D4AF37] text-[11px] font-mono transition flex items-center gap-1"
                  >
                    + {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Textarea Canvas */}
            <div className="relative">
              <textarea
                rows={5}
                value={activePromptText}
                onChange={(e) => setActivePromptText(e.target.value)}
                placeholder="Digite a instrução da sua campanha ou selecione um prompt acima..."
                className="w-full bg-[#09090B] border border-white/10 focus:border-[#D4AF37] rounded-xl p-4 text-xs text-white placeholder-slate-600 focus:outline-none transition leading-relaxed font-sans"
              />
            </div>

            {/* Dynamic Fillable Variable Inputs */}
            {detectedVariables.length > 0 && (
              <div className="p-4 rounded-xl bg-[#18181C] border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-bold uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Preencher Valores das Variáveis do Prompt</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detectedVariables.map((vKey) => (
                    <div key={vKey} className="space-y-1">
                      <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                        {vKey.replace(/_/g, ' ')}
                      </label>
                      <input
                        type="text"
                        value={variables[vKey] || ''}
                        onChange={(e) => handleVariableChange(vKey, e.target.value)}
                        placeholder={`Digite ${vKey}...`}
                        className="w-full px-3 py-1.5 bg-[#09090B] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tone Selector & Submit Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Tom de Voz:</span>
                <select
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="bg-[#18181B] border border-white/10 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Persuasivo VIP 👑">Persuasivo VIP 👑</option>
                  <option value="Descontraído Barbearia ✂️">Descontraído Barbearia ✂️</option>
                  <option value="Corporativo Elegante 🏛️">Corporativo Elegante 🏛️</option>
                  <option value="Promocional Urgente 🚀">Promocional Urgente 🚀</option>
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRunAiPrompt}
                disabled={isGenerating || !activePromptText}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5E1A4] text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>PROCESSANDO IA...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-black" />
                    <span>GERAR COM GEMINI IA</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Live Stream Output Display */}
        <div className="space-y-5">
          <div className="p-6 bg-[#111114] rounded-2xl border border-white/10 min-h-[380px] flex flex-col justify-between shadow-xl relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Resultado Gerado em Tempo Real
                  </h3>
                </div>

                {(displayedText || rawResponse) && (
                  <button
                    onClick={handleCopyResponse}
                    className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 flex items-center gap-1.5 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Copiar Texto</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Response Output Box with Cursor */}
              <div className="text-xs text-slate-200 leading-relaxed font-sans min-h-[220px] whitespace-pre-line bg-[#09090B] p-4 rounded-xl border border-white/5">
                {displayedText ? (
                  <div>
                    {displayedText}
                    {displayedText.length < rawResponse.length && (
                      <span className="inline-block w-1.5 h-3.5 bg-[#D4AF37] ml-1 animate-pulse" />
                    )}
                  </div>
                ) : isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3 text-slate-400">
                    <Sparkles className="w-8 h-8 text-[#D4AF37] animate-pulse" />
                    <p className="text-xs font-medium">Gerando conteúdo com inteligência Gemini...</p>
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-center py-12">
                    Selecione um prompt ou clique em "Gerar com Gemini IA" para ver a magia acontecer aqui...
                  </p>
                )}
                <div ref={responseEndRef} />
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Resposta Pronta para Disparo
              </span>
              <span>BarberFlow Engine v2.4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
