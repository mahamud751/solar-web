import { Check, Factory, HousePlug, Lamp, SunMedium, Wrench } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import PageCta from "@/components/PageCta";
import Link from "next/link";

export const metadata = {
  title: "Solar Street Lights | Nirvana Power Tech Bangladesh",
  description: "Filatec, MODI and Nirvana solar street lights for lanes, roads, markets, factories and tea gardens.",
};

const systems = [
  {
    icon: HousePlug,
    title: "Lane & home",
    range: "10–100W",
    text: "Homes, mosques and narrow lanes. Smaller lights that charge by day and stay on from dusk.",
    items: ["10W to 100W lights", "Complete sets from ৳6,500", "Pole and fittings on packaged models"],
  },
  {
    icon: Lamp,
    title: "Road & market",
    range: "150–300W",
    text: "Roads, markets and open yards. Filatec 200W and 300W complete packages have published prices.",
    items: ["200W complete ৳8,500", "300W complete ৳11,000", "Remote on published Filatec sets"],
  },
  {
    icon: Factory,
    title: "Yard, garden & CCTV",
    range: "200–400W",
    text: "Factories, tea gardens and camera areas that need a brighter street light.",
    items: ["Up to 400W Filatec", "Installation can be arranged", "Call for sizes without a listed price"],
  },
  {
    icon: SunMedium,
    title: "MODI & Nirvana",
    range: "30–300W",
    text: "MODI dusk-to-dawn lights and Nirvana sets, including the basic 30W package.",
    items: ["MODI 150W, 200W and 300W", "Nirvana 30W and 200W", "Quoted on call"],
  },
  {
    icon: Wrench,
    title: "Supply or install",
    range: "Nationwide",
    text: "Order the set and fit it yourself, or ask the Sylhet team to install.",
    items: ["Delivery in 64 districts", "Delivery ৳300, free from ৳15,000", "Showroom at Jail Road, Sylhet"],
  },
];

export default function Solutions() {
  return (
    <>
      <SiteHeader />
      <main className="inner">
        <section className="pageHero">
          <span>STREET LIGHTS</span>
          <h1>
            One light.
            <br />
            <em>The whole road.</em>
          </h1>
          <p>Solar street lights only. Pick the watt for the lane, road, market, factory or garden, then we send the set from Sylhet.</p>
        </section>
        <section className="systemGrid">
          {systems.map(({ icon: Icon, ...s }, i) => (
            <article key={s.title}>
              <div className="systemIcon">
                <Icon />
              </div>
              <small>
                0{i + 1} · {s.range}
              </small>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
              <ul>
                {s.items.map((x) => (
                  <li key={x}>
                    <Check />
                    {x}
                  </li>
                ))}
              </ul>
              <Link href="/products">See the lights →</Link>
            </article>
          ))}
        </section>
        <PageCta />
      </main>
      <SiteFooter />
    </>
  );
}
