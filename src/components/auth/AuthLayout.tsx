import React from "react";

const AuthLayout: React.FC<{ children: React.ReactNode } > = ({ children }) => {
  return (
    <main
      className="min-h-screen bg-white"
      style={{ backgroundImage: "url(/assets/hero-bg.svg)", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="container mx-auto max-w-7xl px-3 sm:px-6 py-8 sm:py-12 md:py-20 min-h-screen flex items-center justify-center">
        {children}
      </div>
    </main>
  );
};

export default AuthLayout;
