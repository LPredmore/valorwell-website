import { AuthorityPage } from "@/components/authority/AuthorityPage";

export default function FamilySystems() {
  return (
    <AuthorityPage
      title="Family Systems Support | Systems Over Reactions"
      description="ValorWell teaches families how to build better systems for communication, emotional regulation, conflict, parenting, and decision-making."
      canonical="/family-systems"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Family Systems", url: "/family-systems" },
      ]}
      eyebrow="Family Systems"
      h1="Families do better with systems, not constant reactions."
      subhead="ValorWell helps families move from reacting to each situation individually toward building repeatable ways to think, communicate, and solve problems."
      heroCTAs={[
        { label: "Find Family Care", to: "/get-care" },
        { label: "Explore Family Resources", to: "/resources", variant: "secondary" },
      ]}
      sections={[
        {
          heading: "The problem with reactive parenting and family conflict",
          body: "Families often try to solve each situation separately. That can lead to inconsistency, emotional reasoning, power struggles, and unclear expectations. Everyone ends up exhausted, and the same problems keep returning in slightly different forms.",
        },
        {
          heading: "The systems approach",
          body: "Instead of only telling people what to do in one moment, families can build shared frameworks that help everyone reason through the next similar situation with less confusion.",
          bullets: [
            "What principle applies here?",
            "How would this feel from the other side?",
            "What rule would be fair if everyone followed it?",
            "What outcome does this actually create?",
            "What system should we use next time this comes up?",
          ],
        },
        {
          heading: "Practical family systems",
          cards: [
            { title: "Communication systems" },
            { title: "Conflict repair systems" },
            { title: "Emotional regulation systems" },
            { title: "Screen-time systems" },
            { title: "Responsibility systems" },
            { title: "Family meeting systems" },
            { title: "Decision-making systems" },
            { title: "Accountability systems" },
          ],
        },
        {
          heading: "Consistency at home",
          body: "Families build trust when expectations are understandable, repeatable, and not rewritten in the heat of the moment. A useful system should make the next decision clearer without pretending every family or every situation is identical.",
        },
        {
          heading: "Education and therapy are different tools",
          body: "Family frameworks can help people practice communication, regulation, and problem-solving between difficult moments. They are not a substitute for individual clinical assessment or therapy when a family member needs clinical care.",
        },
      ]}
      faqs={[
        {
          question: "What is a family systems approach?",
          answer:
            "Instead of treating each situation in isolation, a systems approach builds shared rules, frameworks, and habits that the family can use again and again.",
        },
        {
          question: "How is this different from just giving kids rules?",
          answer:
            "Rules tell people what to do in a defined situation. Systems also help people reason through new situations by applying shared principles and expectations.",
        },
        {
          question: "Can this help with teen conflict?",
          answer:
            "Clear, repeatable expectations can reduce some avoidable conflict, but educational frameworks are not a diagnosis or a substitute for therapy when clinical support is needed.",
        },
        {
          question: "How does emotional reasoning affect families?",
          answer:
            "When every decision is made only from how someone feels in the moment, expectations can become inconsistent. A shared framework can help the family consider feelings without making them the only decision rule.",
        },
        {
          question: "Is this therapy?",
          answer:
            "No. This page describes an educational framework. For clinical needs, use Find Care or the Military Family Therapy page.",
        },
      ]}
      related={[
        { name: "Military Family Therapy", href: "/military-family-therapy", body: "Clinical support for military-connected families when an appropriate care path is available." },
        { name: "Veteran Mental Health Resources", href: "/resources/veteran-mental-health", body: "Supporting a Veteran who is struggling, and what to do when a provider isn't a fit." },
        { name: "Find Care", href: "/get-care", body: "See the current ValorWell care pathways for veterans and veteran family members." },
      ]}
      finalCTAs={[
        { label: "Find Family Support", to: "/get-care" },
        { label: "Explore Family Resources", to: "/resources", variant: "secondary" },
      ]}
    />
  );
}
