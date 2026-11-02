// Roles posibles de un usuario. El "valor" es lo que se guarda en la columna
// profiles.rol (la base de datos solo admite estos dos); "etiqueta" es lo que ve el usuario.
export const ROLES = [
  {
    valor: "inquilino",
    etiqueta: "Busco habitación",
    descripcion: "Quiero encontrar piso y compañeros con los que encaje.",
  },
  {
    valor: "anfitrion",
    etiqueta: "Tengo una habitación libre",
    descripcion: "Quiero encontrar a alguien compatible para mi piso.",
  },
] as const;

export type Rol = (typeof ROLES)[number]["valor"];

export function esRolValido(valor: unknown): valor is Rol {
  return ROLES.some((rol) => rol.valor === valor);
}

export function etiquetaDeRol(rol: Rol) {
  return ROLES.find((r) => r.valor === rol)?.etiqueta ?? rol;
}
