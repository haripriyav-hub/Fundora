// Turns the single-file build into one double-clickable HTML file per entry page.
import { readFileSync, writeFileSync } from 'node:fs'

const html = readFileSync('dist-single/index.html', 'utf8')

const pages = [
  { file: 'Fundora.html', route: '/' },
  { file: 'login.html', route: '/login' },
  { file: 'signup.html', route: '/signup' },
]

for (const { file, route } of pages) {
  writeFileSync(file, html.replace('<body>', `<body data-route="${route}">`))
  console.log(`wrote ${file}`)
}
