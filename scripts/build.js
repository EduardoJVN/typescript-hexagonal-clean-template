import { build } from 'esbuild';
import { tsconfigPaths } from 'esbuild-plugin-tsconfig-paths';

async function runBuild() {
  try {
    await build({
      entryPoints: ['src/app.ts'],
      bundle: true,
      minify: true,
      platform: 'node',
      format: 'esm',
      sourcemap: true,
      outdir: 'dist',
      target: 'node24',
      // Esto soluciona los problemas de los alias
      plugins: [tsconfigPaths()],
      // Marcamos pino y otras deps como externas para que no se bundleen si no quieres
      packages: 'external',
    });
    console.info('🚀 Build exitoso en /dist');
  } catch (error) {
    console.error('❌ Error durante el build:', error);
    process.exit(1);
  }
}

runBuild();