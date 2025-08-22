import { decryptPermission } from "./encryptionCrypto";

export function getRoleAndAccess(encryptedPermission) {
  // 1. Decrypt
  const decrypted = decryptPermission(encryptedPermission);

  // 2. Normalize role
  const validRoles = ["viewer", "commenter", "editor", "owner"];
  let role = decrypted?.toLowerCase?.();

  if (!role || !validRoles.includes(role)) {
    role = "owner";
  }

  // 3. Read-only state
  let isReadOnly;
  switch (role) {
    case "editor":
      isReadOnly = false;
      break;
    case "viewer":
    case "commenter":
      isReadOnly = true;
      break;
    case "owner":
    default:
      role = "owner";
      isReadOnly = false;
      break;
  }

  return { role, isReadOnly };
}

/**
 * Role-based access control
 * @param {string} role - one of "owner", "editor", "commenter", "viewer"
 */
export function getRoleAccessMap(role) {
  const access = {
    canEdit: false,
    canComment: false,
    canView: true, 
    canManage: false,
  };

  switch (role) {
    case "owner":
      access.canEdit = true;
      access.canComment = true;
      access.canManage = true;
      break;

    case "editor":
      access.canEdit = true;
      access.canComment = true;
      break;

    case "commenter":
      access.canComment = true;
      break;

    case "viewer":
    default:
      break;
  }

  return access;
}
