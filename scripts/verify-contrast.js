/**
 * MindWallet Contrast Ratio Verifier
 * Computes WCAG 2.2 contrast ratios for all foreground/background pairs in Standard and High Contrast modes.
 * Requirements:
 * - WCAG 1.4.3: Normal text >= 4.5:1, Large text >= 3.0:1
 * - WCAG 1.4.11: Non-text contrast (UI components and graphical objects) >= 3.0:1
 */

function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

function channelLuminance(c) {
    const sRGB = c / 255;
    return sRGB <= 0.04045
        ? sRGB / 12.92
        : Math.pow((sRGB + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

function contrastRatio(fgHex, bgHex) {
    const l1 = relativeLuminance(fgHex);
    const l2 = relativeLuminance(bgHex);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

const standardPairs = [
    { context: "White text on darkened Emerald button/badge/nav", fg: "#FFFFFF", bg: "#0F7A5A", target: 4.5 },
    { context: "White text on Emerald hover", fg: "#FFFFFF", bg: "#0B6047", target: 4.5 },
    { context: "Warning text on Orange light pill", fg: "#8A5300", bg: "#FEF3E2", target: 4.5 },
    { context: "Danger text on Red light pill", fg: "#B02A37", bg: "#FCE8E8", target: 4.5 },
    { context: "Warning text on Card Surface (Health status Good)", fg: "#8A5300", bg: "#FFFFFF", target: 4.5 },
    { context: "Danger text on Card Surface (Health status Alert)", fg: "#B02A37", bg: "#FFFFFF", target: 4.5 },
    { context: "Primary body text on Card Surface", fg: "#101828", bg: "#FFFFFF", target: 4.5 },
    { context: "Muted text on Card Surface", fg: "#5B6472", bg: "#FFFFFF", target: 4.5 },
    { context: "Input border-strong on Input bg", fg: "#64748B", bg: "#F4F6F8", target: 3.0 },
    { context: "Input border-strong on Card Surface", fg: "#64748B", bg: "#FFFFFF", target: 3.0 },
    { context: "Orange progress fill on Progress track", fg: "#B85D00", bg: "#E4E8EE", target: 3.0 },
    { context: "Emerald progress fill on Progress track", fg: "#0F7A5A", bg: "#E4E8EE", target: 3.0 },
    { context: "Sidebar nav links on Sidebar background", fg: "#C7D4E8", bg: "#10233F", target: 4.5 },
    { context: "White text on Primary Navy toast", fg: "#FFFFFF", bg: "#10233F", target: 4.5 },
    { context: "Dark text on Warning toast", fg: "#10233F", bg: "#F5A524", target: 4.5 }
];

const highContrastPairs = [
    { context: "Sidebar white text on dark Sidebar bg", fg: "#FFFFFF", bg: "#0B1F3A", target: 4.5 },
    { context: "Active nav link dark text on bright Emerald", fg: "#0B0F17", bg: "#00F5A0", target: 4.5 },
    { context: "Primary button dark text on bright Emerald", fg: "#0B0F17", bg: "#00F5A0", target: 4.5 },
    { context: "Danger button dark text on bright Red", fg: "#0B0F17", bg: "#FF5555", target: 4.5 },
    { context: "Danger toast dark text on bright Red", fg: "#0B0F17", bg: "#FF5555", target: 4.5 },
    { context: "Success toast dark text on bright Emerald", fg: "#0B0F17", bg: "#00F5A0", target: 4.5 },
    { context: "Warning toast dark text on bright Yellow/Orange", fg: "#0B0F17", bg: "#FBBF24", target: 4.5 },
    { context: "Standard toast white text on dark Toast bg", fg: "#FFFFFF", bg: "#0B1F3A", target: 4.5 },
    { context: "White text on High Contrast Surface", fg: "#FFFFFF", bg: "#131B2E", target: 4.5 },
    { context: "Muted text on High Contrast Surface", fg: "#E2E8F0", bg: "#131B2E", target: 4.5 },
    { context: "Warning text on HC Surface", fg: "#FDE047", bg: "#131B2E", target: 4.5 },
    { context: "Danger text on HC Surface", fg: "#FFAAAA", bg: "#131B2E", target: 4.5 },
    { context: "HC Border strong on HC Surface", fg: "#94A3B8", bg: "#131B2E", target: 3.0 }
];

const darkModePairs = [
    { context: "Dark mode body text on Dark Surface", fg: "#F1F5F9", bg: "#141D2B", target: 4.5 },
    { context: "Dark mode muted text on Dark Surface", fg: "#94A3B8", bg: "#141D2B", target: 4.5 },
    { context: "Dark mode accent text on Dark Background", fg: "#10B981", bg: "#0C121D", target: 4.5 },
    { context: "Dark mode warning text on Dark Surface", fg: "#FDE68A", bg: "#141D2B", target: 4.5 },
    { context: "Dark mode critical text on Dark Surface", fg: "#FECACA", bg: "#141D2B", target: 4.5 },
    { context: "Dark mode border-strong on Dark Surface", fg: "#64748B", bg: "#141D2B", target: 3.0 }
];

function runVerification() {
    let allPassed = true;
    console.log("=== STANDARD THEME CONTRAST RATIOS ===");
    for (const item of standardPairs) {
        const ratio = contrastRatio(item.fg, item.bg);
        const passed = ratio >= item.target;
        if (!passed) allPassed = false;
        console.log(`${passed ? '✓ PASS' : '✗ FAIL'}: ${item.context}`);
        console.log(`  FG: ${item.fg} | BG: ${item.bg} | Ratio: ${ratio.toFixed(2)}:1 (Min: ${item.target}:1)\n`);
    }

    console.log("=== HIGH CONTRAST THEME CONTRAST RATIOS ===");
    for (const item of highContrastPairs) {
        const ratio = contrastRatio(item.fg, item.bg);
        const passed = ratio >= item.target;
        if (!passed) allPassed = false;
        console.log(`${passed ? '✓ PASS' : '✗ FAIL'}: ${item.context}`);
        console.log(`  FG: ${item.fg} | BG: ${item.bg} | Ratio: ${ratio.toFixed(2)}:1 (Min: ${item.target}:1)\n`);
    }

    console.log("=== DARK MODE CONTRAST RATIOS ===");
    for (const item of darkModePairs) {
        const ratio = contrastRatio(item.fg, item.bg);
        const passed = ratio >= item.target;
        if (!passed) allPassed = false;
        console.log(`${passed ? '✓ PASS' : '✗ FAIL'}: ${item.context}`);
        console.log(`  FG: ${item.fg} | BG: ${item.bg} | Ratio: ${ratio.toFixed(2)}:1 (Min: ${item.target}:1)\n`);
    }

    return allPassed;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { contrastRatio, runVerification, standardPairs, highContrastPairs, darkModePairs };
}

// Auto-run if executed directly
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('verify-contrast.js')) {
    const success = runVerification();
    if (!success) {
        process.exit(1);
    }
}

