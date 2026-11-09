"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BatteryCharging,
  Building2,
  Check,
  ChevronDown,
  Factory,
  HousePlug,
  Leaf,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import { AccountMenu } from "@/components/AccountMenu";
import { addToCart } from "@/app/actions/cart";
import { DISTRICTS, formatBdt, FREE_SHIPPING_FROM, SHIPPING_FEE } from "@/lib/constants";

export type HomeProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  power: string;
  image: string;
  priceText: string;
  canBuy: boolean;
};
const lights = [
  { name: "Filatec 100W complete", price: 6500 },
  { name: "Filatec 200W complete", price: 8500 },
  { name: "Filatec 300W complete", price: 11000 },
];
const solutions = [
  {
    icon: HousePlug,
    bn: "গলি ও বাড়ি",
    title: "Lane & home",
    text: "বাড়ি, মসজিদ ও সরু রাস্তার জন্য ছোট সোলার স্ট্রিট লাইট। দিনে চার্জ, সন্ধ্যা থেকে ভোর আলো।",
    size: "10–100W",
  },
  {
    icon: Building2,
    bn: "রাস্তা ও মার্কেট",
    title: "Road & market",
    text: "রাস্তা, বাজার ও খোলা জায়গার জন্য পোলসহ কমপ্লিট সেট। লাইট, প্যানেল, ব্যাটারি ও ফিটিংস একসাথে।",
    size: "150–300W",
  },
  {
    icon: Factory,
    bn: "কারখানা ও বাগান",
    title: "Yard & garden",
    text: "কারখানা, চা-বাগান ও CCTV এরিয়ার জন্য বেশি ওয়াটের স্ট্রিট লাইট। ইনস্টলেশন আলাদা করে বলা যায়।",
    size: "200–400W",
  },
];
const steps = [
  ["01", "Choose the light", "ওয়াট ও ব্র্যান্ড বাছুন—Filatec, MODI, অথবা Nirvana।"],
  ["02", "Confirm the set", "পোলের উচ্চতা, আর্ম ও কয়টি লাইট লাগবে, সেটা ঠিক করি।"],
  ["03", "We deliver", "Jail Road, Sylhet থেকে সারা বাংলাদেশে পাঠানো হয়।"],
  ["04", "Install", "নিজে লাগান, অথবা আমাদের টিমকে বলুন।"],
];
const faqs = [
  [
    "এই লাইটে গ্রিডের বিদ্যুৎ লাগে?",
    "না। সেটের নিজের প্যানেল দিনে চার্জ হয়, রাতে ব্যাটারি থেকে আলো জ্বলে। মাসিক বিদ্যুৎ বিল নেই।",
  ],
  [
    "কমপ্লিট সেটে কী কী থাকে?",
    "প্রকাশিত কমপ্লিট সেটে LED লাইট, সোলার প্যানেল, ব্যাটারি, পোল ও ফিটিংস থাকে। মডেলভেদে রিমোটও থাকে।",
  ],
  [
    "দাম কত?",
    "Filatec 100W কমপ্লিট ৳৬,৫০০, 200W কমপ্লিট ৳৮,৫০০, 300W কমপ্লিট ৳১১,০০০। বাকি মডেলের দাম কলে জানানো হয়।",
  ],
  [
    "ওয়ারেন্টি কতদিন?",
    "অর্ডারের সময় জানিয়ে দেওয়া হয়। এখনকার স্ট্রিট লাইট কাজে শোরুমে ১ বছরের ওয়ারেন্টি বলা আছে।",
  ],
];

export default function HomePage({ products }: { products: HomeProduct[] }) {
  const [menu, setMenu] = useState(false),
    [light, setLight] = useState(0),
    [qty, setQty] = useState(4),
    [faq, setFaq] = useState(0),
    [sent, setSent] = useState(false);
  const chosen = lights[light];
  const total = chosen.price * qty;
  return (
    <main>
      <div className="top">
        <span>সোলার স্ট্রিট লাইট · সারাদেশে ডেলিভারি</span>
        <a href="tel:+8801711064667">
          <Phone />
          +880 1711-064667
        </a>
      </div>
      <header>
        <Link className="brand" href="/">
          <b>
            <img src="/nirvana-mark.jpg" alt="Nirvana Power Tech logo" />
          </b>
          <span>
            NIRVANA<small>POWER TECH</small>
          </span>
        </Link>
        <nav className={menu ? "open" : ""}>
          <Link href="/products">Shop</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/solutions">Street lights</Link>
          <Link href="/about">About</Link>
          <a href="#calculator">Prices</a>
          <AccountMenu onNavigate={() => setMenu(false)} />
          <Link className="navCta" href="/contact">
            Get a free quote <ArrowRight />
          </Link>
        </nav>
        <button className="menu" onClick={() => setMenu(!menu)}>
          {menu ? <X /> : <Menu />}
        </button>
      </header>
      <section className="hero" id="home">
        <Image
          src="/facebook/cctv-lighting.jpg"
          alt="Nirvana solar street light at night"
          fill
          priority
          sizes="100vw"
        />
        <div className="shade" />
        <div className="heroCopy">
          <label>● Solar street lights from Sylhet</label>
          <h1>
            রাস্তার আলো।
            <br />
            <em>বিল ছাড়া।</em>
          </h1>
          <p>
            Filatec, MODI ও Nirvana সোলার স্ট্রিট লাইট। দিনে চার্জ হয়, সন্ধ্যা
            থেকে ভোর পর্যন্ত রাস্তা, বাড়ি ও বাগান আলোকিত থাকে।
          </p>
          <div className="actions">
            <Link className="btn" href="/products">
              Shop street lights <ArrowRight />
            </Link>
            <a href="#process">কীভাবে হয় ↓</a>
          </div>
          <div className="trust">
            <span>
              <ShieldCheck />
              Complete sets with pole
            </span>
            <span>
              <Zap />
              No monthly electric bill
            </span>
            <span>
              <Leaf />
              Delivery in 64 districts
            </span>
          </div>
        </div>
        <aside>
          <small>প্রকাশিত কমপ্লিট সেট</small>
          <strong>
            6,500 <i>৳</i>
          </strong>
          <div className="bars">
            {[40, 62, 100].map((h, i) => (
              <b key={i} style={{ height: h + "%" }} />
            ))}
          </div>
          <small>100W · 200W ৳8,500 · 300W ৳11,000</small>
        </aside>
      </section>
      <section className="proof">
        {[
          ["10–400W", "street light range"],
          ["৳6,500", "100W complete set"],
          ["1 year", "warranty on current work"],
          ["64", "districts we deliver to"],
        ].map((x) => (
          <div key={x[1]}>
            <strong>{x[0]}</strong>
            <span>{x[1]}</span>
          </div>
        ))}
      </section>
      <section className="section solutions" id="solutions">
        <div className="heading">
          <div>
            <label>STREET LIGHTS</label>
            <h2>
              Light for the
              <br />
              <em>road you have.</em>
            </h2>
          </div>
          <p>
            গলি, রাস্তা, মার্কেট, কারখানা বা চা-বাগান—জায়গা অনুযায়ী ওয়াট বাছুন।
            কমপ্লিট সেটে লাইটের সঙ্গে প্যানেল, ব্যাটারি ও পোল থাকে।
          </p>
        </div>
        <div className="cards">
          {solutions.map((s, i) => {
            const Icon = s.icon;
            return (
              <article key={s.title}>
                <div>
                  <span>{s.bn}</span>
                  <Icon />
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <footer>
                  <b>{s.size}</b>
                  <a href="#quote">
                    <ArrowRight />
                  </a>
                </footer>
              </article>
            );
          })}
        </div>
      </section>
      <section className="calculator" id="calculator">
        <div>
          <label>STREET LIGHT PRICE</label>
          <h2>
            কয়টি লাইট,
            <br />
            <em>কত দাম?</em>
          </h2>
          <p>
            যে তিনটি Filatec কমপ্লিট সেটের দাম প্রকাশিত, সেগুলো দিয়ে হিসাব।
            অন্য ওয়াটের দাম কলে জানানো হয়।
          </p>
          <small>
            * ডেলিভারি {formatBdt(SHIPPING_FEE)}। {formatBdt(FREE_SHIPPING_FROM)} থেকে ফ্রি।
          </small>
        </div>
        <div className="calc">
          <label>লাইট বাছুন</label>
          <strong>
            {formatBdt(total)} <small>/ {qty}টি</small>
          </strong>
          <div className="chipRow">
            {lights.map((item, index) => (
              <button key={item.name} type="button" className={light === index ? "active" : ""} onClick={() => setLight(index)}>
                {item.name}
              </button>
            ))}
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={qty}
            onChange={(e) => setQty(+e.target.value)}
            aria-label="Number of lights"
          />
          <div className="range">
            <span>1 light</span>
            <span>20 lights</span>
          </div>
          <div className="results">
            <div>
              <span>Each</span>
              <b>{formatBdt(chosen.price)}</b>
            </div>
            <div>
              <span>Quantity</span>
              <b>{qty}</b>
            </div>
            <div>
              <span>Lights total</span>
              <b>{formatBdt(total)}</b>
            </div>
          </div>
          <Link className="btn dark" href="/products">
            See all street lights <ArrowRight />
          </Link>
        </div>
      </section>
      <section className="section why">
        <div className="visual">
          <Image src="/facebook/filatec-200w.jpg" alt="Filatec 200W solar street light set" fill sizes="50vw" />
          <span>
            <BatteryCharging />
            <small>CHARGES BY DAY</small>
            <b>Lights the road after dusk.</b>
          </span>
        </div>
        <div>
          <label>WHY NIRVANA POWER TECH</label>
          <h2>
            Street lights,
            <br />
            <em>ready to install.</em>
          </h2>
          <p>
            গরম, বৃষ্টি ও ধুলোর জন্য বানানো স্ট্রিট লাইট। Jail Road, Sylhet
            শোরুম থেকে সারাদেশে পাঠানো হয়।
          </p>
          <ul>
            {[
              "Filatec, MODI and Nirvana brands",
              "Complete sets with panel, battery and pole",
              "Dusk-to-dawn lighting",
              "Published prices on 100W, 200W and 300W",
              "Local support from Sylhet",
            ].map((x) => (
              <li key={x}>
                <Check />
                {x}
              </li>
            ))}
          </ul>
          <a href="#quote">
            Talk to an engineer <ArrowRight />
          </a>
        </div>
      </section>
      <section className="projects" id="projects">
        <div className="section">
          <div className="heading light">
            <div>
              <label>SELECTED WORK</label>
              <h2>
                Real products.
                <br />
                <em>Real impact.</em>
              </h2>
            </div>
            <p>
              রাস্তা, বাড়ি, মসজিদ, চা-বাগান—সূর্যের আলোতে চার্জ, রাতে উজ্জ্বল
              আলো।
            </p>
            <Link className="btn" href="/products">
              Shop street lights <ArrowRight />
            </Link>
          </div>
          <div className="homeProducts">
            {products.map((product) => (
              <article key={product.id}>
                <Link href={`/products/${product.slug}`} className="photo" style={{ backgroundImage: `url('${product.image || "/solar-hero.png"}')` }}>
                  <span>{product.power}</span>
                </Link>
                <small>{product.brand}</small>
                <h3>
                  <Link href={`/products/${product.slug}`}>{product.name}</Link>
                </h3>
                <footer>
                  <b>{product.priceText}</b>
                  {product.canBuy ? (
                    <form action={addToCart}>
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="next" value={`/products/${product.slug}`} />
                      <input type="hidden" name="quantity" value="1" />
                      <button>{product.priceText === "Call for price" ? "Add to quote" : "Add to cart"}</button>
                    </form>
                  ) : (
                    <span>Out of stock</span>
                  )}
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section process" id="process">
        <div>
          <label>A SIMPLE PROCESS</label>
          <h2>
            From order to
            <br />
            <em>a lit road.</em>
          </h2>
          <p>কোন ওয়াট লাগবে, কয়টি পোল—সেটা বলে দিলে সেট পাঠিয়ে দিই।</p>
        </div>
        <div className="steps">
          {steps.map((s) => (
            <article key={s[0]}>
              <span>{s[0]}</span>
              <div>
                <h3>{s[1]}</h3>
                <p>{s[2]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="faq section" id="faq">
        <div>
          <label>COMMON QUESTIONS</label>
          <h2>
            জানার আছে?
            <br />
            <em>উত্তর এখানে।</em>
          </h2>
          <p>আরও জানতে WhatsApp-এ লিখুন।</p>
          <a href="https://wa.me/8801711064667">
            <MessageCircle /> WhatsApp us
          </a>
        </div>
        <div className="faqList">
          {faqs.map((x, i) => (
            <article className={faq === i ? "active" : ""} key={x[0]}>
              <button onClick={() => setFaq(faq === i ? -1 : i)}>
                {x[0]}
                <ChevronDown />
              </button>
              <p>{x[1]}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="quote" id="quote">
        <div>
          <label>ASK FOR A STREET LIGHT</label>
          <h2>
            কোন রাস্তায়
            <br />
            <em>লাইট লাগবে?</em>
          </h2>
          <p>ফর্ম পূরণ করুন। এক কর্মদিবসের মধ্যে যোগাযোগ করা হবে।</p>
          <a href="tel:+8801711064667">
            <Phone /> +880 1711-064667
          </a>
          <a href="mailto:nirvanapowertec@gmail.com">
            <Mail /> nirvanapowertec@gmail.com
          </a>
          <span>
            <MapPin /> Jail Road, Sylhet
          </span>
        </div>
        {sent ? (
          <div className="success">
            <Check />
            <h3>ধন্যবাদ!</h3>
            <p>আপনার request পেয়েছি। খুব শিগগিরই যোগাযোগ করা হবে।</p>
            <button onClick={() => setSent(false)}>Send another</button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <label>
              নাম *<input required placeholder="আপনার নাম" />
            </label>
            <label>
              মোবাইল *
              <input
                required
                type="tel"
                pattern="01[3-9][0-9]{8}"
                placeholder="01XXXXXXXXX"
              />
            </label>
            <label>
              জেলা *
              <select required defaultValue="">
                <option value="" disabled>
                  Select district
                </option>
                {DISTRICTS.map((district) => (
                  <option key={district}>{district}</option>
                ))}
              </select>
            </label>
            <label>
              Light
              <select>
                <option>100W street light</option>
                <option>200W street light</option>
                <option>300W street light</option>
                <option>400W street light</option>
                <option>Not sure yet</option>
              </select>
            </label>
            <label className="full">
              কয়টি লাইট
              <input type="number" min={1} placeholder="যেমন: 4" />
            </label>
            <button className="btn full">
              Request a quote <ArrowRight />
            </button>
          </form>
        )}
      </section>
      <footer className="mainFooter">
        <div>
          <Link className="brand" href="/">
            <b>
              <img src="/nirvana-mark.jpg" alt="Nirvana Power Tech logo" />
            </b>
            <span>
              NIRVANA<small>POWER TECH</small>
            </span>
          </Link>
          <p>
            Jail Road, Sylhet থেকে সোলার স্ট্রিট লাইট। রাস্তা, বাড়ি, মসজিদ ও বাগানের জন্য।
          </p>
        </div>
        <div>
          <b>Explore</b>
          <Link href="/products">Shop</Link>
          <Link href="/solutions">Street lights</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/about">About us</Link>
          <Link href="/admin">Admin</Link>
        </div>
        <div>
          <b>Contact</b>
          <a href="tel:+8801711064667">+880 1711-064667</a>
          <a href="mailto:nirvanapowertec@gmail.com">nirvanapowertec@gmail.com</a>
          <Link href="/contact">Request proposal</Link>
          <a href="https://www.facebook.com/nirvanapowertech/" target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
          <span>Jail Road, Sylhet</span>
        </div>
      </footer>
      <div className="copyright">
        © 2026 Nirvana Power Tech <span>Made for a brighter Bangladesh 🇧🇩</span>
      </div>
      <a className="wa" href="https://wa.me/8801711064667">
        <MessageCircle />
      </a>
    </main>
  );
}
