import type { Role } from "@prisma/client";

const RANK: Record<Role, number> = { VISITOR: 0, YOUNG_SPEAKER: 0, MODERATOR: 1, ADMIN: 2, SUPER_ADMIN: 3 };

export const roleLabels: Record<Role, string> = {
  VISITOR: "Visiteur",
  YOUNG_SPEAKER: "Young Speaker",
  MODERATOR: "Modérateur",
  ADMIN: "Administrateur",
  SUPER_ADMIN: "Super administrateur",
};

// Modérateurs, admins et super admins ont les mêmes accès à l'administration.
export const isStaff = (role?: Role | null) => Boolean(role) && RANK[role as Role] >= 1;

// Seul le super administrateur ajoute ou retire des modérateurs.
export const canManageModerators = (role?: Role | null) => role === "SUPER_ADMIN";

// On ne peut bloquer qu'un compte de rang strictement inférieur : un modérateur bloque
// les speakers et visiteurs, un admin aussi les modérateurs, le super admin n'est jamais bloqué.
export const canBlock = (actor: Role, target: Role) => isStaff(actor) && RANK[actor] > RANK[target];
