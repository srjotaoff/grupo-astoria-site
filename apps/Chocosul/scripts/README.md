# Otimizacao de Imagens Chocosul

Este diretório contém utilitários para reduzir o peso das imagens da `apps/Chocosul` sem mexer em ícones.

## Script

- `convert-images-to-webp.mjs`: converte apenas fotos/ilustrações grandes em SVG para WebP.

## Executar

```bash
npm run optimize:chocosul-images
```

## Escopo atual de conversão

- `images/imagens_grandes/imagem_inicio.svg`
- `images/imagens_grandes/mapa.svg`
- `images/fotos/foto_funcionarios.svg`
- `images/foto_sobre_nos/foto_filtro.svg`
- `images/foto_sobre_nos/foto_filtro2.svg`

Obs.: ícones e setas permanecem em SVG por decisão de performance/escala visual.

