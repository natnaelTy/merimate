"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

function NewLeadPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [platform, setPlatform] = useState('Upwork');
  const [isCreating, setIsCreating] = useState(false);

  // Pre-fill from bookmarklet query params
  useEffect(() => {
    setJobTitle(searchParams.get('jobTitle') || '');
    setDescription(searchParams.get('description') || '');
    setClientName(searchParams.get('clientName') || '');
    setPlatform(searchParams.get('platform') || 'Upwork');
  }, [searchParams]);

  const handleCreateLead = async () => {
    if (!jobTitle.trim()) {
      toast.error('Job title is required');
      return;
    }

    setIsCreating(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          description: description.trim(),
          clientName: clientName.trim() || null,
          platform,
        }),
      });

      if (!res.ok) throw new Error('Failed to create lead');

      const newLead = await res.json();
      toast.success('Lead created successfully!');
      
      // Redirect to the new lead detail page
      router.push(`/leads/${newLead.id}`);
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>New Lead from Bookmarklet</CardTitle>
            <p className="text-sm text-muted-foreground">
              Everything is already pre-filled. Just click Create!
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium">Job Title</label>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Job title"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Job description (optional)"
                rows={6}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Client Name (optional)</label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client name"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Platform</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Upwork">Upwork</SelectItem>
                  <SelectItem value="Fiverr">Fiverr</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCreateLead}
              disabled={isCreating || !jobTitle.trim()}
              className="w-full"
              size="lg"
            >
              {isCreating ? 'Creating Lead...' : 'Create Lead & Generate Proposal'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function NewLeadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background p-6" />}>
      <NewLeadPageContent />
    </Suspense>
  );
}