import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        courses: resolve(__dirname, 'courses.html'),
        contact: resolve(__dirname, 'contact.html'),
        enquiry: resolve(__dirname, 'enquiry.html'),
        studyMaterial: resolve(__dirname, 'study-material.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
        chatbot: resolve(__dirname, 'chatbot.html'),
        admin: resolve(__dirname, 'admin.html'),
        adminCourse: resolve(__dirname, 'admin-course.html'),
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
