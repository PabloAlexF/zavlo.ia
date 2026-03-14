'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, UserCheck, CreditCard, AlertTriangle, Ban,
  Shield, Scale, ChevronDown, Search, Camera, Store,
  Bell, Zap, Mail, DollarSign,
} from 'lucide-react';
import Link from 'next/link';

const sections = [
  {
    id: 'aceitacao',
    icon: FileText,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    title: 'Aceitação dos Termos',
    content: [
      {
        subtitle: 'Concordância',
        text: 'Ao criar uma conta, acessar ou utilizar qualquer funcionalidade do Zavlo.ia, você concorda integralmente com estes Termos de Serviço e com nossa Política de Privacidade. Se você não concorda com algum termo, não utilize a plataforma.',
      },
      {
        subtitle: 'Capacidade Legal',
        text: 'Você declara ter pelo menos 18 anos de idade ou, se menor, possuir autorização expressa dos pais ou responsáveis legais para utilizar a plataforma. Menores de 13 anos não podem criar contas.',
      },
      {
        subtitle: 'Alterações nos Termos',
        text: 'Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão comunicadas por e-mail ou notificação na plataforma com 15 dias de antecedência. O uso continuado após as alterações implica aceitação.',
      },
    ],
  },
  {
    id: 'servico',
    icon: Search,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    title: 'Descrição do Serviço',
    content: [
      {
        subtitle: 'O que é o Zavlo.ia',
        text: 'O Zavlo.ia é uma plataforma de busca e comparação de preços que utiliza inteligência artificial para agregar resultados de múltiplos marketplaces brasileiros (OLX, Mercado Livre, Shopee, Amazon, entre outros). Oferecemos busca por texto, busca por imagem, alertas de preço e marketplace próprio para anúncios.',
      },
      {
        subtitle: 'Disponibilidade',
        text: 'Nos esforçamos para manter a plataforma disponível 24/7, mas não garantimos disponibilidade ininterrupta. Manutenções programadas serão comunicadas com antecedência. Não nos responsabilizamos por indisponibilidades causadas por terceiros (APIs externas, provedores de infraestrutura).',
      },
      {
        subtitle: 'Limitações Técnicas',
        text: 'Os resultados de busca dependem da disponibilidade e precisão das APIs de terceiros (Google Shopping, marketplaces). Não garantimos que todos os produtos disponíveis no mercado serão encontrados. Preços e disponibilidade são atualizados periodicamente, mas podem estar desatualizados no momento da consulta.',
      },
    ],
  },
  {
    id: 'conta',
    icon: UserCheck,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    title: 'Conta de Usuário',
    content: [
      {
        subtitle: 'Criação de Conta',
        text: 'Para utilizar funcionalidades completas, você deve criar uma conta fornecendo informações verdadeiras, precisas e atualizadas. Você é responsável por manter a confidencialidade da sua senha e por todas as atividades realizadas em sua conta.',
      },
      {
        subtitle: 'Uma Conta por Dispositivo',
        text: 'Cada dispositivo (identificado por endereço IP) pode criar apenas uma conta gratuita. Tentativas de criar múltiplas contas para obter créditos gratuitos adicionais resultarão em bloqueio permanente de todas as contas associadas ao IP.',
      },
      {
        subtitle: 'Suspensão e Encerramento',
        text: 'Reservamo-nos o direito de suspender ou encerrar sua conta imediatamente, sem aviso prévio, em caso de violação destes termos, atividade fraudulenta, abuso da plataforma ou uso de bots/automação não autorizada.',
      },
      {
        subtitle: 'Exclusão de Conta',
        text: 'Você pode solicitar a exclusão da sua conta a qualquer momento através das configurações de perfil ou por e-mail. Seus dados serão removidos conforme nossa Política de Privacidade, exceto onde a retenção for exigida por lei.',
      },
    ],
  },
  {
    id: 'planos',
    icon: CreditCard,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    title: 'Planos e Pagamentos',
    content: [
      {
        subtitle: 'Planos Disponíveis',
        text: 'Oferecemos plano Gratuito (1 busca por texto/dia), Básico (15 buscas/mês), Pro (48 buscas/mês) e Business (200 buscas/mês). Cada plano possui limites específicos de buscas diárias e mensais. Buscas por imagem consomem créditos adicionais.',
      },
      {
        subtitle: 'Cobrança e Renovação',
        text: 'Planos pagos são cobrados mensalmente ou anualmente via Mercado Pago. A renovação é automática, exceto se você cancelar antes do fim do período. Cancelamentos não geram reembolso proporcional do período já pago.',
      },
      {
        subtitle: 'Créditos Avulsos',
        text: 'Você pode comprar pacotes de créditos avulsos (10, 25 ou 60 comparações) com validade de 90 dias. Créditos não utilizados expiram automaticamente após esse período e não são reembolsáveis.',
      },
      {
        subtitle: 'Alteração de Preços',
        text: 'Podemos alterar os preços dos planos a qualquer momento. Usuários ativos serão notificados com 30 dias de antecedência. A alteração só se aplica a partir da próxima renovação.',
      },
      {
        subtitle: 'Reembolsos',
        text: 'Não oferecemos reembolsos para planos ou créditos já pagos, exceto em casos de falha técnica comprovada da plataforma que impeça o uso do serviço por mais de 7 dias consecutivos.',
      },
    ],
  },
  {
    id: 'uso',
    icon: Zap,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    title: 'Uso Aceitável',
    content: [
      {
        subtitle: 'Proibições',
        text: 'É estritamente proibido: usar bots, scrapers ou automação para realizar buscas em massa; criar múltiplas contas para burlar limites de uso; revender ou redistribuir resultados da plataforma; utilizar a plataforma para atividades ilegais ou fraudulentas; tentar acessar áreas restritas ou explorar vulnerabilidades de segurança.',
      },
      {
        subtitle: 'Uso Comercial',
        text: 'O uso comercial da plataforma (revenda de dados, integração em outros sistemas) requer contratação do plano Business e autorização expressa. Entre em contato com vendas@zavlo.ia para licenciamento comercial.',
      },
      {
        subtitle: 'Propriedade Intelectual',
        text: 'Todo o conteúdo da plataforma (código, design, marca, algoritmos) é de propriedade exclusiva do Zavlo.ia e protegido por leis de propriedade intelectual. Você não pode copiar, modificar, distribuir ou criar obras derivadas sem autorização.',
      },
    ],
  },
  {
    id: 'marketplace',
    icon: Store,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    title: 'Marketplace e Anúncios',
    content: [
      {
        subtitle: 'Publicação de Anúncios',
        text: 'Usuários podem publicar anúncios de produtos para venda no marketplace do Zavlo.ia. Você é inteiramente responsável pela veracidade das informações, qualidade do produto, cumprimento de prazos de entrega e atendimento ao comprador.',
      },
      {
        subtitle: 'Conteúdo Proibido',
        text: 'É proibido anunciar: produtos ilegais, falsificados ou pirateados; armas, drogas ou substâncias controladas; conteúdo adulto ou ofensivo; produtos sem autorização de revenda; serviços financeiros não regulamentados.',
      },
      {
        subtitle: 'Moderação',
        text: 'Reservamo-nos o direito de remover anúncios que violem estes termos, sem aviso prévio. Anúncios removidos não geram direito a reembolso de taxas pagas.',
      },
      {
        subtitle: 'Transações',
        text: 'O Zavlo.ia atua apenas como intermediário. Não somos parte das transações entre compradores e vendedores. Não nos responsabilizamos por disputas, produtos defeituosos, fraudes ou inadimplência de qualquer das partes.',
      },
    ],
  },
  {
    id: 'alertas',
    icon: Bell,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    title: 'Alertas de Preço',
    content: [
      {
        subtitle: 'Funcionamento',
        text: 'Você pode criar alertas para monitorar preços de produtos específicos. Enviaremos notificações quando o preço atingir sua meta. O monitoramento é feito periodicamente (a cada 6-12 horas) e não em tempo real.',
      },
      {
        subtitle: 'Limitações',
        text: 'Não garantimos que todos os produtos terão histórico de preços disponível. Alertas dependem da disponibilidade das APIs de terceiros. Podemos limitar a quantidade de alertas ativos por usuário conforme o plano contratado.',
      },
      {
        subtitle: 'Precisão',
        text: 'Fazemos o possível para manter os preços atualizados, mas não garantimos 100% de precisão. Sempre confirme o preço no site do vendedor antes de finalizar a compra.',
      },
    ],
  },
  {
    id: 'responsabilidade',
    icon: AlertTriangle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    title: 'Limitação de Responsabilidade',
    content: [
      {
        subtitle: 'Isenção de Garantias',
        text: 'A plataforma é fornecida "como está" e "conforme disponível", sem garantias de qualquer tipo, expressas ou implícitas. Não garantimos que o serviço será ininterrupto, livre de erros ou que atenderá suas expectativas específicas.',
      },
      {
        subtitle: 'Dados de Terceiros',
        text: 'Os resultados de busca são agregados de APIs de terceiros (Google Shopping, marketplaces). Não nos responsabilizamos pela precisão, disponibilidade ou legalidade dos dados fornecidos por terceiros.',
      },
      {
        subtitle: 'Danos Indiretos',
        text: 'Em nenhuma hipótese seremos responsáveis por danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo perda de lucros, dados, uso ou outras perdas intangíveis resultantes do uso ou incapacidade de usar a plataforma.',
      },
      {
        subtitle: 'Limite de Indenização',
        text: 'Nossa responsabilidade total por qualquer reclamação relacionada à plataforma está limitada ao valor pago por você nos últimos 12 meses, ou R$ 100,00, o que for menor.',
      },
    ],
  },
  {
    id: 'juridico',
    icon: Scale,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    title: 'Disposições Legais',
    content: [
      {
        subtitle: 'Lei Aplicável',
        text: 'Estes termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida no foro da comarca de São Paulo/SP, com exclusão de qualquer outro, por mais privilegiado que seja.',
      },
      {
        subtitle: 'Resolução de Disputas',
        text: 'Em caso de conflito, as partes se comprometem a buscar solução amigável antes de recorrer ao judiciário. Você pode entrar em contato com suporte@zavlo.ia para mediação.',
      },
      {
        subtitle: 'Independência das Cláusulas',
        text: 'Se qualquer disposição destes termos for considerada inválida ou inexequível, as demais disposições permanecerão em pleno vigor e efeito.',
      },
      {
        subtitle: 'Cessão',
        text: 'Você não pode transferir ou ceder seus direitos ou obrigações sob estes termos sem nosso consentimento prévio por escrito. Podemos ceder nossos direitos a qualquer momento.',
      },
    ],
  },
];

const highlights = [
  { icon: Search, label: 'Busca por texto', desc: 'Limites por plano' },
  { icon: Camera, label: 'Busca por imagem', desc: 'Consome créditos extras' },
  { icon: Store, label: 'Marketplace', desc: 'Anúncios moderados' },
  { icon: Bell, label: 'Alertas de preço', desc: 'Monitoramento periódico' },
  { icon: DollarSign, label: 'Pagamentos', desc: 'Via Mercado Pago' },
  { icon: Ban, label: 'Proibições', desc: 'Bots e múltiplas contas' },
];

function AccordionItem({
  section,
  index,
}: {
  section: (typeof sections)[0];
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl border ${section.border} bg-white/[0.02] overflow-hidden`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${section.bg} border ${section.border} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${section.color}`} />
          </div>
          <span className="font-medium text-white text-sm sm:text-base">
            {section.title}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-5 border-t border-white/[0.06] pt-5">
          {section.content.map((item, i) => (
            <div key={i}>
              <p
                className={`text-[10px] font-semibold uppercase tracking-widest ${section.color} mb-1.5`}
              >
                {item.subtitle}
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-[#050409] text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="relative z-10 max-w-3xl mx-auto px-4 pt-24 pb-20 sm:pt-32 sm:pb-28">

        {/* Header */}
        <motion.div
          className="text-center mb-14 sm:mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 rounded-full mb-6">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] text-gray-400 tracking-wide">
              Última atualização: Janeiro de 2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-4 leading-tight">
            Termos de Serviço
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            Regras claras e transparentes sobre o uso da plataforma{' '}
            <span className="text-gray-300">Zavlo.ia</span>. Leia atentamente
            antes de utilizar nossos serviços.
          </p>
        </motion.div>

        {/* Highlights grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {highlights.map((h) => (
            <div
              key={h.label}
              className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5 sm:p-4 hover:bg-white/[0.04] transition-colors"
            >
              <h.icon className="w-4 h-4 text-blue-400 mb-2" />
              <p className="text-xs font-medium text-white mb-0.5">{h.label}</p>
              <p className="text-[11px] text-gray-600">{h.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Intro box */}
        <motion.div
          className="bg-blue-500/[0.05] border border-blue-500/[0.15] rounded-2xl p-5 sm:p-6 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm text-gray-400 leading-relaxed">
            Estes Termos de Serviço regulam o uso da plataforma{' '}
            <strong className="text-white font-medium">Zavlo.ia</strong> e
            estabelecem os direitos e obrigações entre você (usuário) e nós
            (operadores da plataforma). Ao utilizar nossos serviços, você
            concorda com todos os termos descritos abaixo.
          </p>
        </motion.div>

        {/* Accordion sections */}
        <div className="space-y-3 mb-14">
          {sections.map((section, i) => (
            <AccordionItem key={section.id} section={section} index={i} />
          ))}
        </div>

        {/* Important notice */}
        <motion.div
          className="bg-red-500/[0.05] border border-red-500/[0.15] rounded-2xl p-5 sm:p-6 mb-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold text-white mb-2">
                Importante: Violações Graves
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Uso de bots, criação de múltiplas contas, fraude ou qualquer
                tentativa de burlar os limites da plataforma resultará em{' '}
                <strong className="text-red-400">
                  banimento permanente sem reembolso
                </strong>
                . Todas as atividades são monitoradas e registradas.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Effective date */}
        <motion.div
          className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 sm:p-6 mb-10"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            Vigência e Aceitação
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Estes termos entram em vigor imediatamente após a criação da sua
            conta ou primeiro acesso à plataforma. Ao continuar usando o
            Zavlo.ia, você confirma que leu, compreendeu e concorda com todos os
            termos aqui estabelecidos.
          </p>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          className="text-center p-8 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Mail className="w-8 h-8 text-gray-500 mx-auto mb-4" />
          <h2 className="text-base font-medium text-white mb-2">
            Dúvidas sobre os termos?
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Entre em contato com nossa equipe jurídica para esclarecimentos ou
            questões contratuais.
          </p>
          <a
            href="mailto:juridico@zavlo.ia"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-sm text-gray-300 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            juridico@zavlo.ia
          </a>

          <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
            <Link href="/" className="hover:text-gray-400 transition-colors">
              Início
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">
              Privacidade
            </Link>
            <span>·</span>
            <Link href="/plans" className="hover:text-gray-400 transition-colors">
              Planos
            </Link>
            <span>·</span>
            <Link href="/auth" className="hover:text-gray-400 transition-colors">
              Criar conta
            </Link>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
