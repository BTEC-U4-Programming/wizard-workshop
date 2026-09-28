export const baseUrl = () => import.meta.env.BASE_URL;
export const tomeUrl = (tome) =>
  tome ? `${baseUrl()}?tome=${tome}` : baseUrl();
export const brand = () =>
  `<a class="brand" href="${tomeUrl(null)}" aria-label="Wizard Workshop — back to the library"><span class="brand-mark" aria-hidden="true">✦</span><span>WIZARD <strong>WORKSHOP</strong><small>Small steps. Real JavaScript. Your creation.</small></span></a>`;
