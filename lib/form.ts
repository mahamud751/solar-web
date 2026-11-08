export function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function checked(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export function safeNext(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

const phonePattern = /^01[3-9]\d{8}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validPhone(phone: string) {
  return phonePattern.test(phone);
}

export function validEmail(email: string) {
  return emailPattern.test(email);
}
