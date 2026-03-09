import React, { useState, useRef, useEffect } from 'react';
import { FileText, Upload, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker to match the installed version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.5.207/build/pdf.worker.min.mjs`;

type Message = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-pdf`;

export default function PdfTutor() {
  const [documentText, setDocumentText] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({ title: "صيغة غير مدعومة", description: "يرجى رفع ملف PDF فقط.", variant: "destructive" });
      return;
    }

    setIsParsing(true);
    setDocumentText('');
    setMessages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      const numPages = Math.min(pdf.numPages, 50); // Limit to first 50 pages to prevent memory issues
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      setDocumentText(fullText);
      setMessages([{ 
        role: "assistant", 
        content: `مرحباً! لقد قمت بتحليل ملف "${file.name}" (أول ${numPages} صفحات). كيف يمكنني مساعدتك في فهمه؟` 
      }]);
    } catch (err) {
      console.error("PDF Parsing Error:", err);
      toast({ title: "حدث خطأ", description: "تعذر قراءة ملف PDF. يرجى المحاولة بملف آخر.", variant: "destructive" });
    } finally {
      setIsParsing(false);
    }
  };

  const streamChat = async (msgs: Message[], docText: string) => {
    setIsLoading(true);
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: msgs, documentText: docText }),
      });

      if (!resp.ok) throw new Error("Failed to start stream");

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantSoFar = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantSoFar;
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error(error);
      toast({ title: "حدث خطأ", description: "تعذر الاتصال بالمدرس. يرجى المحاولة لاحقاً.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !documentText || isLoading) return;
    
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput('');
    
    await streamChat(newMessages, documentText);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">المدرس الأكاديمي (PDF)</h1>
        <p className="text-muted-foreground">ارفع مستندك الأكاديمي واطرح الأسئلة لفهم المحتوى بشكل أفضل.</p>
      </div>

      {!documentText ? (
        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">ارفع ملف PDF</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              قم برفع الملفات الجامعية، المقالات العلمية، أو المذكرات ليقوم المدرس الذكي بقراءتها ومساعدتك.
            </p>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isParsing}
              size="lg"
            >
              {isParsing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري القراءة والتحليل...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  اختر ملفاً
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex flex-col h-[600px]">
          <CardHeader className="border-b py-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">محادثة المدرس الذكي</CardTitle>
                <CardDescription>اسأل عن المفاهيم، اطلب ملخصاً، أو استفسر عن أي شيء في المستند.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setDocumentText('')}>
                رفع ملف آخر
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4 pb-4">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-tl-none' 
                          : 'bg-muted rounded-tr-none'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert">
                          {msg.content === "" ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t bg-card mt-auto">
              <div className="flex gap-2 relative">
                <Input 
                  placeholder="اسأل سؤالاً حول المستند..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                  className="pr-12"
                />
                <Button 
                  size="icon" 
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="h-4 w-4 rtl:-scale-x-100" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
