import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'BarberFlow CRM', time: new Date().toISOString() });
});

// AI Assistant Endpoint using Gemini 3.6 Flash
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { prompt, taskType, contextData } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let systemInstruction = `Você é a IA oficial do BarberFlow CRM, o sistema operacional inteligente para barbearias de alto padrão.
Seu tom é extremamente profissional, cortês, elegante e focado em alta lucratividade e satisfação de clientes.
Responda sempre em Português do Brasil com excelente formatação em Markdown (títulos, marcadores e destaques em negrito).`;

    if (taskType === 'instagram_post') {
      systemInstruction += ` Seu objetivo é criar 3 opções incríveis de posts para o Instagram de uma barbearia premium.
Inclua: Título atrativo, Legenda engajadora, Sugestão de foto/vídeo e Hashtags estratégicas.`;
    } else if (taskType === 'campaign') {
      systemInstruction += ` Seu objetivo é criar um texto curto e altamente persuasivo para disparo via WhatsApp ou E-mail para atrair ou recuperar clientes.`;
    } else if (taskType === 'financial_insight') {
      systemInstruction += ` Seu objetivo é analisar métricas financeiras (faturamento, margem de lucro, ticket médio, comissões) e fornecer 3 recomendações acionáveis para aumentar a receita em 20%.`;
    } else if (taskType === 'classify_lead') {
      systemInstruction += ` Analise as informações do lead e classifique sua prioridade (Alta, Média, Baixa) com a melhor abordagem de fechamento.`;
    }

    const fullPrompt = `${prompt}
${contextData ? `\nDados de Contexto do Sistema:\n${JSON.stringify(contextData, null, 2)}` : ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const outputText = response.text || 'Não foi possível gerar uma resposta no momento.';

    return res.json({
      success: true,
      result: outputText,
      taskType: taskType || 'general',
    });
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    return res.status(500).json({
      success: false,
      error: 'Falha ao processar solicitação de IA. Verifique sua chave API do Gemini.',
      details: error.message,
    });
  }
});

// Google Calendar Sync & ICS Generator Endpoint
app.post('/api/calendar/add-event', (req, res) => {
  const { serviceName, barberName, date, time, customerName, address } = req.body;

  // Format date time for Google Calendar URL (YYYYMMDDTHHMMSSZ)
  const cleanDate = (date || '2026-08-05').replace(/-/g, '');
  const cleanTime = (time || '10:00').replace(':', '');
  const startIso = `${cleanDate}T${cleanTime}00`;

  // Calculate 45 minute end time estimate
  const endIso = `${cleanDate}T${parseInt(cleanTime) + 100}00`;

  const title = encodeURIComponent(`Agendamento Barbearia: ${serviceName}`);
  const details = encodeURIComponent(`Agendamento de ${serviceName} com o profissional ${barberName} para ${customerName}.`);
  const location = encodeURIComponent(address || 'Barbearia Exclusiva - Jardins');

  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;

  res.json({
    success: true,
    googleCalendarUrl: gcalUrl,
    message: 'Link do Google Agenda gerado com sucesso.',
  });
});

// WhatsApp Notification Simulation Endpoint
app.post('/api/whatsapp/send', (req, res) => {
  const { phone, message, customerName } = req.body;

  const cleanPhone = (phone || '').replace(/\D/g, '');
  const encodedMsg = encodeURIComponent(message || '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

  res.json({
    success: true,
    sentAt: new Date().toISOString(),
    customerName,
    phone,
    waLink: waUrl,
    status: 'Enviado',
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BarberFlow CRM Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
