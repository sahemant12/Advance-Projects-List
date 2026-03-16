"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LineDesign } from "@/Effects/Design";
import { People } from "@/Effects/Icons";
import Image from "next/image";

export default function Features() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <div ref={sectionRef} className="w-full min-h-screen relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 sm:mb-6 lg:gap-8 lg:mb-10">
            <h1 className="text-2xl sm:text-4xl lg:text-6xl  font-normal font-'Montserrat' bg-clip-text text-transparent bg-gradient-to-r from-40% from-white to-[#999999] to-70%">
              Seamless AI
            </h1>
            <h1 className="text-2xl sm:text-4xl lg:text-6xl  font-normal font-'Montserrat' bg-clip-text text-transparent bg-gradient-to-r from-15% from-[#006F91] to-[#0BB6C0] to-50%">
              Collaboration
            </h1>
          </div>
          <div className="flex flex-wrap justify-center items-center lg:gap-4">
            <span className="text-2xl sm:text-4xl lg:text-6xl  font-normal font-'Montserrat' bg-clip-text text-transparent bg-gradient-to-r from-40% from-white to-[#999999] to-70%">
              for
            </span>
            <People />
            <span className="text-2xl sm:text-4xl lg:text-6xl font-normal font-'Montserrat' bg-clip-text text-transparent bg-gradient-to-r from-15% from-[#006F91] to-[#0BB6C0] to-50%">
              Developers
            </span>
          </div>
        </motion.div>
        <motion.div
          className="relative border-glow-sharp"
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="absolute inset-0 bg-black/90 overflow-hidden rounded-3xl shadow-2xl shadow-teal-500/20">
            <motion.div
              className="absolute top-0 left-0 w-48 h-48 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.3)_0%,rgba(20,184,166,0.15)_35%,transparent_70%)] pointer-events-none z-[1]"
              initial={{ x: -50, y: -50, opacity: 0 }}
              animate={isInView ? { x: 0, y: 0, opacity: 1 } : { x: -50, y: -50, opacity: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-48 h-48 bg-[radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.3)_0%,rgba(20,184,166,0.15)_35%,transparent_70%)] pointer-events-none z-[1]"
              initial={{ x: 50, y: 50, opacity: 0 }}
              animate={isInView ? { x: 0, y: 0, opacity: 1 } : { x: 50, y: 50, opacity: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600/10 via-transparent to-teal-600/10 rounded-3xl border border-teal-400/20 m-0.5"></div>
          <div className="relative z-10 p-6 sm:p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_5fr] gap-6 lg:gap-8 max-w-6xl mx-auto">
              <motion.div
                className="order-1"
                initial={{ opacity: 0, x: -40 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
                transition={{ duration: 0.7, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="h-full bg-teal-950/20 rounded-3xl border-2 border-gray-800/30 p-6 flex flex-col min-h-[400px] lg:min-h-[500px]">
                  <div className="flex-1 flex items-center justify-center mb-6">
                    <div>
                      <Image
                        src="/Architecture.png"
                        alt="Architecture Diagram"
                        width={300}
                        height={200}
                      />
                    </div>
                  </div>
                  <div className="text-start ml-4">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-medium font-'Montserrat' bg-clip-text text-transparent bg-gradient-to-r from-40% from-white to-[#999999] to-70% mb-4">
                      Architecture Insights
                    </h3>
                    <p className="text-xs sm:text-sm lg:max-w-[95%] font-light font-'Montserrat' text-white -inset-y-3/4 leading-relaxed">
                      Instantly visualize and understand your project&apos;s
                      structure. Get high-level overviews, dependency graphs,
                      and clear explanations of how everything fits together.
                    </p>
                  </div>
                </div>
              </motion.div>
              <div className="order-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 h-full">
                  <motion.div
                    className="order-1"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <div className="bg-[#023030]/18 rounded-3xl border-2 border-gray-800/30 p-4 h-full min-h-[200px] lg:min-h-[240px] flex flex-col justify-between">
                      <div className="flex justify-center sm:justify-start">
                        <div className="transform scale-60 sm:translate-y-1/3 sm:scale-80 pt-0">
                          <LineDesign />
                        </div>
                      </div>
                      <div className="text-start ml-4 sm:mt-4">
                        <h3 className="text-md sm:text-lg xl:text-xl font-medium font-'Montserrat' bg-clip-text text-transparent bg-gradient-to-r from-40% from-white to-[#999999] to-70% mb-3">
                          Full-Project Understanding
                        </h3>
                        <p className="text-xs sm:text-sm lg:text-sm max-w-[85%] font-light font-'Montserrat' text-white leading-relaxed">
                          Install and let our AI understand your entire codebase
                          and every file, dependency, and relationship.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    className="order-2"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <div className="bg-teal-950/20 rounded-3xl border-2 border-gray-800/30 p-4 h-full min-h-[200px] lg:min-h-[240px] flex flex-col justify-between">
                      <div className="flex justify-center sm:justify-start">
                        <div className="transform scale-80 sm:scale-100">
                          <Image
                            src="/Brain.png"
                            alt="AI Brain"
                            width={150}
                            height={150}
                          />
                        </div>
                      </div>
                      <div className="text-start ml-4 lg:-translate-y-1">
                        <h3 className="text-lg sm:text-xl lg:text-xl font-medium font-'Montserrat' bg-clip-text text-transparent bg-gradient-to-r from-40% from-white to-[#999999] to-70% mb-3">
                          Context-Aware Code Generation
                        </h3>
                        <p className="text-xs sm:text-sm lg:text-sm max-w-[85%] font-light font-'Montserrat' text-white leading-relaxed">
                          Reviews your code changes and get suggestions with
                          full awareness of your project&apos;s context.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    className="sm:col-span-2 order-3"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <div className="bg-teal-950/20 rounded-3xl border-2 border-gray-800/30 p-6 h-full min-h-[200px] lg:min-h-[240px] flex flex-col lg:flex-row items-center">
                      <div className="flex-shrink-0 mb-4 lg:mb-0 lg:mr-30">
                        <div className="scale-90 sm:scale-110 lg:scale-120 lg:translate-x-1/4">
                          <Image
                            src="/Spider.png"
                            alt="Debug Spider"
                            width={200}
                            height={200}
                          />
                        </div>
                      </div>
                      <div className="text-start ml-4">
                        <h3 className="text-xl sm:text-2xl lg:text-xl font-medium font-'Montserrat' bg-clip-text text-transparent bg-gradient-to-r from-40% from-white to-[#999999] to-70% mb-4">
                          Cross-File Debugging
                        </h3>
                        <p className="text-sm sm:text-base lg:text-sm max-w-[96%] font-light font-'Montserrat' text-white leading-relaxed">
                          Debug complex issues that span multiple files and
                          modules. Our AI traces bugs and logic across your
                          whole project, saving you hours of manual searching.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
