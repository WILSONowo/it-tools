export { textToBase64, base64ToText, isValidBase64, removePotentialDataAndMimePrefix };

// btoa/atob only handle Latin-1, so go through UTF-8 bytes explicitly.
function textToBase64(str: string) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return window.btoa(binary);
}

function base64ToText(str: string) {
  if (!isValidBase64(str)) {
    throw new Error('Incorrect base64 string');
  }

  const cleanStr = removePotentialDataAndMimePrefix(str);

  try {
    const binary = window.atob(cleanStr);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch (_) {
    throw new Error('Incorrect base64 string');
  }
}

function removePotentialDataAndMimePrefix(str: string) {
  return str.replace(/^data:.*?;base64,/, '');
}

function isValidBase64(str: string) {
  const cleanStr = removePotentialDataAndMimePrefix(str);

  try {
    return window.btoa(window.atob(cleanStr)) === cleanStr;
  } catch (err) {
    return false;
  }
}
