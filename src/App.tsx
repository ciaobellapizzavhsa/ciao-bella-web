import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SiWhatsapp, SiFacebook, SiInstagram } from "react-icons/si";
import { MapPin, Clock, Mail, Phone, X, Plus, Minus, ShoppingCart, ChevronRight, Trash2 } from "lucide-react";

const heroImg = `${import.meta.env.BASE_URL}images/slice-action.jpg`;

const margheritaImg = `${import.meta.env.BASE_URL}images/pizza-margherita2.png`;
const canadianImg = `${import.meta.env.BASE_URL}images/pizza-hawaiian.jpg`;
const duoDelMareImg = `${import.meta.env.BASE_URL}images/pizza-duo.jpg`;

const pastorImg = `${import.meta.env.BASE_URL}images/pizza-pastor2.png`;
const sirloinImg = `${import.meta.env.BASE_URL}images/pizza-sirloin.jpg`;
const mexicanaImg = `${import.meta.env.BASE_URL}images/pizza-mexicana2.png`;
const logoPng = `${import.meta.env.BASE_URL}images/extra/ciao_bella_logo_nobg.png`;

/* ─── Types ──────────────────────────────────────────────── */
interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

type ModalKind =
  | { type: "clasica" }
  | { type: "regular"; name: string; price: number; img: string; accent?: "green" | "red" };

/* ─── Constants ──────────────────────────────────────────── */
const WA_NUMBER = "529933733885";
const CLASICAS_INGREDIENTS = ["Pepperoni", "Jamón", "Aceitunas Negras", "Tocino", "Chorizo", "Pimientos"];
const CLASICA_BASE_PRICE = 135;
const EXTRA_PRICE = 25;

const WHATSAPP_BROWSE =
  "https://wa.me/" + WA_NUMBER + "?text=Hola%2C%20quiero%20ver%20el%20men%C3%BA%20%F0%9F%8D%95";

function buildOrderLink(cart: CartItem[]): string {
  const lines = cart
    .map((item) => `• ${item.qty > 1 ? `${item.qty}x ` : ""}${item.name} ($${item.price * item.qty} MXN)`)
    .join("\n");
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const text = `Hola, quiero pedir:\n\n${lines}\n\nTotal: $${total} MXN 🍕`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

/* ─── Responsive hook ────────────────────────────────────── */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

/* ─── Motion presets ─────────────────────────────────────── */
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

/* ═══════════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modal, setModal] = useState<ModalKind | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  /* Cart helpers */
  const addToCart = useCallback((item: Omit<CartItem, "qty">) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
    setModal(null);
    setCartOpen(true);
    setTimeout(() => setCartOpen(false), 3000);
  }, []);

  const addMultipleToCart = useCallback((item: Omit<CartItem, "qty">, qty: number) => {
    if (qty <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...item, qty }];
    });
    setModal(null);
    setCartOpen(true);
    setTimeout(() => setCartOpen(false), 3000);
  }, []);

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((i) => i.id !== id));

  const adjustQty = (id: string, delta: number) =>
    setCart((prev) =>
      prev.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    );

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const hasItems = cart.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* ─── HEADER ─────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/90 backdrop-blur-md border-b border-border/50 py-3" : "bg-transparent py-5"}`}>
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          <button onClick={() => scrollTo("hero")} aria-label="Inicio">
            <img src={logoPng} alt="Ciao Bella" className="h-11 w-auto object-contain" />
          </button>
          <nav className="hidden md:flex gap-8 items-center text-sm font-medium tracking-wide">
            <button onClick={() => scrollTo("menu")} className="hover:text-primary transition-colors">Menú</button>
            <button onClick={() => scrollTo("nosotros")} className="hover:text-primary transition-colors">Nosotros</button>
            <button onClick={() => scrollTo("contacto")} className="hover:text-primary transition-colors">Contacto</button>
          </nav>
          <a href={hasItems ? buildOrderLink(cart) : WHATSAPP_BROWSE} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full font-medium transition-all box-glow">
            <SiWhatsapp className="w-4 h-4" />
            <span className="hidden sm:inline">{hasItems ? `Pedir (${cartCount})` : "Pedir"}</span>
          </a>
        </div>
      </header>

      {/* ─── HERO ───────────────────────────────────────────────── */}
      <section id="hero" className="relative min-h-[100dvh] flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40 z-10" />
          <img src={heroImg} alt="Pizza artesanal" className="w-full h-full object-cover object-center opacity-50" />
        </div>
        <div className="container relative z-20 mx-auto px-4 md:px-8">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-2xl">
            <motion.div variants={fadeIn} className="mb-8">
              <img src={logoPng} alt="Ciao Bella" className="h-28 w-auto object-contain" />
            </motion.div>
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-serif font-bold text-white leading-[1.05] mb-6 uppercase tracking-tight">
              Hecha con amor.<br />
              <span className="text-primary text-glow">Servida con ganas.</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="text-lg md:text-xl text-white font-light">
              Pizza artesanal que sí se antoja 🍕
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ─── MENU ───────────────────────────────────────────────── */}
      <section id="menu" className="py-24 bg-background relative z-10">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Nuestro Menú</h2>
            <div className="w-20 h-0.5 bg-primary mx-auto rounded-full opacity-60" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

            {/* Clásicas */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="lg:col-span-12">
              <div className="bg-card border border-border rounded-3xl p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/50 pb-8 mb-8">
                  <div>
                    <h3 className="text-3xl font-serif font-bold text-primary mb-3">Clásicas</h3>
                    <p className="text-white text-lg max-w-2xl">Masa de larga fermentación, passata de tomate de la casa, queso mozzarella y un ingrediente.</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="price-label text-3xl font-medium text-white whitespace-nowrap">$135 MXN</div>
                    <button
                      onClick={() => setModal({ type: "clasica" })}
                      className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full font-medium transition-all box-glow text-sm"
                    >
                      <Plus className="w-4 h-4" /> Armar mi clásica
                    </button>
                  </div>
                </div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">Ingredientes a elegir</h4>
                    <div className="flex flex-wrap gap-2">
                      {CLASICAS_INGREDIENTS.map(ing => (
                        <span key={ing} className="px-4 py-2 bg-background border border-border rounded-full text-sm text-white">{ing}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">Ingrediente Extra</h4>
                    <div className="text-xl font-serif text-primary">
                      +$25 <span className="text-base font-sans text-white/60 font-normal">MXN</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Especialidades de la Casa */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="lg:col-span-6 space-y-8">
              <div className="mb-10">
                <h3 className="text-2xl font-serif font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-6 h-[2px] bg-primary rounded-full shrink-0" />
                  Especialidades de la Casa
                </h3>
                <p className="text-white/75 text-sm">La misma base que las clásicas pero con ingredientes pensados delicadamente para elevar la experiencia de comer pizza.</p>
              </div>
              <MenuItem name="Margherita" price={150} desc="La firma de la casa; tomate fresco, aceite de oliva y albahaca italiana cultivada por nosotros mismos." img={margheritaImg} onOrder={() => setModal({ type: "regular", name: "Margherita", price: 150, img: margheritaImg })} />
              <MenuItem name="Canadian" price={165} desc="Nuestra versión de la pizza hawaiana; tocino, jamón, piña y un toque de miel de maple." img={canadianImg} onOrder={() => setModal({ type: "regular", name: "Canadian", price: 165, img: canadianImg })} />
              <MenuItem name="Duo del Mare" price={225} desc="Rico camarón y pulpo salteado al momento con ajo y mantequilla, aceite de oliva y cilantro fresco." img={duoDelMareImg} onOrder={() => setModal({ type: "regular", name: "Duo del Mare", price: 225, img: duoDelMareImg })} />
            </motion.div>

            {/* Especialidades Mexicanas */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="lg:col-span-6 space-y-8 mt-12 lg:mt-0">
              <div className="mb-10">
                <h3 className="text-2xl font-serif font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-6 h-[2px] bg-[#8b1a1a] rounded-full shrink-0" />
                  Especialidades Mexicanas
                </h3>
                <p className="text-white/75 text-sm">La misma base que las clásicas pero esta vez haciendo homenaje a lo que tanto nos gusta como mexicanos; los tacos y algo más.</p>
              </div>
              <MenuItem name="Pastor" price={185} desc="Deliciosa carne de cerdo bien marinada, tal y como en las taquerías." img={pastorImg} accent="red" onOrder={() => setModal({ type: "regular", name: "Pastor", price: 185, img: pastorImg, accent: "red" })} />
              <MenuItem name="Sirloin" price={230} desc="Sin tantas explicaciones; carne jugosa de sirloin con un sabor de otro nivel, una de las más pedidas." img={sirloinImg} accent="red" onOrder={() => setModal({ type: "regular", name: "Sirloin", price: 230, img: sirloinImg, accent: "red" })} />
              <MenuItem name="Mexicana" price={165} desc="Una rica combinación de longaniza casera, pimientos, cebolla morada y cilantro; puede ir o no con chile serrano, tú decides." img={mexicanaImg} accent="red" onOrder={() => setModal({ type: "regular", name: "Mexicana", price: 165, img: mexicanaImg, accent: "red" })} />
            </motion.div>
          </div>

          <div className="mt-16 text-center">
            <button onClick={() => setModal({ type: "clasica" })}
              className="inline-flex items-center justify-center gap-2 border border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-full text-base font-medium transition-all">
              Armar mi pizza <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── CONVERSION BLOCK ───────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #000000 0%, #0d0000 50%, #1a0000 100%)" }}>
        {/* Animated marquee background */}
        <div className="absolute inset-0 flex flex-col justify-center gap-10 overflow-hidden pointer-events-none select-none" aria-hidden="true">
          {[0, 1, 2].map((row) => (
            <div key={row} className={`marquee-track flex gap-16 whitespace-nowrap ${row === 1 ? "marquee-reverse" : ""}`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="text-6xl md:text-8xl font-serif font-bold uppercase tracking-widest shrink-0" style={{ color: "rgba(255,255,255,0.07)" }}>
                  Ciao Bella&nbsp;&nbsp;·&nbsp;&nbsp;Ordena por WhatsApp
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[130px] pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(139,26,26,0.25) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(34,110,60,0.12) 0%, transparent 70%)" }} />

        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="container mx-auto px-4 md:px-8 text-center relative z-10"
        >
          <motion.div variants={fadeIn} className="inline-block mb-6 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase">
            Jueves a Sábado · 5 PM – 11 PM
          </motion.div>

          <motion.h2 variants={fadeIn} className="text-5xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
            ¿Ya te dio hambre?
          </motion.h2>

          <motion.p variants={fadeIn} className="text-lg md:text-xl text-white max-w-xl mx-auto mb-4 font-light leading-relaxed">
            Escríbenos directo por WhatsApp y en minutos tu pizza está en camino.
          </motion.p>

          <motion.p variants={fadeIn} className="text-sm text-white/60 italic mb-12 tracking-wide">
            Sin apps. Sin intermediarios. Directo al antojo.
          </motion.p>

          {hasItems ? (
            <motion.div variants={fadeIn} className="flex flex-col items-center gap-3">
              <a
                href={buildOrderLink(cart)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-4 bg-primary hover:bg-primary/90 text-white px-12 py-6 rounded-full text-2xl font-bold transition-all transform hover:scale-105 box-glow shadow-2xl"
              >
                <SiWhatsapp className="w-7 h-7" />
                Finalizar pedido 🍕
              </a>
              <span className="text-white/50 text-sm">{cartCount} {cartCount === 1 ? "pizza" : "pizzas"} · ${cartTotal} MXN</span>
            </motion.div>
          ) : (
            <motion.div variants={fadeIn}>
              <button
                onClick={() => scrollTo("menu")}
                className="inline-flex items-center justify-center gap-4 bg-primary hover:bg-primary/90 text-white px-12 py-6 rounded-full text-2xl font-bold transition-all transform hover:scale-105 box-glow shadow-2xl"
              >
                Ver menú 🍕
              </button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ─── NOSOTROS ───────────────────────────────────────────── */}
      <section id="nosotros" className="py-24 relative bg-black">
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-8 leading-tight">
                Tradición italiana con <br />
                <span className="text-primary text-glow italic">alma mexicana</span>
              </h2>
              <div className="space-y-4 mb-12">
                {[
                  { icon: "🍕", text: "Pizza napolitana artesanal" },
                  { icon: "🔥", text: "Masa de fermentación larga, ligera y digestiva" },
                  { icon: "📍", text: "Dark kitchen" },
                  { icon: "🫰🏻", text: "Eventos, pizza del horno a tu mesa" },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-4 text-lg text-white">
                    <span className="text-2xl">{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
              className="bg-card border border-border p-8 md:p-12 rounded-3xl">
              <h3 className="text-2xl font-serif font-bold text-primary mb-8">¿Por qué Ciao Bella?</h3>
              <div className="space-y-6 text-white leading-relaxed">
                <p className="text-xl font-serif font-semibold italic text-white">
                  "Hecha con Amor.<br />Servida con ganas."
                </p>
                <p className="text-white/85 text-sm">
                  No somos cadena, no somos franquicia. Somos una pizza que se hace con dedicación, tiempo, y con ingredientes que valen la pena.
                </p>
                <p className="text-white/85 text-sm">
                  Nuestra masa fermenta 48 horas. Nuestro horno llega a 450°C. Cada pizza sale distinta porque cada pizza es única.
                </p>
                <p className="text-white/85 text-sm">
                  Ciao Bella nació del antojo y de querer hacer las cosas bien. Sin atajos. Sin congelados. Sin pretextos.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────── */}
      <footer id="contacto" className="bg-background pt-24 pb-12 border-t border-border">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

            <div className="md:col-span-5">
              <img src={logoPng} alt="Ciao Bella" className="h-20 w-auto object-contain mb-6" />
              <p className="text-white/75 mb-6 max-w-sm">
                La verdadera pizza napolitana hecha en Villahermosa. Fermentación larga, sabor inigualable.
              </p>
              <div className="flex items-center gap-4 mb-8">
                <a href="https://www.facebook.com/ciaobellapizza.vhsa/" target="_blank" rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-white/60 hover:text-primary hover:border-primary/50 transition-all">
                  <SiFacebook className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/ciaobellapizza.vhsa/" target="_blank" rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-white/60 hover:text-primary hover:border-primary/50 transition-all">
                  <SiInstagram className="w-5 h-5" />
                </a>
                <a href={WHATSAPP_BROWSE} target="_blank" rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-white/60 hover:text-[#25D366] hover:border-[#25D366]/50 transition-all">
                  <SiWhatsapp className="w-5 h-5" />
                </a>
              </div>
              <a href={WHATSAPP_BROWSE} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3 rounded-full font-medium transition-all">
                <SiWhatsapp className="w-5 h-5" />
                Escríbenos por WhatsApp
              </a>
            </div>

            <div className="md:col-span-4">
              <h3 className="text-xl font-serif font-bold text-white mb-6">Contacto</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-white">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Lilas 126 Col. Villa de las Flores,<br />Villahermosa, Tab.</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <span>+52 993 373 3885</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <span>ciaobellapizza.vhsa@gmail.com</span>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h3 className="text-xl font-serif font-bold text-white mb-6">Horarios</h3>
              <div className="bg-card border border-border p-6 rounded-2xl">
                <div className="flex items-center gap-3 text-primary font-medium mb-2">
                  <Clock className="w-5 h-5" />
                  Jueves a Sábado
                </div>
                <div className="text-white text-lg">5:00 PM a 11:00 PM</div>
              </div>
            </div>

          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
            <p>© {new Date().getFullYear()} Ciao Bella. Todos los derechos reservados.</p>
            <p>Hecho con pasión en Villahermosa.</p>
          </div>
        </div>
      </footer>

      {/* ─── FLOATING WHATSAPP ──────────────────────────────────── */}
      <a href={hasItems ? buildOrderLink(cart) : WHATSAPP_BROWSE} target="_blank" rel="noopener noreferrer"
        className={`fixed bottom-6 right-6 w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-50 hover:bg-[#20bd5a] ${hasItems ? "bottom-28 md:bottom-6" : ""}`}
        aria-label="Contactar por WhatsApp">
        <SiWhatsapp className="w-8 h-8" />
        {hasItems && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-background">
            {cartCount}
          </span>
        )}
        {!hasItems && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#8b1a1a]" />
          </span>
        )}
      </a>

      {/* ─── FLOATING CART BAR ──────────────────────────────────── */}
      <AnimatePresence>
        {hasItems && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-40 md:left-auto md:right-6 md:bottom-6 md:w-96"
          >
            {/* Collapsed bar */}
            {!cartOpen && (
              <button
                onClick={() => setCartOpen(true)}
                className="w-full md:rounded-2xl bg-primary text-white px-6 py-4 flex items-center justify-between shadow-2xl box-glow"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="font-bold">{cartCount} {cartCount === 1 ? "pizza" : "pizzas"}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-lg">${cartTotal} MXN</span>
                  <span className="text-white/75 text-sm">Ver pedido ↑</span>
                </div>
              </button>
            )}

            {/* Expanded drawer */}
            {cartOpen && (
              <div className="w-full md:rounded-2xl bg-card border border-border/50 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-primary px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <ShoppingCart className="w-5 h-5" />
                    Mi pedido ({cartCount})
                  </div>
                  <button onClick={() => setCartOpen(false)} className="text-white/80 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Items */}
                <div className="px-6 py-4 space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.name}</p>
                        <p className="text-white/50 text-xs">${item.price} c/u</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => adjustQty(item.id, -1)} className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:border-primary/50 transition-colors">
                          <Minus className="w-3 h-3 text-white" />
                        </button>
                        <span className="text-white font-bold w-5 text-center text-sm">{item.qty}</span>
                        <button onClick={() => adjustQty(item.id, 1)} className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:border-primary/50 transition-colors">
                          <Plus className="w-3 h-3 text-white" />
                        </button>
                        <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:border-[#8b1a1a]/60 transition-colors ml-1">
                          <Trash2 className="w-3 h-3 text-white/50" />
                        </button>
                      </div>
                      <span className="text-primary font-bold text-sm shrink-0 w-20 text-right">${item.price * item.qty} MXN</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-6 pb-5 pt-3 border-t border-border/50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white/70 text-sm">Total</span>
                    <span className="text-white font-bold text-xl">${cartTotal} MXN</span>
                  </div>
                  <a
                    href={buildOrderLink(cart)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-lg transition-all box-glow"
                  >
                    <SiWhatsapp className="w-5 h-5" />
                    Finalizar pedido 🍕
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MODALS (via portal → flex overlay always above everything) ── */}
      {modal && createPortal(
        <AnimatePresence>
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setModal(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 1000,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "1rem",
              background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)",
            }}
          >
            {/* Stop click from bubbling to overlay */}
            <div onClick={(e) => e.stopPropagation()} style={{ zIndex: 1100, width: "100%", display: "flex", justifyContent: "center" }}>
              {modal.type === "clasica" ? (
                <ClasicaModal
                  onClose={() => setModal(null)}
                  onAdd={(name, price, qty) => addMultipleToCart({ id: name, name, price }, qty)}
                />
              ) : (
                <RegularModal
                  name={modal.name}
                  price={modal.price}
                  img={modal.img}
                  accent={modal.accent}
                  onClose={() => setModal(null)}
                  onAdd={(qty) => addMultipleToCart({ id: modal.name, name: `Pizza ${modal.name}`, price: modal.price }, qty)}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CLÁSICA MODAL
═══════════════════════════════════════════════════════════ */
function ClasicaModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (name: string, price: number, qty: number) => void;
}) {
  const [base, setBase] = useState<string | null>(null);
  const [extras, setExtras] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  const toggleExtra = (ing: string) => {
    setExtras((prev) =>
      prev.includes(ing) ? prev.filter((e) => e !== ing) : [...prev, ing]
    );
  };

  const price = CLASICA_BASE_PRICE + extras.length * EXTRA_PRICE;
  const cartName = base
    ? `Pizza Clásica (${[base, ...extras].join(", ")})`
    : "Pizza Clásica";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      style={{ width: "100%", maxWidth: "500px", maxHeight: "90vh" }}
      className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col"
    >

      {/* Header */}
      <div className="bg-primary px-6 py-5 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-xl font-serif font-bold text-white">Pizza Clásica</h3>
          <p className="text-white/80 text-sm">Arma tu pizza a tu gusto</p>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 px-6 py-6 space-y-7">
        {/* Base ingredient — required */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-white">Ingrediente base</h4>
            <span className="text-xs text-[#a83232] bg-[#8b1a1a]/20 px-2 py-0.5 rounded-full font-medium">Requerido</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CLASICAS_INGREDIENTS.map((ing) => (
              <button
                key={ing}
                onClick={() => setBase(ing)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  base === ing
                    ? "bg-primary border-primary text-white box-glow"
                    : "bg-background border-border text-white/80 hover:border-primary/50"
                }`}
              >
                {ing}
              </button>
            ))}
          </div>
        </div>

        {/* Extra ingredients — optional */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-white">¿Ingrediente(s) extra?</h4>
            <span className="price-label text-xs text-primary font-medium">+$25 MXN c/u</span>
          </div>
          <p className="text-white/50 text-xs mb-3">Selecciona uno o más (opcional)</p>
          <div className="flex flex-wrap gap-2">
            {CLASICAS_INGREDIENTS.map((ing) => (
              <button
                key={ing}
                onClick={() => toggleExtra(ing)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  extras.includes(ing)
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-background border-border text-white/60 hover:border-primary/40"
                }`}
              >
                {extras.includes(ing) ? "✓ " : ""}{ing}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white">Cantidad</h4>
          <div className="flex items-center gap-4">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center hover:border-primary/60 transition-colors">
              <Minus className="w-4 h-4 text-white" />
            </button>
            <span className="text-white font-bold text-lg w-6 text-center">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center hover:border-primary/60 transition-colors">
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 pt-4 border-t border-border/50 shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-white/50 text-xs">{cartName}</p>
            <p className="price-label text-white/60 text-sm">
              $135{extras.length > 0 ? ` + $${extras.length * 25} extra` : ""} × {qty}
            </p>
          </div>
          <p className="price-label text-primary font-bold text-2xl">${price * qty} MXN</p>
        </div>
        <button
          disabled={!base}
          onClick={() => onAdd(cartName, price, qty)}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
            base
              ? "bg-primary hover:bg-primary/90 text-white box-glow"
              : "bg-border text-white/30 cursor-not-allowed"
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {base ? "Agregar al pedido" : "Selecciona un ingrediente"}
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   REGULAR PIZZA MODAL
═══════════════════════════════════════════════════════════ */
function RegularModal({ name, price, img, accent = "green", onClose, onAdd }: {
  name: string;
  price: number;
  img: string;
  accent?: "green" | "red";
  onClose: () => void;
  onAdd: (qty: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const accentColor = accent === "red" ? "bg-[#8b1a1a]" : "bg-primary";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      style={{ width: "100%", maxWidth: "420px", maxHeight: "90vh", overflowY: "auto" }}
      className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
    >

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img src={img} alt={name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className={`price-label absolute bottom-4 left-4 px-3 py-1 rounded-full ${accentColor} text-white text-sm font-bold`}>
          ${price} MXN
        </div>
      </div>

      <div className="px-6 py-5">
        <h3 className="text-2xl font-serif font-bold text-white mb-2">Pizza {name}</h3>

        {/* Quantity */}
        <div className="flex items-center justify-between my-5">
          <span className="text-white/70">Cantidad</span>
          <div className="flex items-center gap-5">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:border-primary/60 transition-colors">
              <Minus className="w-4 h-4 text-white" />
            </button>
            <span className="text-white font-bold text-xl w-6 text-center">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:border-primary/60 transition-colors">
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="price-label text-white/50 text-sm">${price} × {qty}</span>
          <span className="price-label text-primary font-bold text-2xl">${price * qty} MXN</span>
        </div>

        <button
          onClick={() => onAdd(qty)}
          className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 box-glow mb-2"
        >
          <ShoppingCart className="w-5 h-5" />
          Agregar al pedido
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MENU ITEM COMPONENT
═══════════════════════════════════════════════════════════ */
function MenuItem({ name, price, desc, img, accent = "green", onOrder }: {
  name: string;
  price: number;
  desc: string;
  img: string;
  accent?: "green" | "red";
  onOrder: () => void;
}) {
  const borderColor = accent === "red"
    ? "border-[#8b1a1a]/30 group-hover:border-[#8b1a1a]/70"
    : "border-primary/20 group-hover:border-primary/60";
  const priceColor = accent === "red" ? "text-[#a83232]" : "text-primary";

  return (
    <motion.div
      variants={fadeIn}
      onClick={onOrder}
      className="group flex flex-col sm:flex-row gap-6 items-center sm:items-start p-4 rounded-2xl hover:bg-card/50 transition-all border border-transparent hover:border-border/50 cursor-pointer"
    >
      <div className={`w-32 h-32 shrink-0 rounded-full overflow-hidden border-2 ${borderColor} transition-all relative`}>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
        <img src={img} alt={`Pizza ${name}`} className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700" />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-baseline gap-2 mb-2">
          <h4 className="text-xl font-bold font-serif text-white group-hover:text-primary transition-colors">{name}</h4>
          <span className={`price-label text-xl font-medium ${priceColor}`}>${price}</span>
        </div>
        <p className="text-white/80 text-sm leading-relaxed mb-3">{desc}</p>
        <span className="inline-flex items-center gap-1.5 text-xs text-white/40 group-hover:text-primary/70 transition-colors font-medium">
          <Plus className="w-3 h-3" /> Agregar al pedido
        </span>
      </div>
    </motion.div>
  );
}
