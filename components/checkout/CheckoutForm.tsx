'use client';

import { motion } from 'framer-motion';
import { User, Mail, Phone, CreditCard, Calendar, Lock, Shield } from 'lucide-react';
import { useState } from 'react';

interface CheckoutFormProps {
  paymentMethod: 'card' | 'pix' | 'boleto';
  onFormChange: (data: any) => void;
}

export function CheckoutForm({ paymentMethod, onFormChange }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cpf: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    // Campos de endereço para boleto
    zipCode: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onFormChange(newData);
  };

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Informações de Contato</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Nome</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <motion.input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                onFocus={() => setFocusedField('firstName')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-11 pr-4 py-3 bg-white/[0.02] border rounded-xl text-white placeholder-gray-600 transition-all focus:outline-none ${
                  focusedField === 'firstName'
                    ? 'border-blue-500 bg-white/[0.04]'
                    : 'border-white/[0.06] hover:border-white/[0.12]'
                }`}
                placeholder="João"
                whileFocus={{ scale: 1.01 }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Sobrenome</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <motion.input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                onFocus={() => setFocusedField('lastName')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-11 pr-4 py-3 bg-white/[0.02] border rounded-xl text-white placeholder-gray-600 transition-all focus:outline-none ${
                  focusedField === 'lastName'
                    ? 'border-blue-500 bg-white/[0.04]'
                    : 'border-white/[0.06] hover:border-white/[0.12]'
                }`}
                placeholder="Silva"
                whileFocus={{ scale: 1.01 }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <motion.input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-11 pr-4 py-3 bg-white/[0.02] border rounded-xl text-white placeholder-gray-600 transition-all focus:outline-none ${
                  focusedField === 'email'
                    ? 'border-blue-500 bg-white/[0.04]'
                    : 'border-white/[0.06] hover:border-white/[0.12]'
                }`}
                placeholder="joao@email.com"
                whileFocus={{ scale: 1.01 }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Telefone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <motion.input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-11 pr-4 py-3 bg-white/[0.02] border rounded-xl text-white placeholder-gray-600 transition-all focus:outline-none ${
                  focusedField === 'phone'
                    ? 'border-blue-500 bg-white/[0.04]'
                    : 'border-white/[0.06] hover:border-white/[0.12]'
                }`}
                placeholder="(11) 99999-9999"
                whileFocus={{ scale: 1.01 }}
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm text-gray-400 mb-2">CPF</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <motion.input
                type="text"
                value={formData.cpf}
                onChange={(e) => handleChange('cpf', formatCPF(e.target.value))}
                onFocus={() => setFocusedField('cpf')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-11 pr-4 py-3 bg-white/[0.02] border rounded-xl text-white placeholder-gray-600 transition-all focus:outline-none ${
                  focusedField === 'cpf'
                    ? 'border-blue-500 bg-white/[0.04]'
                    : 'border-white/[0.06] hover:border-white/[0.12]'
                }`}
                placeholder="000.000.000-00"
                maxLength={14}
                whileFocus={{ scale: 1.01 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details - Only for Card */}
      {paymentMethod === 'card' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Dados do Cartão</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Número do Cartão</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <motion.input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => handleChange('cardNumber', formatCardNumber(e.target.value))}
                  onFocus={() => setFocusedField('cardNumber')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-11 pr-4 py-3 bg-white/[0.02] border rounded-xl text-white placeholder-gray-600 transition-all focus:outline-none font-mono ${
                    focusedField === 'cardNumber'
                      ? 'border-blue-500 bg-white/[0.04]'
                      : 'border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Nome no Cartão</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <motion.input
                  type="text"
                  value={formData.cardName}
                  onChange={(e) => handleChange('cardName', e.target.value.toUpperCase())}
                  onFocus={() => setFocusedField('cardName')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-11 pr-4 py-3 bg-white/[0.02] border rounded-xl text-white placeholder-gray-600 transition-all focus:outline-none uppercase ${
                    focusedField === 'cardName'
                      ? 'border-blue-500 bg-white/[0.04]'
                      : 'border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                  placeholder="JOÃO SILVA"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Validade</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <motion.input
                    type="text"
                    value={formData.expiryDate}
                    onChange={(e) => handleChange('expiryDate', formatExpiryDate(e.target.value))}
                    onFocus={() => setFocusedField('expiryDate')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-11 pr-4 py-3 bg-white/[0.02] border rounded-xl text-white placeholder-gray-600 transition-all focus:outline-none font-mono ${
                      focusedField === 'expiryDate'
                        ? 'border-blue-500 bg-white/[0.04]'
                        : 'border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                    placeholder="MM/AA"
                    maxLength={5}
                    whileFocus={{ scale: 1.01 }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">CVV</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <motion.input
                    type="text"
                    value={formData.cvv}
                    onChange={(e) => handleChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    onFocus={() => setFocusedField('cvv')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-11 pr-4 py-3 bg-white/[0.02] border rounded-xl text-white placeholder-gray-600 transition-all focus:outline-none font-mono ${
                      focusedField === 'cvv'
                        ? 'border-blue-500 bg-white/[0.04]'
                        : 'border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                    placeholder="123"
                    maxLength={4}
                    whileFocus={{ scale: 1.01 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Address Information - Only for Boleto */}
      {paymentMethod === 'boleto' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Endereço de Cobrança</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">CEP</label>
                <motion.input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value.replace(/\D/g, '').slice(0, 8))}
                  onFocus={() => setFocusedField('zipCode')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 bg-white/[0.02] border rounded-xl text-white placeholder-gray-600 transition-all focus:outline-none ${
                    focusedField === 'zipCode'
                      ? 'border-blue-500 bg-white/[0.04]'
                      : 'border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                  placeholder="00000000"
                  maxLength={8}
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Endereço</label>
                <motion.input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  onFocus={() => setFocusedField('address')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 bg-white/[0.02] border rounded-xl text-white placeholder-gray-600 transition-all focus:outline-none ${
                    focusedField === 'address'
                      ? 'border-blue-500 bg-white/[0.04]'
                      : 'border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                  placeholder="Rua Exemplo"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Número</label>
                <motion.input
                  type="text"
                  value={formData.number}
                  onChange={(e) => handleChange('number', e.target.value)}
                  onFocus={() => setFocusedField('number')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 bg-white/[0.02] border rounded-xl text-white placeholder-gray-600 transition-all focus:outline-none ${
                    focusedField === 'number'
                      ? 'border-blue-500 bg-white/[0.04]'
                      : 'border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                  placeholder="123"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Complemento (opcional)</label>
                <motion.input
                  type="text"
                  value={formData.complement}
                  onChange={(e) => handleChange('complement', e.target.value)}
                  onFocus={() => setFocusedField('complement')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 bg-white/[0.02] border rounded-xl text-white placeholder-gray-600 transition-all focus:outline-none ${
                    focusedField === 'complement'
                      ? 'border-blue-500 bg-white/[0.04]'
                      : 'border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                  placeholder="Apto 101"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Bairro</label>
              <motion.input
                type="text"
                value={formData.neighborhood}
                onChange={(e) => handleChange('neighborhood', e.target.value)}
                onFocus={() => setFocusedField('neighborhood')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 bg-white/[0.02] border rounded-xl text-white placeholder-gray-600 transition-all focus:outline-none ${
                  focusedField === 'neighborhood'
                    ? 'border-blue-500 bg-white/[0.04]'
                    : 'border-white/[0.06] hover:border-white/[0.12]'
                }`}
                placeholder="Centro"
                whileFocus={{ scale: 1.01 }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Cidade</label>
                <motion.input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  onFocus={() => setFocusedField('city')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 bg-white/[0.02] border rounded-xl text-white placeholder-gray-600 transition-all focus:outline-none ${
                    focusedField === 'city'
                      ? 'border-blue-500 bg-white/[0.04]'
                      : 'border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                  placeholder="São Paulo"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Estado</label>
                <motion.input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value.toUpperCase().slice(0, 2))}
                  onFocus={() => setFocusedField('state')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 bg-white/[0.02] border rounded-xl text-white placeholder-gray-600 transition-all focus:outline-none uppercase ${
                    focusedField === 'state'
                      ? 'border-blue-500 bg-white/[0.04]'
                      : 'border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                  placeholder="SP"
                  maxLength={2}
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Badge */}
      <motion.div
        className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <div className="text-sm font-medium text-white">Pagamento Seguro</div>
          <div className="text-xs text-gray-500">Seus dados estão protegidos com criptografia SSL</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
