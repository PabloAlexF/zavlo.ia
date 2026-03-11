# 🚀 Deploy na Hostinger - Zavlo.ia

## 📋 Pré-requisitos

- Plano VPS na Hostinger (mínimo 2GB RAM)
- Domínio configurado
- Acesso SSH ao servidor

---

## 🎯 Passo 1: Conectar ao VPS via SSH

```bash
ssh root@seu-ip-do-vps
```

---

## 🎯 Passo 2: Instalar Node.js e PM2

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Instalar PM2 (gerenciador de processos)
npm install -g pm2

# Verificar instalação
node -v
npm -v
pm2 -v
```

---

## 🎯 Passo 3: Instalar Nginx

```bash
# Instalar Nginx
apt install -y nginx

# Iniciar Nginx
systemctl start nginx
systemctl enable nginx
```

---

## 🎯 Passo 4: Clonar o Projeto

```bash
# Criar diretório
mkdir -p /var/www
cd /var/www

# Clonar repositório
git clone https://github.com/seu-usuario/zavlo.ia.git
cd zavlo.ia
```

---

## 🎯 Passo 5: Configurar Backend

```bash
cd /var/www/zavlo.ia/backend

# Instalar dependências
npm install

# Criar arquivo .env
nano .env
```

**Cole as variáveis:**
```env
NODE_ENV=production
PORT=3001
API_PREFIX=api/v1
CORS_ORIGIN=https://seudominio.com

# Firebase
FIREBASE_API_KEY=sua-api-key
FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
FIREBASE_APP_ID=seu-app-id

# JWT
JWT_SECRET=gere-uma-chave-segura-aqui
JWT_EXPIRATION=7d

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu-access-token
```

**Salvar:** `CTRL+X` > `Y` > `ENTER`

```bash
# Build do backend
npm run build

# Iniciar com PM2
pm2 start dist/main.js --name zavlo-backend
pm2 save
pm2 startup
```

---

## 🎯 Passo 6: Configurar Frontend

```bash
cd /var/www/zavlo.ia/frontend

# Criar arquivo .env.local
nano .env.local
```

**Cole as variáveis:**
```env
NEXT_PUBLIC_API_URL=https://seudominio.com/api/v1

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=sua-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=seu-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=seu-measurement-id

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=seu-preset

# Mercado Pago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=sua-public-key
```

**Salvar:** `CTRL+X` > `Y` > `ENTER`

```bash
# Instalar dependências
npm install

# Build do frontend
npm run build

# Iniciar com PM2
pm2 start npm --name zavlo-frontend -- start
pm2 save
```

---

## 🎯 Passo 7: Configurar Nginx

```bash
# Criar configuração do site
nano /etc/nginx/sites-available/zavlo
```

**Cole a configuração:**
```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Aumentar tamanho máximo de upload (para imagens)
    client_max_body_size 10M;
}
```

**Salvar:** `CTRL+X` > `Y` > `ENTER`

```bash
# Ativar site
ln -s /etc/nginx/sites-available/zavlo /etc/nginx/sites-enabled/

# Remover site padrão
rm /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

---

## 🎯 Passo 8: Instalar SSL (HTTPS)

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
certbot --nginx -d seudominio.com -d www.seudominio.com

# Renovação automática
certbot renew --dry-run
```

---

## 🎯 Passo 9: Configurar Firewall

```bash
# Permitir portas necessárias
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

---

## 🎯 Passo 10: Verificar Status

```bash
# Ver processos PM2
pm2 status

# Ver logs
pm2 logs zavlo-backend
pm2 logs zavlo-frontend

# Reiniciar aplicações
pm2 restart all
```

---

## 🔄 Atualizar Aplicação

```bash
cd /var/www/zavlo.ia

# Puxar atualizações
git pull

# Backend
cd backend
npm install
npm run build
pm2 restart zavlo-backend

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart zavlo-frontend
```

---

## 📊 Monitoramento

```bash
# Ver uso de recursos
pm2 monit

# Ver logs em tempo real
pm2 logs

# Ver status detalhado
pm2 show zavlo-backend
pm2 show zavlo-frontend
```

---

## 🆘 Troubleshooting

### Aplicação não inicia
```bash
pm2 logs zavlo-backend --lines 100
pm2 logs zavlo-frontend --lines 100
```

### Erro de porta em uso
```bash
# Ver processos na porta 3000/3001
lsof -i :3000
lsof -i :3001

# Matar processo
kill -9 PID
```

### Nginx não funciona
```bash
# Ver logs do Nginx
tail -f /var/log/nginx/error.log

# Testar configuração
nginx -t

# Reiniciar
systemctl restart nginx
```

### Sem memória
```bash
# Ver uso de memória
free -h

# Adicionar swap
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## ✅ Checklist Final

- [ ] Node.js instalado
- [ ] PM2 instalado
- [ ] Nginx instalado
- [ ] Projeto clonado
- [ ] Backend configurado e rodando
- [ ] Frontend configurado e rodando
- [ ] Nginx configurado
- [ ] SSL instalado
- [ ] Firewall configurado
- [ ] Domínio apontando para o IP
- [ ] Aplicação acessível via HTTPS

---

## 📞 Comandos Úteis

```bash
# Reiniciar tudo
pm2 restart all

# Parar tudo
pm2 stop all

# Ver logs
pm2 logs

# Monitorar recursos
pm2 monit

# Reiniciar Nginx
systemctl restart nginx

# Ver status do servidor
htop
```

---

🎉 **Seu projeto está no ar na Hostinger!**

Acesse: https://seudominio.com
