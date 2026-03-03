import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    basicSsl()
  ],
  server: {
    host: true,
    https: {} // ใส่ปีกกาว่างๆ แทนคำว่า true เพื่อหลอกระบบให้ยอมรัน HTTPS
  }
})