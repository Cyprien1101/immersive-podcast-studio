
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ScrollAnimationWrapper from './ScrollAnimationWrapper';

const faqItems = [
  {
    question: "Est-ce que le studio est climatisé ?",
    answer: "Oui, notre studio dispose d'un système de climatisation pour assurer votre confort tout au long de vos sessions d'enregistrement."
  },
  {
    question: "Est-ce que vous disposez d'un télépromppteur ?",
    answer: "Oui, nous mettons à disposition un télépromppteur pour vous aider lors de vos enregistrements si nécessaire."
  },
  {
    question: "Quels types de podcasts puis-je enregistrer dans vos studios ?",
    answer: "Nos studios sont équipés pour tous les formats de podcast, des interviews individuelles aux tables rondes avec plusieurs invités, narrations solo et podcasts vidéo. Nous adaptons la configuration technique à vos besoins spécifiques."
  },
  {
    question: "Comment se déroule une séance d'enregistrement ?",
    answer: "À votre arrivée, notre opérateur vous accueille et configure le studio selon vos besoins. Après une courte période de test, vous pouvez commencer l'enregistrement. L'opérateur reste disponible tout au long de la séance pour vous assister et garantir la qualité technique."
  },
  {
    question: "Proposez-vous des services de post-production ?",
    answer: "Oui, nous proposons des services complets de post-production comprenant le montage, le mixage, le mastering, l'ajout de jingles et d'effets sonores, ainsi que le nettoyage audio pour un résultat professionnel."
  },
  {
    question: "Comment réserver un créneau dans vos studios ?",
    answer: "Vous pouvez réserver directement en ligne via notre système de réservation, par téléphone ou par email. Nous recommandons de réserver au moins une semaine à l'avance pour garantir la disponibilité."
  },
  {
    question: "Fournissez-vous du matériel pour les enregistrements à distance ?",
    answer: "Oui, nous proposons la location de kits d'enregistrement portables pour vos sessions à distance, ainsi que des solutions techniques pour connecter des invités à distance à votre session en studio."
  },
];

const FaqSection = () => {
  return (
    <section className="py-20 bg-black">
      <div className="container px-4 mx-auto">
        <ScrollAnimationWrapper animation="fade-down">
          <h2 className="mb-12 text-center text-4xl font-bold">
            <span className="text-gradient-hero">Questions Fréquentes</span>
          </h2>
        </ScrollAnimationWrapper>
        
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <ScrollAnimationWrapper 
                key={index} 
                animation="fade-up" 
                delay={index * 100}
              >
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-lg font-medium text-podcast-light">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </ScrollAnimationWrapper>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
