import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2, 
  Facebook, Twitter, Linkedin, Instagram
} from "lucide-react";
import { toast } from "sonner";

// IMPORT DU PONT API SÉCURISÉ
import api from "@/api/axios";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const subjects = [
    "Question générale",
    "Adhésion au collectif",
    "Partenariat & Sponsoring",
    "Support technique",
    "Presse & Média",
    "Autre"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);

    try {
      // APPEL RÉEL AU BACKEND AVEC AXIOS
      await api.post("/contact", formData);

      setIsSubmitted(true);
      toast.success("Message envoyé avec succès !");
      setFormData({ name: "", email: "", subject: "", message: "" });
      
    } catch (error) {
      console.error("Erreur contact:", error);
      const errorMsg = error.response?.data?.message || "Impossible de contacter le serveur. Veuillez réessayer.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    { name: "LinkedIn", icon: Linkedin, href: "#", color: "hover:text-blue-700" },
    { name: "Twitter", icon: Twitter, href: "#", color: "hover:text-sky-500" },
    { name: "Facebook", icon: Facebook, href: "#", color: "hover:text-blue-600" },
    { name: "Instagram", icon: Instagram, href: "#", color: "hover:text-pink-600" }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-center border border-slate-100"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-black font-display text-[#0A2A5C] mb-4">Message Reçu !</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Merci de nous avoir contactés. Votre demande a bien été enregistrée. Notre équipe reviendra vers vous sous 24 à 48 heures.
          </p>
          <Button 
            onClick={() => setIsSubmitted(false)} 
            className="w-full h-12 rounded-xl bg-[#0A2A5C] text-white hover:bg-blue-900 font-bold"
          >
            Envoyer un autre message
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* HERO HEADER */}
      <section className="bg-[#0A2A5C] pt-32 pb-48 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-400/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10 text-center max-w-3xl">
          <Badge className="mb-6 bg-white/10 text-amber-300 hover:bg-white/20 border-0 px-4 py-1.5 backdrop-blur-md">
            <MessageSquare className="w-3 h-3 mr-2" /> Contact & Support
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight mb-6">
            Discutons de l'Avenir
          </h1>
          <p className="text-lg text-blue-100/80 font-light leading-relaxed">
            Une question sur le réseau ? Une proposition de partenariat ? 
            <br className="hidden md:block" /> Notre équipe est à votre disposition pour échanger.
          </p>
        </div>
      </section>

      {/* SECTION PRINCIPALE */}
      <section className="container mx-auto px-4 lg:px-8 -mt-32 relative z-20 pb-20">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="grid lg:grid-cols-12">
            
            {/* GAUCHE : INFOS DE CONTACT */}
            <div className="lg:col-span-5 bg-[#0A2A5C] text-white p-10 lg:p-16 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold font-display mb-2">Nos Coordonnées</h3>
                <p className="text-blue-200 text-sm mb-12">Retrouvez-nous via ces canaux directs.</p>

                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-amber-400">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">Email</p>
                      <a href="mailto:contact@calsed.sn" className="text-lg font-medium hover:text-amber-400 transition-colors">contact@calsed.sn</a>
                      <p className="text-xs text-blue-200/60 mt-1">Réponse sous 24h</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-amber-400">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">Téléphone</p>
                      <a href="tel:+221339711000" className="text-lg font-medium hover:text-amber-400 transition-colors">+221 33 971 10 00</a>
                      <p className="text-xs text-blue-200/60 mt-1">Lun-Ven, 8h-18h</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-amber-400">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">Siège Social</p>
                      <p className="text-lg font-medium leading-tight">Lycée Scientifique d'Excellence</p>
                      <p className="text-sm text-blue-200 mt-1">Route de Kaolack, Diourbel, Sénégal</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-12 pt-12 border-t border-white/10">
                <p className="text-sm font-bold text-blue-300 mb-4">Suivez-nous</p>
                <div className="flex gap-4">
                  {socialLinks.map((social) => (
                    <a 
                      key={social.name} 
                      href={social.href} 
                      className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-amber-400 hover:text-[#0A2A5C] transition-all duration-300"
                    >
                      <social.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* DROITE : FORMULAIRE */}
            <div className="lg:col-span-7 p-10 lg:p-16 bg-white">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Envoyez-nous un message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom complet</Label>
                    <Input
                      id="name"
                      placeholder="Votre nom"
                      className="bg-slate-50 border-slate-200 h-12 rounded-xl focus-visible:ring-[#0A2A5C]"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email professionnel</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nom@exemple.com"
                      className="bg-slate-50 border-slate-200 h-12 rounded-xl focus-visible:ring-[#0A2A5C]"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sujet de la demande</Label>
                  <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 h-12 rounded-xl focus:ring-[#0A2A5C]">
                      <SelectValue placeholder="Sélectionnez un sujet" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Détaillez votre demande ici..."
                    className="bg-slate-50 border-slate-200 min-h-[150px] rounded-xl resize-none focus-visible:ring-[#0A2A5C] p-4 text-base"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-14 bg-[#0A2A5C] hover:bg-blue-900 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-900/10 transition-all active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">Envoi en cours...</span>
                    ) : (
                      <span className="flex items-center gap-2">Envoyer le message <Send className="h-4 w-4" /></span>
                    )}
                  </Button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* CARTE GOOGLE MAPS */}
      <section className="container mx-auto px-4 lg:px-8 pb-24">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <div className="rounded-2xl overflow-hidden h-[400px] w-full relative bg-slate-100">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3858.987747941384!2d-16.233333!3d14.65!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDM5JzAwLjAiTiAxNsKwMTQnMDAuMCJX!5e0!3m2!1sfr!2ssn!4v1620000000000!5m2!1sfr!2ssn"
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy"
              title="Carte LSED"
              className="grayscale hover:grayscale-0 transition-all duration-700"
            ></iframe>
            
            <div className="absolute bottom-6 left-6 bg-white py-3 px-5 rounded-xl shadow-lg border border-slate-100 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-bold text-[#0A2A5C]">Actuellement ouvert</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ContactPage;