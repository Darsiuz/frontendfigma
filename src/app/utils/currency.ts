export const getCurrencySymbol = (currency?: string) => {
    switch (currency) {
        case 'USD': return '$';
        case 'PEN': return 'S/';
        case 'EUR': return '€';
        case 'MXN': return '$';
        case 'COP': return '$';
        case 'ARS': return '$';
        default: return '$';
    }
};