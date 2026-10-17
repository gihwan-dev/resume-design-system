// Browser and Node (22.18+) share this dependency-free validator.
// Keep in sync with src/blocks/*/types.ts; registry/default-data tests detect drift.
type Shape = string | readonly Shape[] | { readonly [key: string]: Shape };
export const blockShapes = {
  header: { name: 'string', role: 'string', tagline: 'string', contacts: ['string'] },
  positioning: { text: 'string' },
  sectionHeader: { title: 'string', meta: 'string', variant: 'enum:primary,secondary' },
  coreImpact: { items: ['string'] },
  careerHeader: { company: 'string', role: 'string', period: 'string', summary: 'string' },
  careerProject: { title: 'string', period: 'string', stack: 'string' },
  par: {
    label: 'string',
    problem: 'string',
    action: 'string',
    result: 'string',
    learning: 'string',
  },
  caseStudyHeader: {
    title: 'string',
    period: 'string',
    stack: 'string',
    role: 'string',
    context: 'string',
    links: [{ href: 'string', 'alias?': 'string', 'label?': 'string' }],
  },
  caseStudyOutcome: { built: 'string', outcome: 'string', learning: 'string' },
  skills: { rows: [{ key: 'string', val: 'string' }] },
  learningNote: { label: 'string', text: 'string', variant: 'enum:default,minimal' },
  education: { rows: [{ key: 'string', val: 'string' }] },
  freeText: { text: 'string' },
  blogPosts: { items: [{ href: 'string', title: 'string', 'note?': 'string' }] },
  divider: { variant: 'enum:subtle,strong' },
  spacer: { height: 'nonnegative' },
} as const satisfies Record<string, Shape>;

export const themeNames = ['default', 'mono'] as const;
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function check(value: unknown, shape: Shape, path: string, errors: string[]): void {
  if (typeof shape === 'string') {
    const valid =
      shape === 'string'
        ? typeof value === 'string'
        : shape === 'id'
          ? typeof value === 'string' && value.trim().length > 0
          : shape === 'nonnegative'
            ? typeof value === 'number' && Number.isFinite(value) && value >= 0
            : shape.startsWith('enum:') &&
              typeof value === 'string' &&
              shape.slice(5).split(',').includes(value);
    if (!valid) errors.push(`${path}: expected ${shape}`);
    return;
  }
  if (Array.isArray(shape)) {
    if (!Array.isArray(value)) {
      errors.push(`${path}: expected array`);
      return;
    }
    value.forEach((item, i) => check(item, shape[0]!, `${path}/${i}`, errors));
    return;
  }
  if (!isObject(value)) {
    errors.push(`${path}: expected object`);
    return;
  }
  const fields = shape as Record<string, Shape>;
  const known = new Set(Object.keys(fields).map((key) => key.replace(/\?$/, '')));
  for (const key of Object.keys(value)) {
    if (!known.has(key)) errors.push(`${path}/${key}: unsupported field`);
  }
  for (const [spec, child] of Object.entries(fields)) {
    const key = spec.replace(/\?$/, '');
    if (spec.endsWith('?') && !Object.hasOwn(value, key)) continue;
    check(value[key], child, `${path}/${key}`, errors);
  }
}

export function validateResume(raw: unknown): string[] {
  const errors: string[] = [];
  if (!isObject(raw)) return ['/: expected object'];
  if (raw.v !== 1) errors.push('/v: expected 1');
  // Validate envelopes separately; block data is selected by the actual registry type.
  for (const key of Object.keys(raw))
    if (!['v', 'name', 'theme', 'pages'].includes(key)) errors.push(`/${key}: unsupported field`);
  if (typeof raw.name !== 'string') errors.push('/name: expected string');
  if (!themeNames.includes(raw.theme as (typeof themeNames)[number]))
    errors.push('/theme: unsupported theme');
  if (!Array.isArray(raw.pages)) return [...errors, '/pages: expected array'];
  const ids = new Set<string>();
  const id = (value: unknown, path: string) => {
    check(value, 'id', path, errors);
    if (typeof value === 'string') {
      if (ids.has(value)) errors.push(`${path}: duplicate id`);
      ids.add(value);
    }
  };
  raw.pages.forEach((page, i) => {
    const p = `/pages/${i}`;
    if (!isObject(page)) {
      errors.push(`${p}: expected object`);
      return;
    }
    for (const key of Object.keys(page))
      if (!['id', 'blocks'].includes(key)) errors.push(`${p}/${key}: unsupported field`);
    id(page.id, `${p}/id`);
    if (!Array.isArray(page.blocks)) {
      errors.push(`${p}/blocks: expected array`);
      return;
    }
    page.blocks.forEach((block, j) => {
      const b = `${p}/blocks/${j}`;
      if (!isObject(block)) {
        errors.push(`${b}: expected object`);
        return;
      }
      for (const key of Object.keys(block))
        if (!['id', 'type', 'data'].includes(key)) errors.push(`${b}/${key}: unsupported field`);
      id(block.id, `${b}/id`);
      if (typeof block.type !== 'string' || !Object.hasOwn(blockShapes, block.type)) {
        errors.push(`${b}/type: unsupported block ${String(block.type)}`);
      } else
        check(block.data, blockShapes[block.type as keyof typeof blockShapes], `${b}/data`, errors);
    });
  });
  return errors;
}
