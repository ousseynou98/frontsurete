# 1. ÉTAPE DE BUILD (Builder Stage)
FROM node:20-alpine AS builder
WORKDIR /app

# Copie package.json et le fichier de verrouillage npm
COPY package.json package-lock.json ./

# Exécute l'installation stricte des dépendances avec npm
RUN npm ci
RUN npm install @wandersonalwes/iconsax-react@0.0.10
RUN npm install iconsax-react

# Copie le reste du code source
COPY . .

# Lance la construction de l'application Next.js
RUN npm run build

# 2. ÉTAPE D'EXÉCUTION (Runner Stage)
FROM node:20-alpine AS runner
WORKDIR /app

# Variables d'environnement
ENV NODE_ENV production
ENV PORT 3000

# Copie les fichiers nécessaires de l'étape de build
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# Copie les fichiers nécessaires à l'exécution pour les dépendances
COPY package.json package-lock.json ./

# Installe les dépendances de production uniquement (sans devDependencies)
RUN npm ci --only=production

EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
