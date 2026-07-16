"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface ShareButtonProps {
  title?: string;
  text?: string;
  dict?: any;
}

export default function ShareButton({ title, text, dict }: ShareButtonProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: title || document.title,
      text: text || "",
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success(dict?.news?.linkCopied || "Link kopyalandı");
      } catch (err) {
        console.error("Clipboard copy failed:", err);
      }
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center justify-center p-3 rounded-full bg-surface hover:bg-surface/80 text-muted-foreground hover:text-primary transition-colors duration-200"
      aria-label={dict?.news?.share || "Paylaş"}
      title={dict?.news?.share || "Paylaş"}
    >
      <Share2 size={20} />
    </button>
  );
}
