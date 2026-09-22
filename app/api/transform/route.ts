import { generate } from '@/lib/server/generate';
export const POST = (r: Request) => generate(r, true);
