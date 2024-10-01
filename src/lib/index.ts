// place files you want to import through the `$lib` alias in this folder.

export function adjustHexColor(hex: string, percent: number): string {
    // Helper function to convert a hex string to an RGB object
    function hexToRgb(hex: string) {
        // Remove the leading "#" if present
        hex = hex.replace(/^#/, '');

        const bigint = parseInt(hex, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }

    // Helper function to convert RGB object to hex string
    function rgbToHex(r: number, g: number, b: number): string {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    }

    // Helper function to convert RGB to HSV
    function rgbToHsv(r: number, g: number, b: number) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        let h = 0, s = 0;
		const v = max;

        if (delta !== 0) {
            s = max === 0 ? 0 : delta / max;

            switch (max) {
                case r: h = (g - b) / delta + (g < b ? 6 : 0); break;
                case g: h = (b - r) / delta + 2; break;
                case b: h = (r - g) / delta + 4; break;
            }

            h /= 6;
        }

        return { h, s, v };
    }

    // Helper function to convert HSV to RGB
    function hsvToRgb(h: number, s: number, v: number) {
        let r, g, b;

        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    // Step 1: Convert hex to RGB
    const { r, g, b } = hexToRgb(hex);

    // Step 2: Convert RGB to HSV
    let { h, s, v } = rgbToHsv(r, g, b);

    // Step 3: Adjust saturation and value for lighter or darker effect
    if (percent > 0) {
        // Lighter: move closer to white (S=0, V=1)
        s *= (1 - percent);  // Reduce saturation
        v += (1 - v) * percent;  // Increase value towards 1
    } else {
        // Darker: move closer to black (S=1, V=0)
        s += (1 - s) * (-percent);  // Increase saturation towards 1
        v *= (1 + percent);  // Decrease value
    }

    // Step 4: Convert HSV back to RGB
    const { r: newR, g: newG, b: newB } = hsvToRgb(h, s, v);

    // Step 5: Convert RGB back to hex and return
    return rgbToHex(newR, newG, newB);
}
