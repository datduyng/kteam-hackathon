import { omit } from './omit';
import { z } from 'zod';
import zodToJsonSchemaImpl from 'zod-to-json-schema';

export function zodToJsonSchema(schema: z.ZodType): any {
  return omit(
    zodToJsonSchemaImpl(schema, { $refStrategy: 'none' }),
    '$ref' as any,
    '$schema',
    'default',
    'definitions',
    'description',
    'markdownDescription',
  );
}