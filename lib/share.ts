export function shareCardFilename(resultId = 'draft') {
    const id = resultId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'draft';
    const unique = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
    return `quickietime-${id}-${unique}.png`;
}

export function wrapCardText(text: string, measure: (text: string) => number, width: number) {
    const lines: string[] = [];
    for (const paragraph of text.split(/\r?\n/)) {
        let line = '';
        for (const word of paragraph.split(/\s+/).filter(Boolean)) {
            const next = line ? `${line} ${word}` : word;
            if (measure(next) <= width) { line = next; continue; }
            if (line) lines.push(line);
            line = '';
            for (const character of Array.from(word)) {
                if (line && measure(line + character) > width) { lines.push(line); line = ''; }
                line += character;
            }
        }
        lines.push(line);
    }
    return lines;
}

export async function downloadCard(text: string, resultId?: string) {
    const canvas = document.createElement('canvas');
    const c = canvas.getContext('2d');
    if (!c) throw new Error('Canvas unavailable');
    const font = text.length > 300 ? 36 : text.length > 150 ? 52 : 76;
    c.font = `bold ${font}px Arial`;
    const lines = wrapCardText(text, value => c.measureText(value).width, 920);
    const lineHeight = font * 1.3;
    const contentHeight = lines.length * lineHeight;
    canvas.width = 1080;
    canvas.height = Math.max(1080, Math.ceil(contentHeight + 360));
    c.fillStyle = '#c5f74f'; c.fillRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = '#161812'; c.font = 'bold 40px Arial';
    c.fillText('ϟ QuickieTime', 80, 110);
    c.font = `bold ${font}px Arial`; c.textBaseline = 'top';
    const top = 190 + Math.max(0, (canvas.height - 360 - contentHeight) / 2);
    lines.forEach((line, i) => c.fillText(line, 80, top + i * lineHeight));
    c.font = '28px Arial'; c.fillText("Don't make a project out of it.", 80, canvas.height - 90);
    const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/png'));
    if (!blob) throw new Error('Export failed');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = shareCardFilename(resultId);
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
