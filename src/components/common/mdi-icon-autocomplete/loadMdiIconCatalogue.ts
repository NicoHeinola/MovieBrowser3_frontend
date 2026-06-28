let mdiIconCataloguePromise: Promise<string[]> | null = null;

const normalizeIconName = (iconName: string): string => {
  if (iconName.startsWith('mdi-')) {
    return iconName;
  }

  return `mdi-${iconName}`;
};

const loadMdiIconCatalogueFromFile = async (): Promise<string[]> => {
  const module = await import('./mdiIconNames.json');

  return module.default.map((iconName) => normalizeIconName(iconName));
};

export const loadMdiIconCatalogue = async (): Promise<string[]> => {
  if (!mdiIconCataloguePromise) {
    mdiIconCataloguePromise = loadMdiIconCatalogueFromFile();
  }

  return await mdiIconCataloguePromise;
};
