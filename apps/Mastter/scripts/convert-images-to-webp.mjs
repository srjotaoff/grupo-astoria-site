import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve('apps/Chocosul')

// Apenas fotos/ilustracoes grandes (sem icones e sem logos)
const targets = [
  'images/imagens_grandes/imagem_inicio.svg',
  'images/imagens_grandes/mapa.svg',
  'images/fotos/foto_funcionarios.svg',
  'images/foto_sobre_nos/foto_filtro.svg',
  'images/foto_sobre_nos/foto_filtro2.svg'
]

async function ensureSourceExists(relativePath) {
  const source = path.join(ROOT, relativePath)
  await fs.access(source)
  return source
}

async function convertSvgToWebp(relativePath) {
  const source = await ensureSourceExists(relativePath)
  const output = source.replace(/\.svg$/i, '.webp')

  await sharp(source, { density: 192 })
	.webp({ quality: 80, effort: 6 })
	.toFile(output)

  const [svgStat, webpStat] = await Promise.all([fs.stat(source), fs.stat(output)])

  return {
	source,
	output,
	svgBytes: svgStat.size,
	webpBytes: webpStat.size
  }
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`
}

async function main() {
  const results = []

  for (const target of targets) {
	try {
	  const converted = await convertSvgToWebp(target)
	  results.push(converted)
	} catch (error) {
	  console.error(`[erro] Falha ao converter ${target}:`, error.message)
	  process.exitCode = 1
	}
  }

  if (!results.length) {
	console.log('Nenhuma imagem convertida.')
	return
  }

  let totalSvg = 0
  let totalWebp = 0

  console.log('\nConversao concluida:\n')
  for (const item of results) {
	totalSvg += item.svgBytes
	totalWebp += item.webpBytes
	const gain = item.svgBytes - item.webpBytes
	const gainPct = item.svgBytes ? ((gain / item.svgBytes) * 100).toFixed(1) : '0.0'

	console.log(`- ${path.relative(process.cwd(), item.source)}`)
	console.log(`  -> ${path.relative(process.cwd(), item.output)}`)
	console.log(`  ${formatKb(item.svgBytes)} -> ${formatKb(item.webpBytes)} (${gainPct}% menor)\n`)
  }

  const totalGain = totalSvg - totalWebp
  const totalGainPct = totalSvg ? ((totalGain / totalSvg) * 100).toFixed(1) : '0.0'

  console.log('Resumo geral:')
  console.log(`- Total SVG:  ${formatKb(totalSvg)}`)
  console.log(`- Total WebP: ${formatKb(totalWebp)}`)
  console.log(`- Economia:   ${formatKb(totalGain)} (${totalGainPct}% menor)`)
}

main().catch((error) => {
  console.error('Erro inesperado na conversao:', error)
  process.exit(1)
})

