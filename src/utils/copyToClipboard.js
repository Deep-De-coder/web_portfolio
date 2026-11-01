/**
 * Copy text, and report honestly whether it worked.
 *
 * The async clipboard API needs a secure context and permission, and is
 * refused outright in some embedded views. An earlier version of this logic
 * caught that rejection and did nothing, which left a button that looked
 * dead. So: try the modern path, fall back to the legacy one, and return
 * false rather than pretending.
 *
 * @param {string} text
 * @returns {Promise<boolean>} true only if the text actually reached the clipboard
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    // fall through to the legacy path
  }

  try {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '-1000px';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(field);
    return ok;
  } catch (err) {
    return false;
  }
}
