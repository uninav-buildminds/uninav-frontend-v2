import React, { useState } from "react";
import { FAQBadge } from "./badges";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

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
    <section className="bg-white" id="faqs">
      <motion.div
        className="container mx-auto max-w-4xl px-4 md:px-6 text-center py-12 sm:py-16 md:py-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -20% 0px" }}
      >
        <motion.div variants={itemVariants}>
          <FAQBadge text="FAQs" className="mb-6 sm:mb-8" />
        </motion.div>
        
        <motion.h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 sm:mb-6 text-foreground" variants={itemVariants}>
          Frequently Asked Questions
        </motion.h2>
        
        <motion.p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 sm:mb-16 px-2 sm:px-0" variants={itemVariants}>
          Quick answers to what you're wondering
        </motion.p>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors duration-200"
              onClick={() => toggleFAQ(index)}
              variants={itemVariants}
            >
              <div className="flex items-center justify-between p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-medium text-foreground text-left pr-4">
                  {faq.question}
                </h3>
                <motion.div
                  className="flex-shrink-0"
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {openIndex === index ? (
                    <Minus size={18} className="text-foreground sm:w-5 sm:h-5" />
                  ) : (
                    <Plus size={18} className="text-foreground sm:w-5 sm:h-5" />
                  )}
                </motion.div>
              </div>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <div className="border-t border-gray-200 pt-3 sm:pt-4">
                        <p className="text-sm sm:text-base text-muted-foreground text-left leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default FAQSection;
