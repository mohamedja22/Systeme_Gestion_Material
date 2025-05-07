# Dockerfile pour React
FROM node:18

# Dossier de travail
WORKDIR /app

# Copier package.json et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste de l'app
COPY . .

# Lancer l'app React en mode dev
CMD ["npm", "start"]
