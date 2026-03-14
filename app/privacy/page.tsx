'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Eye, Database, Lock, Bell, Trash2, Mail,
  ChevronDown, Search, Camera, CreditCard, MapPin,
  BarChart2, UserCheck,
} from 'lucide-react';
import Link from 'next/link';

const sections = [
  {
    id: 'coleta',
    icon: Database,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    title: 'Dados que Coletamos',
    content: [
      {
        subtitle: 'Dados de Cadastro',
        text: 'Ao criar sua conta coletamos: nome completo, endereço de e-mail, senha (armazenada com hash bcrypt), telefone (opcional), localização (cidade, estado, CEP — opcional) e endereço IP do dispositivo utilizado no cadastro.',
      },
      {
        subtitle: 'Dados de Uso',
        text: 'Registramos suas atividades na plataforma: histórico de buscas por texto e por imagem, produtos favoritados, anúncios criados, alertas de preço configurados, créditos utilizados, contadores de uso diário e mensal, e tempo de resposta das buscas.',
      },
      {
        subtitle: 'Dados de Pagamento',
        text: 'Transações de assinatura e compra de créditos são processadas pelo Mercado Pago. Não armazenamos dados de cartão de crédito. Guardamos apenas o histórico de transações (plano contratado, valor, data e status do pagamento).',
      },
      {
        subtitle: 'Dados de Imagem',
        text: 'Imagens enviadas para busca por foto são processadas pelo Google Vision API para identificação do produto. As imagens são temporariamente hospedadas no Cloudinary e não são utilizadas para nenhuma outra finalidade.',
      },
    ],
  },
  {
    id: 'uso',
    icon: Eye,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    title: 'Como Usamos seus Dados',
    content: [
      {
        subtitle: 'Operação da Plataforma',
        text: 'Seus dados são usados para autenticar seu acesso, controlar os limites de uso do seu plano (buscas diárias e mensais), deduzir créditos a cada busca realizada e personalizar os resultados com base na sua localização.',
      },
      {
        subtitle: 'Busca Inteligente',
        text: 'Utilizamos sua localização (cidade/estado) para priorizar resultados relevantes na sua região. O histórico de buscas alimenta o sistema de analytics para melhorar a qualidade dos resultados ao longo do tempo.',
      },
      {
        subtitle: 'Alertas de Preço',
        text: 'Quando você cria um alerta, monitoramos periodicamente o preço do produto e enviamos notificações quando o preço atingir sua meta. Armazenamos o produto monitorado, o preço alvo e o histórico de variações.',
      },
      {
        subtitle: 'Prevenção de Abuso',
        text: 'O endereço IP coletado no cadastro é armazenado no Redis (com TTL de 1 ano) e no Firestore de forma permanente para impedir a criação de múltiplas contas gratuitas a partir do mesmo dispositivo.',
      },
      {
        subtitle: 'Analytics Internos',
        text: 'Métricas agregadas de uso (taxa de sucesso das buscas, tempo médio de resposta, fontes mais utilizadas) são usadas exclusivamente para melhorar a plataforma. Esses dados são anonimizados e não identificam usuários individualmente.',
      },
    ],
  },
  {
    id: 'armazenamento',
    icon: Lock,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    title: 'Armazenamento e Segurança',
    content: [
      {
        subtitle: 'Infraestrutura',
        text: 'Seus dados são armazenados no Firebase Firestore (Google Cloud), com criptografia em repouso e em trânsito. Dados de sessão e cache são armazenados no Redis (Upstash), com TTL definido para expiração automática.',
      },
      {
        subtitle: 'Senhas',
        text: 'Senhas nunca são armazenadas em texto puro. Utilizamos bcrypt com fator de custo 10 para hash de senhas, tornando-as irreversíveis mesmo em caso de acesso não autorizado ao banco de dados.',
      },
      {
        subtitle: 'Autenticação',
        text: 'O acesso à plataforma é protegido por tokens JWT com expiração de 7 dias (access token) e 30 dias (refresh token). Todas as comunicações entre frontend e backend utilizam HTTPS.',
      },
      {
        subtitle: 'Rate Limiting',
        text: 'Implementamos rate limiting de 10 requisições por minuto por IP para proteger a API contra abusos. Tentativas excessivas resultam em bloqueio temporário automático.',
      },
    ],
  },
  {
    id: 'compartilhamento',
    icon: UserCheck,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    title: 'Compartilhamento de Dados',
    content: [
      {
        subtitle: 'Terceiros Utilizados',
        text: 'Para operar a plataforma, compartilhamos dados com: Google (Vision API para identificação de imagens e Shopping API para busca de preços), Cloudinary (hospedagem temporária de imagens), Mercado Pago (processamento de pagamentos) e Upstash (cache Redis).',
      },
      {
        subtitle: 'O que NÃO fazemos',
        text: 'Não vendemos, alugamos ou compartilhamos seus dados pessoais com anunciantes, corretores de dados ou qualquer terceiro para fins comerciais. Seus dados de busca não são usados para exibir anúncios direcionados.',
      },
      {
        subtitle: 'Obrigações Legais',
        text: 'Podemos divulgar dados pessoais quando exigido por lei, ordem judicial ou autoridade competente, sempre nos limites do estritamente necessário.',
      },
    ],
  },
  {
    id: 'notificacoes',
    icon: Bell,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    title: 'Notificações e Comunicações',
    content: [
      {
        subtitle: 'Notificações da Plataforma',
        text: 'Enviamos notificações sobre: alertas de preço atingidos, atualizações de status de anúncios, confirmações de pagamento e avisos sobre expiração do plano. Essas comunicações são essenciais para o funcionamento do serviço.',
      },
      {
        subtitle: 'Comunicações de Marketing',
        text: 'Não enviamos e-mails de marketing sem consentimento explícito. Caso você opte por receber novidades, pode cancelar a qualquer momento através das configurações do perfil ou pelo link de descadastro presente em cada e-mail.',
      },
    ],
  },
  {
    id: 'direitos',
    icon: Shield,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    title: 'Seus Direitos (LGPD)',
    content: [
      {
        subtitle: 'Acesso e Portabilidade',
        text: 'Você pode solicitar a qualquer momento uma cópia completa dos seus dados pessoais armazenados na plataforma, em formato legível.',
      },
      {
        subtitle: 'Correção',
        text: 'Você pode atualizar seus dados cadastrais (nome, e-mail, telefone, localização) diretamente na página de perfil da plataforma.',
      },
      {
        subtitle: 'Exclusão',
        text: 'Você pode solicitar a exclusão completa da sua conta e de todos os dados associados. Após a solicitação, seus dados serão removidos em até 30 dias, exceto onde a retenção for exigida por lei (ex: registros fiscais de transações).',
      },
      {
        subtitle: 'Oposição ao Tratamento',
        text: 'Você pode se opor ao tratamento de dados para finalidades específicas (como analytics), exceto quando o tratamento for necessário para a prestação do serviço contratado.',
      },
      {
        subtitle: 'Como Exercer seus Direitos',
        text: 'Para exercer qualquer um desses direitos, entre em contato pelo e-mail privacidade@zavlo.ia. Responderemos em até 15 dias úteis.',
      },
    ],
  },
  {
    id: 'exclusao',
    icon: Trash2,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    title: 'Retenção e Exclusão de Dados',
    content: [
      {
        subtitle: 'Período de Retenção',
        text: 'Dados de conta são mantidos enquanto a conta estiver ativa. Logs de busca são mantidos por 90 dias. Histórico de transações é mantido por 5 anos conforme exigência fiscal. Dados de cache no Redis expiram automaticamente conforme TTL configurado.',
      },
      {
        subtitle: 'Exclusão de Conta',
        text: 'Ao excluir sua conta, removemos: perfil, histórico de buscas, favoritos, anúncios, alertas de preço e notificações. O registro de IP no Firestore é mantido por 1 ano para fins de prevenção de abuso, após o qual é excluído automaticamente.',
      },
    ],
  },
];

const highlights = [
  { icon: Search,      label: 'Buscas por texto',  desc: 'Histórico armazenado por 90 dias' },
  { icon: Camera,      label: 'Busca por imagem',  desc: 'Imagens processadas e descartadas' },
  { icon: CreditCard,  label: 'Pagamentos',         desc: 'Processados pelo Mercado Pago' },
  { icon: MapPin,      label: 'Localização',        desc: 'Usada para filtrar resultados' },
  { icon: Bell,        label: 'Alertas de preço',   desc: 'Monitoramento sob demanda' },
  { icon: BarChart2,   label: 'Analytics',          desc: 'Dados anonimizados internamente' },
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

export default function PrivacyPage() {
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
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] text-gray-400 tracking-wide">
              Última atualização: Janeiro de 2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-4 leading-tight">
            Política de Privacidade
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            Transparência total sobre como o{' '}
            <span className="text-gray-300">Zavlo.ia</span> coleta, usa e
            protege seus dados pessoais, em conformidade com a{' '}
            <span className="text-blue-400">LGPD (Lei nº 13.709/2018)</span>.
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
            Esta política se aplica a todos os usuários do{' '}
            <strong className="text-white font-medium">Zavlo.ia</strong> —
            plataforma de busca e comparação de preços em marketplaces
            brasileiros com inteligência artificial. Ao criar uma conta ou
            utilizar nossos serviços, você concorda com os termos descritos
            abaixo.
          </p>
        </motion.div>

        {/* Accordion sections */}
        <div className="space-y-3 mb-14">
          {sections.map((section, i) => (
            <AccordionItem key={section.id} section={section} index={i} />
          ))}
        </div>

        {/* Cookies */}
        <motion.div
          className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 sm:p-6 mb-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
            Cookies e Armazenamento Local
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Utilizamos{' '}
            <code className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded text-xs">
              localStorage
            </code>{' '}
            para manter sua sessão ativa (token JWT e dados básicos do perfil).
            Não utilizamos cookies de rastreamento de terceiros nem pixels de
            publicidade. O armazenamento local pode ser limpo a qualquer momento
            nas configurações do seu navegador.
          </p>
        </motion.div>

        {/* Alterações */}
        <motion.div
          className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 sm:p-6 mb-10"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
            Alterações nesta Política
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Podemos atualizar esta política periodicamente. Alterações
            significativas serão comunicadas por e-mail ou por notificação na
            plataforma com pelo menos 15 dias de antecedência. O uso continuado
            da plataforma após as alterações implica aceitação da nova política.
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
            Dúvidas sobre privacidade?
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Entre em contato com nosso encarregado de dados (DPO) para exercer
            seus direitos ou esclarecer dúvidas.
          </p>
          <a
            href="mailto:privacidade@zavlo.ia"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-sm text-gray-300 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            privacidade@zavlo.ia
          </a>

          <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
            <Link href="/" className="hover:text-gray-400 transition-colors">
              Início
            </Link>
            <span>·</span>
            <Link href="/about" className="hover:text-gray-400 transition-colors">
              Sobre
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
