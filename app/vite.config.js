import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { spawn } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Dev-only plugin: exposes /api/generate-docx that calls python-docx
function pythonDocxPlugin() {
  const script = resolve(__dirname, 'scripts/generate_letter.py')

  return {
    name: 'python-docx-api',
    configureServer(server) {
      server.middlewares.use('/api/generate-docx', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end('POST only')
        }

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const { data, lang } = JSON.parse(body)
            const child = spawn('uv', ['run', 'python', script, lang || 'fr'])
            const chunks = []

            child.stdin.write(JSON.stringify(data))
            child.stdin.end()

            child.stdout.on('data', chunk => chunks.push(chunk))
            child.stderr.on('data', chunk => console.error('[python-docx]', chunk.toString()))

            child.on('close', code => {
              if (code !== 0) {
                res.statusCode = 500
                return res.end('Python script failed')
              }
              const buf = Buffer.concat(chunks)
              res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
              res.end(buf)
            })
          } catch (e) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: e.message }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), pythonDocxPlugin()],
  base: '/',
})
