import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BookOpen } from 'lucide-react';

interface GrammarData {
  structure: string;
  explanation: string;
  pattern: string;
  tip: string;
}

interface GrammarTipProps {
  sentence: string;
  children: React.ReactNode;
}

const GrammarTip = ({ sentence, children }: GrammarTipProps) => {
  const { toast } = useToast();
  const [data, setData] = useState<GrammarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadGrammar = async () => {
    if (data) return;
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('grammar-tips', {
        body: { sentence },
      });
      if (error) throw error;
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (e: any) {
      toast({ title: 'خطأ', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) loadGrammar(); }}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" dir="rtl" side="top">
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : data ? (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-bold text-primary">{data.structure}</span>
            </div>
            <div className="text-sm font-mono bg-secondary/50 p-2 rounded" dir="ltr">
              {data.pattern}
            </div>
            <p className="text-sm leading-relaxed">{data.explanation}</p>
            <div className="text-xs bg-accent/10 text-accent-foreground p-2 rounded border border-accent/20">
              💡 {data.tip}
            </div>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};

export default GrammarTip;
