const NET_ID_FORMAT = /^[a-zA-Z]{3}\d{6}$/

/**
 * Validates a UTD email and extracts the netID portion.
 * Valid format: abc123456@utdallas.edu
 * @param email - full UTD email address
 * @param require - if true, throws on invalid; if false, returns null
 */
export function validateEmailAndReturnNetID(
  email: string,
  require = true,
): string | null {
  const lower = email.toLowerCase()
  const [netID, domain] = lower.split('@')

  if (domain !== 'utdallas.edu') {
    if (require) throw new Error('Invalid email: must be a @utdallas.edu address')
    return null
  }

  if (!NET_ID_FORMAT.test(netID)) {
    if (require) throw new Error('Invalid netID: must be in format abc123456')
    return null
  }

  return netID
}

export function isValidUTDEmail(email: string): boolean {
  return validateEmailAndReturnNetID(email, false) !== null
}

const GENERIC_EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Role-aware email validation.
 * Students and admins must use a @utdallas.edu address (netID extracted);
 * mentors may be external sponsors, so any valid email is accepted (netID null).
 */
export function validateEmailForRole(email: string, role: string): string | null {
  if (role === 'MENTOR') {
    if (!GENERIC_EMAIL_FORMAT.test(email.trim())) {
      throw new Error('Invalid email address')
    }
    // External mentors may still use a UTD email — capture the netID when they do
    return validateEmailAndReturnNetID(email, false)
  }
  return validateEmailAndReturnNetID(email)
}
