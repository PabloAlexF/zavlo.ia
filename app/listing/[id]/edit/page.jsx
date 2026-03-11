'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
export default function ListingEditPage() {
    const router = useRouter();
    return (<div className="min-h-screen bg-[#0B0B0F] pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-5 h-5"/>
          Voltar
        </button>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Página em Desenvolvimento</h1>
          <p className="text-gray-400">A edição de anúncios será implementada em breve.</p>
        </div>
      </div>
    </div>);
}
