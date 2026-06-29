export const JOLLIFY_IMAGE_ORIGIN = 'https://jollifytravel.com';

export const toPreviewImageUrl = value => {
  const url = String(value || '').trim();
  if (!url) return '';
  if (/^\/\/(?:www\.)?jollifytravel\.com\//i.test(url)) return `https:${url}`;
  if (/^(?:www\.)?jollifytravel\.com\//i.test(url)) return `https://${url}`;
  if (url.startsWith('/')) return `${JOLLIFY_IMAGE_ORIGIN}${url}`;
  return url;
};

export const prepareHtmlImagesForPreview = html => String(html || '')
  .replace(/(\bsrc\s*=\s*["'])\/(?!\/)/gi, `$1${JOLLIFY_IMAGE_ORIGIN}/`)
  .replace(/(\bsrc\s*=\s*["'])(?:www\.)?jollifytravel\.com\//gi, `$1${JOLLIFY_IMAGE_ORIGIN}/`)
  .replace(/(url\(\s*["']?)\/(?!\/)/gi, `$1${JOLLIFY_IMAGE_ORIGIN}/`)
  .replace(/(url\(\s*["']?)(?:www\.)?jollifytravel\.com\//gi, `$1${JOLLIFY_IMAGE_ORIGIN}/`);

export const prepareHtmlImagesForKowei = html => String(html || '')
  .replace(/(\bsrc\s*=\s*["'])https?:\/\/(?:www\.)?jollifytravel\.com(?=\/)/gi, '$1')
  .replace(/(url\(\s*["']?)https?:\/\/(?:www\.)?jollifytravel\.com(?=\/)/gi, '$1');
