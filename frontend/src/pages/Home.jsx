import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO SECTION ===== */}
      <section className="flex flex-col md:flex-row items-center justify-between px-10 md:px-20 py-16 bg-gray-50">
        
        {/* Left Content */}
        <div className="max-w-xl space-y-6">
          <p className="text-pink-500 font-semibold tracking-widest">
            BE HEALTHY
          </p>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
            Renew Vitality <br /> Is Within Reach
          </h1>

          <p className="text-gray-500">
            When life leaves you exhausted at the end of each day, it can often
            feel difficult to find a solution, but EvasPEL can give you back
            your vitality and zest for life. Find out if you're a candidate today!
          </p>

          <button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-md shadow-md">
            APPOINTMENT
          </button>
        </div>

        {/* Right Image */}
        <div className="relative mt-10 md:mt-0">
          <div className="absolute -z-10 w-80 h-80 bg-pink-200 rounded-full top-10 left-10 blur-2xl"></div>
          <img
            src="https://images.unsplash.com/photo-1582750433449-648ed127bb54"
            alt="Doctor"
            className="w-80 md:w-96 rounded-lg"
          />
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="px-10 md:px-20 py-16 bg-pink-50">
        <div className="grid md:grid-cols-3 gap-8 text-center border-2 border-dashed border-pink-200 p-10 rounded-xl">
          
          {/* Item 1 */}
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-white rounded-full shadow text-pink-500 text-2xl">
              📅
            </div>
            <h3 className="font-semibold text-lg text-gray-800">
              Schedule Your Consultation
            </h3>
            <p className="text-gray-500 text-sm">
              Come in for your comprehensive consultation, together, we'll review.
            </p>
          </div>

          {/* Item 2 */}
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-white rounded-full shadow text-pink-500 text-2xl">
              👩‍⚕️
            </div>
            <h3 className="font-semibold text-lg text-gray-800">
              Receive Personalized Treatment
            </h3>
            <p className="text-gray-500 text-sm">
              Using information from consultation or diagnostic test, we’ll devise unique.
            </p>
          </div>

          {/* Item 3 */}
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-white rounded-full shadow text-pink-500 text-2xl">
              💖
            </div>
            <h3 className="font-semibold text-lg text-gray-800">
              Regain Your Lost Confidence
            </h3>
            <p className="text-gray-500 text-sm">
              Live your best life and look as good as you feel your renewed energy.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;