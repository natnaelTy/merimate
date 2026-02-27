'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, ExternalLink, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const BOOKMARKLET_CODE = `javascript:(function(){let t=document.title||'',d='',c='',p='Other';if(location.hostname.includes('upwork.com')){p='Upwork';t=document.querySelector('h1')?.innerText||t;d=(document.querySelector('.job-description,.description-text,[data-test="job-description"]')||{}).innerText||'';c=(document.querySelector('.client-name,.freelancer-name')||{}).innerText||'';}else if(location.hostname.includes('fiverr.com')){p='Fiverr';t=document.querySelector('h1')?.innerText||t;d=(document.querySelector('.description,.gig-description')||{}).innerText||'';}else if(location.hostname.includes('linkedin.com')){p='LinkedIn';t=document.querySelector('h1')?.innerText||t;d=(document.querySelector('.show-more-less-content,.description')||{}).innerText||'';}const data={jobTitle:t.substring(0,150),description:d.substring(0,800),clientName:c.substring(0,80),platform:p};const q=new URLSearchParams(data);window.open('https://merimate-5e3o.vercel.app/leads/new?'+q.toString(),'_blank');})();`;

export default function BookmarkletPage() {
  const [copied, setCopied] = useState(false);

  const copyBookmarklet = async () => {
    await navigator.clipboard.writeText(BOOKMARKLET_CODE);
    setCopied(true);
    toast.success("✅ Bookmarklet copied! Now follow the steps below.");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
            ⚡ One-Click Magic
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Send Any Job to Merimate Instantly</h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Install this bookmarklet once. Then click it on any Upwork, Fiverr, or LinkedIn job — it opens Merimate with everything pre-filled.
          </p>
        </div>

        {/* Install Steps */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Install in 15 seconds</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold shrink-0">1</div>
                <div>
                  <p className="font-medium">Click the big button below</p>
                  <p className="text-sm text-muted-foreground">This copies the bookmarklet code</p>
                </div>
              </div>

              {/* Copy Button */}
              <Button
                onClick={copyBookmarklet}
                size="lg"
                className="w-full text-lg h-14"
              >
                <Copy className="mr-3" />
                {copied ? "✅ Copied!" : "Copy Bookmarklet Code"}
              </Button>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold shrink-0">2</div>
                <div>
                  <p className="font-medium">Add it to your bookmarks</p>
                  <p className="text-sm text-muted-foreground">
                    In Chrome/Edge → Click the star in address bar → Name it <strong>“Send to Merimate”</strong> → Paste the code in the URL field → Save
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold shrink-0">3</div>
                <div>
                  <p className="font-medium">Start using it</p>
                  <p className="text-sm text-muted-foreground">
                    Open any job → Click the bookmark → Merimate opens with the lead pre-filled and ready for AI proposal!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How it works */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-6">How it works on each platform</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-muted/50 p-6 rounded-xl text-left">
              <p className="font-medium text-sm mb-1">Upwork</p>
              <p className="text-xs text-muted-foreground">Pulls job title, full description &amp; client name</p>
            </div>
            <div className="bg-muted/50 p-6 rounded-xl text-left">
              <p className="font-medium text-sm mb-1">Fiverr</p>
              <p className="text-xs text-muted-foreground">Pulls gig title &amp; description</p>
            </div>
            <div className="bg-muted/50 p-6 rounded-xl text-left">
              <p className="font-medium text-sm mb-1">LinkedIn</p>
              <p className="text-xs text-muted-foreground">Pulls post title &amp; description</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center pt-6">
          <p className="text-sm text-muted-foreground">
            After installing, try it on any job post and come back here if you need help.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.open('https://merimate-5e3o.vercel.app/leads/new', '_blank')}
          >
            Open Merimate <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}