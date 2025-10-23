export function normalizeTechs(exp = {}) {
  if (Array.isArray(exp.technologies) && exp.technologies.length) {
    return exp.technologies.map((t) =>
      typeof t === 'string' ? { name: t, type: 'Peripheral' } : t,
    );
  }

  const cores = Array.isArray(exp.coreTechnologies) ? exp.coreTechnologies : [];
  const peris = Array.isArray(exp.peripheralTechnologies)
    ? exp.peripheralTechnologies
    : [];

  const merged = [
    ...cores.map((name) => ({ name, type: 'Core' })),
    ...peris.map((name) => ({ name, type: 'Peripheral' })),
  ];
  return merged;
}
