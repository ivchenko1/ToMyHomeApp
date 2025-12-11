const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden opacity-40 pointer-events-none">
      {/* Gradient Orb 1 */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] animate-float"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          top: '-200px',
          left: '-200px',
          animationDelay: '0s',
        }}
      />
      
      {/* Gradient Orb 2 */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full blur-[100px] animate-float"
        style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          bottom: '-300px',
          right: '-300px',
          animationDelay: '7s',
        }}
      />
      
      {/* Gradient Orb 3 */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[100px] animate-float"
        style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animationDelay: '14s',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
