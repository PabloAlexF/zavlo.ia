# 🚀 Deploy Hostinger VPS - Zavlo.ia

## ⚠️ IMPORTANTE
Este guia é para **Hostinger VPS**, NÃO para hospedagem compartilhada.

---

## 📦 Passo 1: Preparar Arquivos Localmente

```bash
# Backend
cd backend
npm run build
# Gera pasta dist/

# Frontend  
cd frontend
npm run build
# Gera pasta .next/
```

---

## 🔐 Passo 2: Conectar ao VPS

```bash
ssh root@seu-ip-vps
# Senha fornecida pela Hostinger
```

---

## ⚡ Passo 3: Instalar Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
npm install -g pm2
```

---

## 📤 Passo 4: Enviar Arquivos

**No seu PC (PowerShell):**

```powershell
# Compactar projeto
Compress-Archive -Path "C:\Users\Administrator\Desktop\zavlo.ia\*" -DestinationPath "C:\Users\Administrator\Desktop\zavlo.zip"

# Enviar via SCP
scp C:\Users\Administrator\Desktop\zavlo.zip root@seu-ip-vps:/root/
```

---

## 📂 Passo 5: Extrair no VPS

```bash
# No VPS
cd /root
apt install -y unzip
unzip zavlo.zip -d /var/www/zavlo
cd /var/www/zavlo
```

---

## 🔧 Passo 6: Configurar Backend

```bash
cd backend

# Criar .env
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
FIREBASE_API_KEY=sua-key
JWT_SECRET=seu-secret
MERCADOPAGO_ACCESS_TOKEN=seu-token
EOF

# Instalar e iniciar
npm install --production
pm2 start dist/main.js --name backend
```

---

## 🎨 Passo 7: Configurar Frontend

```bash
cd ../frontend

# Criar .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://seu-ip:3001/api/v1
NEXT_PUBLIC_FIREBASE_API_KEY=sua-key
EOF

# Instalar e iniciar
npm install --production
pm2 start npm --name frontend -- start
pm2 save
```

---

## 🌐 Passo 8: Nginx (Opcional)

```bash
apt install -y nginx

cat > /etc/nginx/sites-available/zavlo << 'EOF'
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
    }
}
EOF

ln -s /etc/nginx/sites-available/zavlo /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

---

## ✅ Verificar

```bash
pm2 status
pm2 logs
```

**Acesse:** `http://seu-ip-vps`

---

## 🔄 Atualizar Depois

```bash
# Enviar novo ZIP
# No VPS:
cd /var/www/zavlo
rm -rf backend frontend
unzip /root/zavlo-novo.zip
cd backend && npm install && pm2 restart backend
cd ../frontend && npm install && pm2 restart frontend
```

---

## 💡 Recomendação

**Use Vercel (grátis e mais fácil):**
- Frontend: Vercel
- Backend: Render.com
- Sem configuração de servidor
- SSL automático
- Deploy em 5 minutos
