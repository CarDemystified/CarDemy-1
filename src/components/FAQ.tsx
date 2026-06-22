import React, { useState } from 'react';
import { ChevronRight, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "Are these vehicles sold with clean ownership titles?",
      answer: "Absolutely. Every vehicle liquidated through Foreclosed Auto Deals is fully processed, certified, and transferred with legal repossession or foreclosure release paperwork. We handle all administrative hurdles, ensuring a clean title transfer to your name with no outstanding liens or debts."
    },
    {
      question: "Why are these prices significantly below market value?",
      answer: "Our assets are sourced directly from loan defaults, repossessions, and foreclosure seizures. The primary goal of recovery companies and financial institutions is quick debt liquidation and ledger clearing rather than retail profit. We price them to sell immediately, usually within 3-10 days."
    },
    {
      question: "Can I inspect the car in person before finalizing the sale?",
      answer: "Yes. All listings include location details, and active prospective buyers can schedule physical inspections or hire professional independent mechanics to audit the asset prior to closing. Arrangements can be coordinated immediately upon submitting an reservation inquiry."
    },
    {
      question: "What is your reservation and purchasing process?",
      answer: "Once you submit an inquiry via WhatsApp, call, or web form, our asset manager will contact you to review specifications, answer questions, and forward ownership history. A 10% refundable security deposit can lock the listing for 48 hours for finalizing inspections and title transfer."
    },
    {
      question: "Is financing available for these vehicles?",
      answer: "Because these are bank-foreclosed liquidations priced significantly below retail book value, they are typically sold via bank wire transfer, cashier's check, or cash. However, you can secure private financing from your own credit union or local bank using our provided Bill of Sale and asset validation package."
    }
  ];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id="faq-section-wrapper" className="space-y-4 max-w-3xl mx-auto">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            id={`faq-item-${index}`}
            className="border border-white/5 bg-[#0f1115] hover:bg-[#12151a] rounded-xl overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
            >
              <span className="font-display font-medium text-white text-base sm:text-lg tracking-tight pr-4 hover:text-gold-200 transition-colors">
                {faq.question}
              </span>
              <span className={`p-2 bg-white/5 rounded-full text-gold-400 transition-transform duration-300 ${isOpen ? 'rotate-90 bg-gold-400/10' : ''}`}>
                <ChevronRight className="w-4 h-4" />
              </span>
            </button>
            
            <div
              className={`transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-80 opacity-100 border-t border-white/5' : 'max-h-0 opacity-0'
              } overflow-hidden`}
            >
              <div className="p-5 text-gray-400 text-sm leading-relaxed font-sans bg-[#0c0d10]">
                {faq.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
