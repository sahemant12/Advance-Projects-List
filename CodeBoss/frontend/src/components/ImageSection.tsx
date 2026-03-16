"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Eclipse } from "@/Effects/BackgroundGradients";
import { LeftDesign, RightDesign } from "@/Effects/Design";
import { LeftShade, RightShade } from "@/Effects/Shades";

export default function ImageSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <div
      ref={sectionRef}
      className="flex flex-col py-16 w-full sm:mb-40 sm:mt-10 justify-center items-center"
    >
      <div className="relative flex items-center justify-center w-full max-w-7xl">
        <div className="absolute scale-35 md:hidden lg:block -left-50 top-22 lg:-left-30 2xl:-left-35 lg:top-55 lg:transform -translate-y-1/2 z-10 lg:scale-95 2xl:scale-120">
          <LeftDesign />
        </div>
        <motion.div
          className="absolute -left-44 -bottom-80 scale-20 sm:scale-40 sm:-left-30 sm:-bottom-80 md:-left-40 md:-bottom-140 2xl:-left-50 md:top-50 z-35 md:scale-75 2xl:scale-90"
          initial={{ x: -150, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 0.9 } : { x: -150, opacity: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <LeftShade />
        </motion.div>
        <div className="absolute scale-35 md:hidden lg:block -right-45 top-30 lg:-right-31 2xl:-right-40 lg:top-55 lg:transform -translate-y-1/2 z-10 lg:scale-85 2xl:scale-110">
          <RightDesign />
        </div>
        <motion.div
          className="absolute -right-44 -bottom-80 scale-20  sm:scale-40 sm:-right-30 sm:-bottom-80 md:-right-40 md:scale-75 2xl:-right-50 z-35 2xl:scale-90"
          initial={{ x: 150, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 0.9 } : { x: 150, opacity: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <RightShade />
        </motion.div>
        <div className="relative z-20 pb-10 sm:pb-0 sm:w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl  pl-2 pr-2 md:px-2 bg-gradient-to-l from-[#999999]/8 from-80% via-black via-90% to-[#999999]/8 to-100% rounded-tl-[38.66px] rounded-tr-[38.66px] rounded-bl-[77.32px] rounded-br-[77.32px]">
          <div
            className="absolute hidden md:block left-0 bottom-0 right-0 top-0 pointer-events-none z-20 rounded-tl-[38.66px] rounded-tr-[38.66px]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(153,153,153,0.08) 80%, rgba(0,0,0,1) 80%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none z-40 sm:w-[480px] md:w-full"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.9) 90%, rgba(0,0,0,1) 100%)",
            }}
          />
          <div className="relative">
            <div
              className="relative w-full h-[6.77px] blur-[4.83px] mx-auto z-20 sm:w-[450px] md:w-full"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,32,29,0) 10%, rgba(2,242,242,1) 30%, rgba(2,242,242,1) 70%, rgba(0,32,29,0) 90%)",
              }}
            />
            <Eclipse />
          </div>
          <div className="relative z-30 w-[280px] sm:w-[450px] md:w-full">
            <Image src="/Image.png" alt="Image" width={1000} height={100} />
          </div>
        </div>
      </div>
    </div>
  );
}
