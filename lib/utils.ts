import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isPast, parseISO } from "date-fns";
import { uz } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "dd.MM.yyyy HH:mm");
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), "dd.MM.yyyy");
}

export function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), "HH:mm");
}

export function isOverdue(dateStr: string): boolean {
  return isPast(parseISO(dateStr));
}

export function isTodayDate(dateStr: string): boolean {
  return isToday(parseISO(dateStr));
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "Yangi":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "Ko'rib chiqilmoqda":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Kelishildi":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "Rad etildi":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "Buyurtma berilgan":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    default:
      return "bg-secondary text-muted-foreground";
  }
}

export function getProductColor(product: string): string {
  switch (product) {
    case "AJR Sedan":
      return "bg-violet-500/20 text-violet-400";
    case "AJR MEN":
      return "bg-blue-500/20 text-blue-400";
    case "AJR Women":
      return "bg-pink-500/20 text-pink-400";
    case "AJR Kids":
      return "bg-orange-500/20 text-orange-400";
    case "Estet":
      return "bg-emerald-500/20 text-emerald-400";
    default:
      return "bg-secondary text-muted-foreground";
  }
}

// 9 xonalik format (MicroSIP uchun: +998901234567 → 901234567)
export function formatPhoneForCall(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 9 ? digits.slice(-9) : digits;
}
