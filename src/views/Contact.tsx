'use client';

import { Clock, Mail, MapPin, MessageCircle } from 'lucide-react';
import { EnquiryForm } from '@/components/account/EnquiryForm';
import { PageHero } from '@/components/ui/PageHero';
import { SUPPORT_EMAIL, WHATSAPP_NUMBER, whatsappLink } from '@/lib/contact';

export default function Contact() {
  const cards = [
    { icon: MessageCircle, t: 'WhatsApp', d: `+${WHATSAPP_NUMBER.replace(/^91/, '91 ')}`, href: whatsappLink('Hi! I have a question.') },
    { icon: Mail, t: 'Email', d: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
    { icon: MapPin, t: 'Kitchen & studio', d: 'Navrangpura, Ahmedabad, Gujarat' },
    { icon: Clock, t: 'Hours', d: 'Mon – Sat · 10 am – 7 pm IST' },
  ];
  return (
    <>
      <PageHero eyebrow="Contact" title="We’d love to hear from you" intro="Questions about an order, a blend, or a big celebration? Write to us — a real person replies within one working day." />
      <section className="container-x grid gap-10 pb-24 lg:grid-cols-[360px_1fr]">
        <ul className="space-y-3">
          {cards.map(({ icon: Icon, t, d, href }) => {
            const inner = (
              <>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sand text-saffron-deep">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs tracking-wider text-muted uppercase">{t}</span>
                  <span className="text-maroon">{d}</span>
                </span>
              </>
            );
            return (
              <li key={t}>
                {href ? (
                  <a href={href} target="_blank" rel="noreferrer" className="card flex items-center gap-4 p-5 transition hover:shadow-lift">
                    {inner}
                  </a>
                ) : (
                  <div className="card flex items-center gap-4 p-5">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
        <EnquiryForm kinds={['CONTACT', 'BULK', 'WEDDING']} />
      </section>
    </>
  );
}
