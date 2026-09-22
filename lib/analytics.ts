export type EventName = 'homepage_view' | 'generation_started' | 'generation_completed' | 'generation_failed' | 'result_copied' | 'result_favorited' | 'result_shared' | 'regenerate_clicked' | 'make_worse_clicked' | 'make_better_clicked' | 'tone_selected' | 'chaos_level_changed';
export interface Analytics {
    track(event: EventName): void;
}
// Replace with a consent-aware provider. Never include briefs or generated text.
export const analytics: Analytics = { track(event) { if (typeof window !== 'undefined')
        window.dispatchEvent(new CustomEvent('quickietime:analytics', { detail: { event } })); } };
