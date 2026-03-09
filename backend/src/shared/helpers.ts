export class StringHelper {
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  static extractPrice(text: string): number {
    const cleaned = text.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }

  static cleanCep(cep: string): string {
    return cep.replace(/\D/g, '');
  }

  static formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `+55${cleaned}`;
    }
    return cleaned;
  }
}

export class DateHelper {
  static isRecent(date: Date, hours = 24): boolean {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return diff < hours * 60 * 60 * 1000;
  }

  static formatRelative(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  }
}
