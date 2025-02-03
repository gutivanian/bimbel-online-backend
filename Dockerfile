# Gunakan image Node.js versi 14 dari Docker Hub
FROM node:20

# Set working directory di dalam container ke folder 'futuredu-server'
WORKDIR /usr/src/futuredu-server

# Copy file package.json dan package-lock.json ke container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh file aplikasi ke dalam folder working directory di container
COPY . .

# Expose port 5000 agar bisa diakses dari luar container
EXPOSE 5000

# Jalankan server Express
CMD ["npm", "start"]
