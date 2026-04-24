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
