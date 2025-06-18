import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica de autenticación
    if (formData.username && formData.password) {
      localStorage.setItem('user', JSON.stringify({ username: formData.username }));
      toast({
        title: "Inicio de sesión exitoso",
        description: "Sistema Empresarial ENTER",
      });
      navigate('/');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e4c78]">
      <div className="w-full max-w-md p-8 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="df.png" 
            alt="Enter Logo" 
            className="w-48"
          />
          <p className="text-white text-center mt-2 text-sm italic">Software ENTER</p>
        </div>

        {/* Formulario */}
        <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-white text-xl font-semibold mb-6 text-center">Inicio de Sesión</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-sm mb-2">
                Nombre de Usuario
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button 
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <img 
                    src="/df.png" 
                    alt="Mostrar contraseña" 
                    className="w-5 h-5 opacity-50 hover:opacity-100"
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="submit"
                className="bg-yellow-400 text-gray-800 px-6 py-2 rounded-md hover:bg-yellow-500 transition-colors duration-200"
              >
                Ingresar
              </button>
              <button
                type="button"
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200"
              >
                Crear cuenta
              </button>
            </div>

            <div className="flex justify-between text-sm text-white/80 mt-4">
              <a href="#" className="hover:text-white">¿Olvidó su contraseña?</a>
              <a href="#" className="hover:text-white">¿Necesita una cuenta?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
