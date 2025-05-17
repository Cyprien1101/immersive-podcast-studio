
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "What types of podcasts can I record in your studios?",
    answer: "Our studios are equipped for all podcast formats, from individual interviews to round tables with multiple guests, solo narrations and video podcasts. We adapt the technical configuration to your specific needs."
  },
  {
    question: "How does a recording session work?",
    answer: "Upon arrival, our sound engineer welcomes you and configures the studio according to your needs. After a short testing period, you can start recording. The engineer remains available throughout the session to assist you and ensure technical quality."
  },
  {
    question: "How much does it cost to rent a studio?",
    answer: "Our rates vary depending on the chosen studio, rental duration, and additional services. Contact us for a personalized quote tailored to your podcast project."
  },
  {
    question: "Do you offer post-production services?",
    answer: "Yes, we offer complete post-production services including editing, mixing, mastering, adding jingles and sound effects, as well as audio cleaning for a professional result."
  },
  {
    question: "How do I book a slot in your studios?",
    answer: "You can book directly online via our reservation system, by phone, or by email. We recommend booking at least one week in advance to ensure availability."
  },
  {
    question: "Do you provide equipment for remote recordings?",
    answer: "Yes, we offer rental of portable recording kits for your remote sessions, as well as technical solutions to connect remote guests to your studio session."
  },
];

const FaqSection = () => {
  return (
    <section className="py-20 bg-black">
      <div className="container px-4 mx-auto">
        <h2 className="mb-12 text-center text-4xl font-bold">
          <span className="text-gradient">Frequently Asked Questions</span>
        </h2>
        
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium text-podcast-light">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
