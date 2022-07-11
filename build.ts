import { promises as fs } from 'fs'
import { renderAsync } from '@resvg/resvg-js'
import fg from 'fast-glob'
import { optimize } from 'svgo'
import pngToIco from 'png-to-ico'

/* PNG RENDERING */
{
  const entries = await fg(['./Branding/**/*.svg'])

  // Find size configs
  const configs = await fg(['./Branding/**/sizes.json'])
  const sizes: Record<string, number[]> = Object.fromEntries(
    await Promise.all(
      configs.map(async (file) => {
        const content = await fs.readFile(file, 'utf8')
        return [file.split('/')[2], JSON.parse(content)]
      })
    )
  )

  // Create a flat list of each svg and size to be rendered
  const operations = entries.flatMap((entry) => {
    const outputs = sizes[entry.split('/')[2]] || []
    return outputs.map((size) => [entry, size])
  }) as [string, number][]

  console.log(`🚀 Starting ${operations.length} render operations`)

  // Render each operation
  await Promise.all(
    operations.map(async ([entry, size]) => {
      const svg = await fs.readFile(entry)
      const resvg = await renderAsync(svg, {
        fitTo: {
          mode: 'width',
          value: size,
        },
      })
      await fs.writeFile(
        entry.replace('.svg', `__${size}x${resvg.height}.png`),
        resvg.asPng()
      )
      console.log(`  ${entry} rendered at ${size}x${resvg.height}`)
    })
  )
}

/* SVG OPTIMIZATION */
{
  const entries = await fg(['./**/*.svg'])

  console.log(`🧰 Starting ${entries.length} SVG optimizations`)

  await Promise.all(
    entries.map(async (entry) => {
      const svg = await fs.readFile(entry)
      const optimized = optimize(svg, {
        multipass: true,
        plugins: [
          'preset-default',
          'convertStyleToAttrs',
          'sortAttrs',
          // Add explicit width to badges
          ...((entry.includes('/Badge')
            ? [
                {
                  name: 'addAttributesToSVGElement',
                  params: {
                    attributes: [
                      {
                        width: '184px',
                      },
                    ],
                  },
                },
              ]
            : []) as any),
        ],
      })

      if (optimized.error) {
        throw new Error(optimized.error)
      } else if ('data' in optimized) {
        await fs.writeFile(entry, optimized.data)
        console.log(`  ${entry} optimized`)
      }
    })
  )
}

/* FAVICON */
{
  console.log('🎨 Starting to generate favicon.ico')

  const favicon = await pngToIco('./Branding/Favicon/favicon__512x512.png')
  await fs.writeFile('./Branding/Favicon/favicon.ico', favicon)
}

console.log('🎉 Finished')
