"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
const images = [
    { src: "/images/1.jpg", alt: "Gallery image 1" },
    { src: "/images/2.jpg", alt: "Gallery image 2" },
    { src: "/images/3.jpg", alt: "Gallery image 3" },
    { src: "/images/4.jpg", alt: "Gallery image 4" },
    { src: "/images/5.jpg", alt: "Gallery image 5" },
    { src: "/images/6.jpg", alt: "Gallery image 6" },
];
export function GallerySection() {
    const t = useTranslations("landing.gallery");
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    return (<section id="gallery" className="py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </motion.div>

        
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((idx) => (<motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }} viewport={{ once: true }} whileHover={{ y: -8 }} onHoverStart={() => setHoveredIndex(idx)} onHoverEnd={() => setHoveredIndex(null)} className="group relative overflow-hidden rounded-2xl shadow-lg cursor-default">
                <div className="relative h-[280px] md:h-[320px] w-full">
                  <Image src={images[idx].src} alt={images[idx].alt} fill className="object-cover transition-transform duration-700 group-hover:scale-110" priority={idx === 0}/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                  
             

                  
                  <div className="absolute bottom-4 right-4 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
                    0{idx + 1}
                  </div>
                </div>
              </motion.div>))}
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[3, 4].map((idx) => (<motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: (idx - 2) * 0.1 }} viewport={{ once: true }} whileHover={{ y: -8 }} onHoverStart={() => setHoveredIndex(idx)} onHoverEnd={() => setHoveredIndex(null)} className="group relative overflow-hidden rounded-2xl shadow-lg cursor-default">
                <div className="relative h-[280px] md:h-[380px] w-full">
                  <Image src={images[idx].src} alt={images[idx].alt} fill className="object-cover transition-transform duration-700 group-hover:scale-110"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                  
   

                  
                  <div className="absolute bottom-4 right-4 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
                    0{idx + 1}
                  </div>
                </div>
              </motion.div>))}
          </div>

          
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} viewport={{ once: true }} whileHover={{ y: -8 }} onHoverStart={() => setHoveredIndex(5)} onHoverEnd={() => setHoveredIndex(null)} className="group relative overflow-hidden rounded-2xl shadow-lg max-w-4xl mx-auto cursor-default">
            <div className="relative h-[320px] md:h-[450px] w-full">
              <Image src={images[5].src} alt={images[5].alt} fill className="object-cover transition-transform duration-700 group-hover:scale-110" priority/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
     

              

              
              <div className="absolute bottom-4 right-4 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
                06/06
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);
}
