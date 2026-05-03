export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhoneNumber = (phone) => {
  // Regex untuk nomor HP Indonesia (contoh: 08123456789 atau 628123456789)
  const phoneRegex = /^(^\+62|62|^08)(\d{3,4}-?){2}\d{3,4}$/
  return phoneRegex.test(phone)
}
