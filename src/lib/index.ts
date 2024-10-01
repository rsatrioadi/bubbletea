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

	// Helper function to convert RGB to HSL
	function rgbToHsl(r: number, g: number, b: number) {
		r /= 255;
		g /= 255;
		b /= 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h = 0, s = 0, l = (max + min) / 2;

		if (max !== min) {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}

			h /= 6;
		}

		return { h, s, l };
	}

	function hue2rgb(p: number, q: number, t: number) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 3) return q;
		if (t < 1 / 2) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	}
	
	// Helper function to convert HSL to RGB
	function hslToRgb(h: number, s: number, l: number) {
		let r, g, b;

		if (s === 0) {
			r = g = b = l; // achromatic
		} else {

			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}

		return {
			r: Math.round(r * 255),
			g: Math.round(g * 255),
			b: Math.round(b * 255)
		};
	}

	// Step 1: Convert hex to RGB
	const { r, g, b } = hexToRgb(hex);

	// Step 2: Convert RGB to HSL
	const { h, s, l } = rgbToHsl(r, g, b);

	// Step 3: Adjust the luminance
	const l2 = Math.min(1, Math.max(0, l + percent)); // Ensure luminance stays between 0 and 1

	// Step 4: Convert HSL back to RGB
	const { r: newR, g: newG, b: newB } = hslToRgb(h, s, l2);

	// Step 5: Convert RGB back to hex and return
	return rgbToHex(newR, newG, newB);
}

