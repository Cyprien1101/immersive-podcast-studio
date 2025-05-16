
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Quels types de podcasts puis-je enregistrer dans vos studios ?",
    answer: "Nos studios sont équipés pour tous les formats de podcasts, des entretiens individuels aux tables rondes avec plusieurs invités, en passant par les narrations solo et les podcasts vidéo. Nous adaptons la configuration technique à vos besoins spécifiques."
  },
  {
    question: "Comment se déroule une session d'enregistrement ?",
    answer: "À votre arrivée, notre ingénieur du son vous accueille et configure le studio selon vos besoins. Après une courte période de tests, vous pouvez commencer l'enregistrement. L'ingénieur reste disponible tout au long de la session pour vous assister et s'assurer de la qualité technique."
  },
  {
    question: "Combien coûte la location d'un studio ?",
    answer: "Nos tarifs varient en fonction du studio choisi, de la durée de location et des services additionnels. Contactez-nous pour obtenir un devis personnalisé adapté à votre projet de podcast."
  },
  {
    question: "Proposez-vous des services de post-production ?",
    answer: "Oui, nous offrons des services complets de post-production incluant le montage, le mixage, le mastering, l'ajout de jingles et d'effets sonores, ainsi que le nettoyage audio pour un résultat professionnel."
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
    <section className="py-20 bg-podcast-muted">
      <div className="container px-4 mx-auto">
        <h2 className="mb-12 text-center text-4xl font-bold">
          <span className="text-gradient">Questions fréquentes</span>
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
