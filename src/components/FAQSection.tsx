import React, { useState } from "react";
import { FAQBadge } from "./badges";
import { Plus, Minus } from "lucide-react";

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Is UniNav really free?",
      answer: "Yes, UniNav is completely free to use. We believe that quality educational resources should be accessible to all students without any cost barriers."
    },
    {
      question: "What kinds of files can I upload?",
      answer: "You can upload various study materials including PDFs, Word documents, PowerPoint presentations, images, and more. We support most common file formats used for academic content."
    },
    {
      question: "How do I find materials for my specific courses?",
      answer: "Use our smart search feature to find materials by course code, course name, or specific topics. You can also browse by department or course category."
    },
    {
      question: "The WhatsApp bot isn't responding—what do I do?",
      answer: "If the WhatsApp bot isn't responding, please check your internet connection first. If the issue persists, contact our support team and we'll help you get it working."
    },
    {
      question: "Can I use UniNav offline?",
      answer: "While the main platform requires an internet connection, you can download materials when online to access them offline later. The WhatsApp bot also works with basic internet connectivity."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white">
      <div className="container mx-auto max-w-4xl px-4 md:px-6 text-center py-16 md:py-20">
        <FAQBadge text="FAQs" className="mb-8" />
        
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-6 text-foreground">
          Frequently Asked Questions
        </h2>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-16">
          Quick answers to what you're wondering
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors duration-200"
              onClick={() => toggleFAQ(index)}
            >
              <div className="flex items-center justify-between p-6">
                <h3 className="text-lg font-medium text-foreground text-left pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <Minus size={20} className="text-foreground" />
                  ) : (
                    <Plus size={20} className="text-foreground" />
                  )}
                </div>
              </div>
              
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-muted-foreground text-left leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
