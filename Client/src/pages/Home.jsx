import React, { useState } from 'react'
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSelector } from 'react-redux';
import AuthModel from '../components/AuthModel';

import { motion } from 'motion/react';
import { HiSparkles } from 'react-icons/hi';
import { BsRobot, BsBarChart, BsFileEarmarkText, BsClockHistory, BsMic, BsClock } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

//images 

import hrImg from '../assets/HR.png'
import techImg from '../assets/tech.png'
import confidenceImg from '../assets/confi.png'
import creditImg from '../assets/credit.png'
import evalImg from '../assets/ai-ans.png'
import resumeImg from '../assets/resume.png'
import pdfImg from '../assets/pdf.png'
import historyImg from '../assets/history.png'



function Home() {
  const { userData } = useSelector((state) => state.user);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();
  return (
    <div className='min-h-screen bg-[#f3f3f3] flex flex-col'>
      <Navbar />
      <div className='flex-1 px-6 pt-20 pb-8'>
        <div className='max-w-6xl mx-auto'>
          <div className='flex justify-center mb-8'>
            <div className='flex bg-gray-100 text-grey-600 text-xl px-4 py-2 rounded-full items-center gap-2'>
              <HiSparkles size={16} className='bg-green-50 text-blue-600 ' />
              AI Powered Smart Interview Platform
            </div>
          </div>
          <div className='flex flex-col items-center text-center mb-32'>
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className='text-4xl md:text-5xl font-semibold leading-tight max-w-4xl mx-auto'>
              Practice Interview with <br className='hidden md:block' />
              <span className='relative inline-block mt-4 md:mt-2'>
                <span className='bg-blue-500 text-white px-5 py-0.30 rounded-full'> AI Intelligence </span>
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className='text-gray-500 mt-8 max-w-2xl mx-auto text-lg'>
              Role based mock interviews, with smart follow ups, adaptive difficulty
              based on your response, and instant feedback to help you crack your next interview.
            </motion.p>
            <div
              className='flex flex-wrap justify-center gap-4 mt-10'>
              <motion.button
                onClick={() => {
                  if (!userData) {
                    setShowAuth(true);
                    return;
                  }
                  navigate('/interview');
                }}
                whileHover={{ opacity: 0.9, scale: 1.05 }}
                whileTap={{ opacity: 1, scale: 0.98 }}
                className='bg-black text-white px-10 py-3 rounded-full hover:opacity-90 transition shadow-md'>
                Start Interview Now
              </motion.button>
              <motion.button
                onClick={() => {
                  if (!userData) {
                    setShowAuth(true);
                    return;
                  }
                  navigate('/history');
                }}
                whileHover={{ opacity: 0.9, scale: 1.05 }}
                whileTap={{ opacity: 1, scale: 0.98 }}
                className='border border-gray-300 px-10 py-3 rounded-full hover:bg-gray-100 transition shadow-sm'>
                View Interview History
              </motion.button>
            </div>
          </div>
          <div
            className='flex flex-col md:flex-row justify-center items-center gap-10 mb-30'>
            {[
              {
                icon: <BsRobot size={24} />,
                step: "STEP 1",
                title: "Role & Experience Selection",
                desc: "AI adjusts difficulty based on selected job role."
              },
              {
                icon: <BsMic size={24} />,
                step: "STEP 2",
                title: "Smart Voice Interview",
                desc: "Dynamic follow up based on your response."
              },
              {
                icon: <BsClock  size={24} />,
                step: "STEP 3",
                title: "Timer based simulation",
                desc: "Real time interview pressure with time track."
              }
            ].map((item, index) => (
              <motion.div key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1 + index * 0.1 }}
                whileHover={{ rotate: 0, scale: 1.06 }}
                className={`bg-white border border-blue-100 hover:border-blue-500 p-10 rounded-3xl w-80 max-w-[90%] shadow-md hover:shadow-2xl transition-all duration-300 
                ${index === 0 ? "rotate-[-4deg]" : ""}
                ${index === 1 ? "rotate[3deg] md:-mt-6 shadow-xl" : ""} 
                ${index === 2 ? "rotate [-3deg]" : ""}`}>

                <div className='flex items-center gap-4 mb-6'>
                  <div className='bg-blue-50 text-blue-600 p-4 rounded-2xl'>
                    {item.icon}
                  </div>
                  <span className='text-sm font-bold text-blue-600 tracking-wider'>{item.step}</span>
                </div>
                
                <h3 className='text-2xl font-bold mb-4'>{item.title}</h3>
                <p className='text-gray-500 leading-relaxed'>{item.desc}</p>
                <div className='absolute -top-8 left-1/2 -transition-x-1/2 bg-white border-2 border-blue-100 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg'>
                  {item.icon}
                </div>
              </motion.div>
            ))}
          </div>
          <div className='mb-32'>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-4xl font-semibold text-center mb-16' >
              Advanced AI{""}
              <span className="text-blue-600"> Capabilities</span>

            </motion.h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
              {
                [
                  {
                    image: evalImg,
                    icon: <BsBarChart size={20} />,
                    title: "AI Answer Evaluation",
                    desc: "Scores communication, technical accuracy and confidence"
                  },
                  {
                    image: resumeImg,
                    icon: <BsFileEarmarkText size={20} />,
                    title: "Resume based Interview",
                    desc: "Project specific questions based on your resume"
                  },
                  {
                    image: pdfImg,
                    icon: <BsBarChart size={20} />,
                    title: "Download PDF Report",
                    desc: "Track progress with performance graph and topic analysis"
                  },
                  {
                    image: historyImg,
                    icon: <BsClockHistory size={20} />,
                    title: "Interview History",
                    desc: "Access all past interviews and performance records"
                  }
                ].map((item, index) => (
                  <motion.div key={index}
                    className='bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all'
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}>
                    <div className='flex flex-col md:flex-row items-center gap-8'>
                      <div className='w-full md:w-1/2 flex justify-center'>
                        <img src={item.image} alt={item.title} />
                      </div>

                      <div className='w-full md:w-1/2'>
                        <div className='bg-blue-50 text-blue-600 w-12 h-12 rounded-xl flex justify-center items-center mb-6'>
                          {item.icon}
                        </div>
                        <h3 className='font-semibold text-xl mb-3'>{item.title}</h3>
                        <p>{item.desc}</p>
                      </div>

                    </div>
                  </motion.div>
                ))
              }
            </div>
          </div>
          <div className='mb-10'>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-4xl font-semibold text-center mb-16' >
              Multiple Interview{""}
              <span className="text-blue-600"> Modes</span>

            </motion.h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
              {
                [
                  {
                    image: hrImg,
                    title: "HR Interiew Mode",
                    desc: "Behavioral and communication based evaluation"
                  },
                  {
                    image: techImg,
                    title: "Technical Mode",
                    desc: "Deep Technical questioning based on selected role"
                  },
                  {
                    image: confidenceImg,
                    title: "Confidence Detection",
                    desc: "Basic tone and voice analysis insight"
                  },
                  {
                    image: creditImg,
                    title: "Credit System",
                    desc: "Unlock premium features with credits"
                  }
                ].map((item, index) => (
                  <motion.div key={index}
                    className='bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all'
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}>
                    <div className='flex flex-col md:flex-row items-center gap-6'>
                      <div className='w-full md:w-1/2 flex justify-center'>
                        <img src={item.image} alt={item.title}
                          className='w-full h-auto object-contain max-h-64' />
                      </div>

                      <div className='w-full md:w-1/2'>
                        <h3 className='font-semibold text-xl mb-3'>{item.title}</h3>
                        <p className='text-gray-600'>{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>

  )
}

export default Home;

