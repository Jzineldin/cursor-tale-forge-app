


const Learning = () => {
  return (
    <div 
      className="min-h-screen bg-slate-900 flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('/images/Leonardo_Phoenix_10_A_cozy_wooden_library_at_night_with_floati_0.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif">
          Learning Journeys
        </h1>
        <p className="text-xl text-gray-300 mb-8 font-sans">
          Educational adventures coming soon! We're crafting immersive learning experiences that make education as exciting as any adventure.
        </p>
        <div className="bg-slate-800/70 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
          <p className="text-gray-300 font-sans">
            Stay tuned for interactive educational content that will transform how you learn and explore new subjects.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Learning;
