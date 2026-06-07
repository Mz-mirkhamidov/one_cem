"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare, Copy, CheckCheck, Plus, Trash2 } from "lucide-react";

const DEFAULT_TEMPLATES = [
  {
    id: "1",
    label: "Birinchi aloqa",
    emoji: "👋",
    text: "Assalomu alaykum! AJR mahsulotlari bo'yicha so'rov qoldirdingiz. Qaysi mahsulot qiziqtiradi? Batafsil ma'lumot berishim mumkin.",
  },
  {
    id: "2",
    label: "Narx so'ragan",
    emoji: "💰",
    text: "Assalomu alaykum! Narxlar: AJR Sedan — 150,000 so'm, AJR MEN — 180,000 so'm, AJR Women — 170,000 so'm, AJR Kids — 120,000 so'm, Estet — 200,000 so'm. Buyurtma uchun qulay payt aytingiz.",
  },
  {
    id: "3",
    label: "Eslatma / Follow-up",
    emoji: "🔔",
    text: "Assalomu alaykum! Oldingi suhbatimizni davom ettirishni xohlardim. Mahsulot haqida qaror qildingizmi? Yordam bersam xursand bo'laman.",
  },
  {
    id: "4",
    label: "Buyurtma tasdiqlash",
    emoji: "✅",
    text: "Assalomu alaykum! Buyurtmangiz qabul qilindi. Yetkazib berish muddati va manzilni tasdiqlashimiz kerak. Qachon qulay?",
  },
  {
    id: "5",
    label: "Sovuq lid — qayta",
    emoji: "❄️",
    text: "Assalomu alaykum! Bir muddat oldin bog'lanishga harakat qildim. Vaqtingiz bo'lsa, AJR mahsulotlari haqida 2 daqiqa gaplashsak bo'ladimi?",
  },
  {
    id: "6",
    label: "Topshirish vaqti",
    emoji: "📦",
    text: "Assalomu alaykum! Buyurtmangiz tayyor. Bugun yoki ertaga topshirish mumkin. Qaysi vaqt qulay?",
  },
];

interface MessageTemplatesProps {
  open: boolean;
  onClose: () => void;
  clientName?: string;
}

export function MessageTemplates({ open, onClose, clientName }: MessageTemplatesProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [newLabel, setNewLabel] = useState("");
  const [newText, setNewText] = useState("");
  const [addMode, setAddMode] = useState(false);

  function copyTemplate(id: string, text: string) {
    const finalText = clientName
      ? text.replace("Assalomu alaykum!", `Assalomu alaykum, ${clientName}!`)
      : text;
    navigator.clipboard.writeText(finalText);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function addTemplate() {
    if (!newLabel.trim() || !newText.trim()) return;
    setTemplates((prev) => [
      ...prev,
      { id: Date.now().toString(), label: newLabel, emoji: "💬", text: newText },
    ]);
    setNewLabel("");
    setNewText("");
    setAddMode(false);
  }

  function deleteTemplate(id: string) {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Tezkor xabar shablonlari
            {clientName && (
              <span className="text-sm font-normal text-muted-foreground">— {clientName}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {templates.map((t) => (
            <div key={t.id} className="group bg-secondary/50 border border-border rounded-lg p-3 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                  {t.emoji} {t.label}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-7 px-2 text-xs gap-1 transition-all ${copied === t.id ? "text-emerald-400 bg-emerald-500/10" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => copyTemplate(t.id, t.text)}
                  >
                    {copied === t.id ? (
                      <><CheckCheck className="w-3.5 h-3.5" /> Nusxa olindi</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Nusxa</>
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteTemplate(t.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.text}</p>
            </div>
          ))}

          {/* Add new template */}
          {addMode ? (
            <div className="border border-primary/30 rounded-lg p-3 space-y-2 bg-primary/5">
              <input
                className="w-full bg-input border border-border rounded-md px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Shablon nomi..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
              <textarea
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none min-h-[80px]"
                placeholder="Xabar matni..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setAddMode(false)} className="flex-1 text-xs">Bekor</Button>
                <Button size="sm" onClick={addTemplate} className="flex-1 text-xs">Qo'shish</Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full border-dashed text-muted-foreground hover:text-foreground gap-2 text-xs"
              onClick={() => setAddMode(true)}
            >
              <Plus className="w-3.5 h-3.5" /> Yangi shablon qo'shish
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
