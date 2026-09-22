import {build} from 'esbuild';import {spawnSync} from 'node:child_process';
await build({entryPoints:['tests/core.test.ts'],outfile:'.test-output/tests.mjs',bundle:true,platform:'node',format:'esm',packages:'external'});
const result=spawnSync(process.execPath,['--test','.test-output/tests.mjs'],{stdio:'inherit'});process.exit(result.status??1);
