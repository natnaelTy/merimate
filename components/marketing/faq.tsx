"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    q: "Can I use Merimate for free?",
    a: "Yes. The Free plan lets you track leads and generate AI follow-ups so you can try everything before upgrading.",
  },
  {
    q: "Does this only work with Upwork?",
    a: "No. You can track clients from email, LinkedIn, Fiverr, Telegram, or any platform. Merimate works everywhere.",
  },
  {
    q: "How is this different from ChatGPT?",
    a: "ChatGPT only writes text. Merimate tracks your leads, reminds you when to follow up, and organizes your entire workflow — with AI built in.",
  },
  {
    q: "Do I need a credit card to start?",
    a: "Nope. You can sign up and use the Free plan without entering any payment details.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. There are no contracts. Upgrade, downgrade, or cancel whenever you want.",
  },
  {
    q: "Will this help me get more clients?",
    a: "Merimate helps you respond faster and follow up consistently. Most freelancers close more deals simply by staying organized.",
  },
]

export default function FAQSection() {
  return (
    <section id="faq" className="py-24 px-6 w-full scroll-mt-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Frequently asked questions
        </h2>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-lg font-normal">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
