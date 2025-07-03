import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Mail, Lock, Building2, ArrowRight, Loader2 } from 'lucide-react';
import '../styles/login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Animación de entrada
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Redirigir automáticamente al dashboard
  useEffect(() => {
    navigate('/');
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!formData.email || !formData.password) {
        toast({
          title: "Error de validación",
          description: "Por favor, complete todos los campos",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast({
          title: "¡Bienvenido! 🎉",
          description: "Acceso autorizado al Sistema Empresarial ENTER",
          duration: 3000,
        });
        navigate('/');
      } else {
        toast({
          title: "Error de autenticación",
          description: result.error || "Credenciales inválidas",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return null;
};

export default Login;
