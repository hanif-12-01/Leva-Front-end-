const firstValidationMessage = (errors = {}) => {
  const fieldOrder = ['name', 'email', 'password', 'password_confirmation', 'major', 'semester']

  for (const field of fieldOrder) {
    if (Array.isArray(errors[field]) && errors[field][0]) {
      return { field, message: errors[field][0] }
    }
  }

  const fallback = Object.entries(errors).find(([, value]) => Array.isArray(value) && value[0])
  if (!fallback) return null
  return { field: fallback[0], message: fallback[1][0] }
}

export const friendlyAuthError = (error, fallback = 'Terjadi kendala pada server. Silakan coba lagi nanti.') => {
  const status = error.response?.status
  const validation = firstValidationMessage(error.response?.data?.errors)
  const rawMessage = String(validation?.message || error.response?.data?.message || '').toLowerCase()
  const field = validation?.field || ''

  if (status === 0 || !error.response) {
    return 'Tidak bisa terhubung ke server. Pastikan backend aktif, lalu coba lagi.'
  }

  if (status === 401) {
    return 'Email atau password tidak sesuai. Periksa kembali data login kamu.'
  }

  if (status === 409) {
    return 'Akun ini sudah pernah menyelesaikan proses tersebut.'
  }

  if (field === 'name' || rawMessage.includes('name')) {
    if (rawMessage.includes('required')) return 'Nama lengkap wajib diisi.'
    if (rawMessage.includes('max')) return 'Nama terlalu panjang. Gunakan maksimal 255 karakter.'
    return 'Nama belum sesuai. Periksa kembali nama lengkap kamu.'
  }

  if (field === 'email' || rawMessage.includes('email')) {
    if (rawMessage.includes('required')) return 'Email wajib diisi.'
    if (rawMessage.includes('valid') || rawMessage.includes('format')) return 'Format email belum benar. Contoh: nama@student.com.'
    if (rawMessage.includes('unique') || rawMessage.includes('already') || rawMessage.includes('taken')) return 'Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.'
    if (status === 404 || rawMessage.includes('not found')) return 'Email tidak ditemukan. Periksa lagi atau daftar akun baru.'
    return 'Email belum sesuai. Periksa kembali alamat email kamu.'
  }

  if (field === 'password' || field === 'password_confirmation' || rawMessage.includes('password')) {
    if (rawMessage.includes('required')) return 'Password wajib diisi.'
    if (rawMessage.includes('min')) return 'Password harus minimal 8 karakter.'
    if (rawMessage.includes('confirmed') || rawMessage.includes('confirmation') || rawMessage.includes('match')) return 'Konfirmasi password belum sama.'
    return 'Password belum sesuai. Periksa kembali password kamu.'
  }

  if (status === 422) {
    return 'Data yang kamu isi belum sesuai. Periksa kembali formnya.'
  }

  if (status >= 500) {
    return 'Server sedang mengalami kendala. Silakan coba lagi nanti.'
  }

  return fallback
}
