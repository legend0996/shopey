module.exports = (phone) => {
  if (!phone) return null;

  // remove spaces
  phone = phone.replace(/\s+/g, '');

  // 0712345678 → 254712345678
  if (phone.startsWith('07') || phone.startsWith('01')) {
    return '254' + phone.slice(1);
  }

  // +254712345678 → 254712345678
  if (phone.startsWith('+254')) {
    return phone.slice(1);
  }

  // already correct
  if (phone.startsWith('254') && phone.length === 12) {
    return phone;
  }

  return null; // invalid
};