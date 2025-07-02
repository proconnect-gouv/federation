const base64REGEX = /^(?:[A-Za-z0-9\\\+/]{4})*(?:[A-Za-z0-9\\\+/]{2}==|[A-Za-z0-9\\\+/]{3}=|[A-Za-z0-9\\\+/]{4})$/;
/**
 * Allow to convert base64 content in blob
 * @param {string} base64 base64 data
 * @param {string} type type mime
 */
export const b64toBlob = async (data, type = 'application/octet-stream') => {
  const isSVG =
    data &&
    typeof data === 'string' &&
    (data.startsWith('<svg') || data.startsWith('<?xml'));
  const isBase64 = base64REGEX.test(data);
  if (!isSVG && !isBase64) {
    return data;
  }
  const format = isSVG
    ? `data:image/svg+xml;utf8,${data}`
    : `data:${type};base64,${data}`;
  try {
    const res = await fetch(format);
    return await res.blob();
  } catch (e) {
    console.error(e);
    return null;
  }
};
