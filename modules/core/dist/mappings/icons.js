/**
 * Icon library mappings from React to Svelte/Vue equivalents
 */
export const iconMappings = [
    {
        source: 'lucide-react',
        svelte: 'lucide-svelte',
        vue: 'lucide-vue-next',
    },
    {
        source: '@heroicons/react',
        svelte: '@steeze-ui/heroicons', // Note: Different API, may need additional transforms
        vue: '@heroicons/vue',
    },
    {
        source: 'react-icons',
        svelte: 'svelte-icons', // Note: Different package structure
        vue: 'vue3-icons', // Note: Different package structure
    },
];
/**
 * Get the icon mapping for a specific source package
 */
export function getIconMapping(sourcePackage) {
    return iconMappings.find((m) => m.source === sourcePackage);
}
/**
 * Get the Svelte equivalent icon package
 */
export function getSvelteIconPackage(sourcePackage) {
    const mapping = getIconMapping(sourcePackage);
    return mapping?.svelte;
}
/**
 * Get the Vue equivalent icon package
 */
export function getVueIconPackage(sourcePackage) {
    const mapping = getIconMapping(sourcePackage);
    return mapping?.vue;
}
/**
 * Check if a package is an icon library
 */
export function isIconPackage(packageName) {
    return iconMappings.some((m) => m.source === packageName);
}
/**
 * Transform an icon import for the target framework
 */
export function transformIconImport(sourcePackage, iconNames, target) {
    const mapping = getIconMapping(sourcePackage);
    if (!mapping)
        return undefined;
    const targetPackage = target === 'svelte' ? mapping.svelte : mapping.vue;
    // Most icon libraries use the same icon names
    // Some may need transformation (e.g., react-icons uses different naming)
    return {
        package: targetPackage,
        icons: iconNames,
    };
}
//# sourceMappingURL=icons.js.map