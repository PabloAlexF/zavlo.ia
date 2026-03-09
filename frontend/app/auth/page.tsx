'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Eye, EyeOff, Mail, Lock, User, MapPin, Sparkles, CheckCircle } from 'lucide-react';

export default function Auth() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [cep, setCep] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleCepChange = async (value: string) => {
    const cleanCep = value.replace(/\D/g, '');
    const formatted = cleanCep.replace(/(\d{5})(\d)/, '$1-$2');
    setCep(formatted);

    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setCity(data.localidade);
          setState(data.uf);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin 
        ? { email, password }
        : { email, password, name, location: { cep, city, state } };

      const response = await fetch(`http://localhost:3001/api/v1${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message === 'Credenciais inválidas' 
          ? 'Email ou senha incorretos. Verifique seus dados e tente novamente.' 
          : typeof data.message === 'string' 
            ? data.message 
            : 'Erro ao autenticar';
        setMessage({ type: 'error', text: errorMsg });
        return;
      }

      const userData = {
        ...data.data,
        token: data.data.accessToken
      };
      localStorage.setItem('zavlo_user', JSON.stringify(userData));
      window.dispatchEvent(new Event('userChanged'));
      
      const successMsg = typeof data.message === 'string' ? data.message : 'Login realizado com sucesso!';
      setMessage({ type: 'success', text: successMsg });
      
      setTimeout(() => {
        router.push('/plans');
      }, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Header />
      
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md mx-auto pt-32 pb-12 px-4">
        <Link href="/" className="flex items-center justify-center mb-8 group">
          <Sparkles className="w-6 h-6 text-blue-400 mr-2 group-hover:rotate-12 transition-transform" />
          <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Zavlo.ia</span>
        </Link>

        <div className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {isLogin ? 'Bem-vindo de volta!' : 'Criar sua conta'}
            </h1>
            <p className="text-gray-400">
              {isLogin ? 'Entre para continuar economizando' : 'Comece a economizar hoje mesmo'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
                message.type === 'success' 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <span>⚠️</span>}
                {message.text}
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-blue-500 focus:bg-white/10 outline-none transition text-white placeholder-gray-500"
                    placeholder="Seu nome"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">CEP</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    maxLength={9}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-blue-500 focus:bg-white/10 outline-none transition text-white placeholder-gray-500"
                    placeholder="00000-000"
                    required={!isLogin}
                  />
                </div>
                {city && state && (
                  <p className="text-xs text-green-400 mt-2 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {city} - {state}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-blue-500 focus:bg-white/10 outline-none transition text-white placeholder-gray-500"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-blue-500 focus:bg-white/10 outline-none transition text-white placeholder-gray-500"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!isLogin && <p className="text-xs text-gray-500 mt-2">Mínimo 6 caracteres</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Carregando...
                </span>
              ) : (
                isLogin ? 'Entrar' : 'Criar conta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
              <span className="font-semibold text-blue-400 hover:text-blue-300">
                {isLogin ? 'Cadastre-se' : 'Faça login'}
              </span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Ao continuar, você concorda com nossos{' '}
          <Link href="/terms" className="underline hover:text-gray-400">
            Termos de Uso
          </Link>
        </p>
      </div>
    </div>
  );
}
