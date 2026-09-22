export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

const avatarColors = ["#ffd56a", "#a5e4d5", "#cfb8ff", "#ffaaa5", "#8cc8ff", "#ffc98e"];

export function avatarColor(value: string) {
  const index = [...value].reduce((total, character) => total + character.charCodeAt(0), 0) % avatarColors.length;
  return avatarColors[index];
}
