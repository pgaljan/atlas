import { decryptPermission } from "./encryptionCrypto"

export function getRoleAndAccess(encryptedPermission) {
  // 1. Decrypt
  const decrypted = decryptPermission(encryptedPermission)

  // 2. Normalize role
  const validRoles = ["viewer", "commenter", "editor", "owner"]
  let role = decrypted?.toLowerCase?.()

  if (!role || !validRoles.includes(role)) {
    role = "owner"
  }

  // 3. Read-only state
  let isReadOnly
  switch (role) {
    case "editor":
      isReadOnly = false
      break
    case "viewer":
    case "commenter":
      isReadOnly = true
      break
    case "owner":
    default:
      role = "owner"
      isReadOnly = false
      break
  }

  return { role, isReadOnly }
}

/**
 * Role-based access control (aligned with ticket requirements)
 * @param {string} role - one of "owner", "editor" (collaborator), "commenter", "viewer"
 */
export function getRoleAccessMap(role) {
  const access = {
    canEdit: false,
    canComment: false,
    canView: false,
    canManage: false, 
    canExport: false,
  }

  switch (role) {
    case "owner":
      access.canEdit = true // edit structure + records
      access.canView = true // implicit (browse)
      access.canManage = true // add collaborators
      access.canExport = true // export structure
      break

    case "editor": // collaborator
      access.canEdit = true // edit structure + records
      access.canView = true // implicit (browse)
      break

    case "commenter":
      access.canComment = true // comment
      access.canView = true // browse
      break

    case "viewer":
      access.canView = true // browse
      access.canExport = true // export
      break

    default:
      access.canView = true 
      break
  }

  return access
}
