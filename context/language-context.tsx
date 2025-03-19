"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type LanguageContextType = {
  language: string
  setLanguage: (language: string) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Available languages
export const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "ar", name: "العربية" },
]

// Translation dictionaries
const translations: Record<string, Record<string, string>> = {
  en: {
    // Dashboard
    "dashboard.title": "Portfolio Dashboard",
    "dashboard.work_experience": "Work Experience",
    "dashboard.education": "Education",
    "dashboard.certifications": "Certifications",
    "dashboard.technologies": "Technologies",
    "dashboard.testimonials": "Testimonials",
    "dashboard.positions": "Positions",
    "dashboard.degrees": "Degrees",
    "dashboard.certificates": "Certificates",
    "dashboard.contact": "Contact",
    "dashboard.projects": "Projects",
    "dashboard.skills": "Skills",
    "dashboard.reviews": "Reviews",
    "dashboard.quick_access": "Quick Access",
    "dashboard.profile": "Profile",
    "dashboard.manage_personal": "Manage your personal information",
    "dashboard.manage_professional": "Manage your professional history",
    "dashboard.manage_academic": "Manage your academic background",
    "dashboard.showcase_achievements": "Showcase your achievements",
    "dashboard.highlight_skills": "Highlight your technical skills",
    "dashboard.display_feedback": "Display client feedback",
    "dashboard.manage_contact": "Manage your contact information",

    // Profile
    "profile.title": "Profile",
    "profile.edit_profile": "Edit Profile",
    "profile.about_me": "About Me",
    "profile.introduction": "Introduction",
    "profile.key_skills": "Key Skills",
    "profile.experience": "Experience",
    "profile.years": "years",
    "profile.resume": "Resume/CV",
    "profile.download_cv": "Download CV",
    "profile.open_to_work": "Open to work",
    "profile.not_open": "Not open to work",

    // Work Experience
    "work.title": "Work Experience",
    "work.add_experience": "Add Experience",
    "work.edit_experience": "Edit Experience",
    "work.add_new": "Add New Experience",
    "work.update_details": "Update your work experience details.",
    "work.fill_details": "Fill in the details to add a new work experience to your portfolio.",
    "work.job_title": "Job Title",
    "work.company": "Company",
    "work.location": "Location",
    "work.period": "Period",
    "work.company_logo": "Company Logo",
    "work.description": "Description",
    "work.responsibilities": "Responsibilities",
    "work.technologies": "Technologies",

    // Education
    "education.title": "Education",
    "education.add_education": "Add Education",
    "education.edit_education": "Edit Education",
    "education.add_new": "Add New Education",
    "education.update_details": "Update your education details.",
    "education.fill_details": "Fill in the details to add a new education entry to your portfolio.",
    "education.degree": "Degree/Certificate",
    "education.institution": "Institution",
    "education.location": "Location",
    "education.period": "Period",
    "education.options": "Options (GPA, Honors, etc.)",
    "education.description": "Description",
    "education.courses": "Key Courses",

    // Certifications
    "cert.title": "Certifications",
    "cert.add_certification": "Add Certification",
    "cert.edit_certification": "Edit Certification",
    "cert.add_new": "Add New Certification",
    "cert.update_details": "Update your certification details.",
    "cert.fill_details": "Fill in the details to add a new certification to your portfolio.",
    "cert.name": "Certification Name",
    "cert.issuer": "Issuing Organization",
    "cert.date": "Date Issued",
    "cert.url": "Certificate URL",
    "cert.view": "View Certificate",

    // Technologies
    "tech.title": "Technologies",
    "tech.add_technology": "Add Technology",
    "tech.edit_technology": "Edit Technology",
    "tech.add_new": "Add New Technology",
    "tech.update_details": "Update your technology details.",
    "tech.fill_details": "Fill in the details to add a new technology to your portfolio.",
    "tech.name": "Technology Name",
    "tech.category": "Category",
    "tech.icon": "Icon",

    // Testimonials
    "testimonial.title": "Testimonials",
    "testimonial.add_testimonial": "Add Testimonial",
    "testimonial.edit_testimonial": "Edit Testimonial",
    "testimonial.add_new": "Add New Testimonial",
    "testimonial.update_details": "Update testimonial details.",
    "testimonial.fill_details": "Fill in the details to add a new testimonial to your portfolio.",
    "testimonial.quote": "Testimonial Quote",
    "testimonial.author_name": "Author Name",
    "testimonial.author_position": "Author Position",
    "testimonial.author_image": "Author Image",

    // Contact
    "contact.title": "Contact Information",
    "contact.edit_contact": "Edit Contact",
    "contact.save_changes": "Save Changes",
    "contact.details": "Contact Details",
    "contact.primary_info": "Your primary contact information",
    "contact.email": "Email Address",
    "contact.phone": "Phone Number",
    "contact.social": "Social Media",
    "contact.profiles": "Your social media profiles",

    // Common
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.update": "Update",
    "common.add": "Add",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.actions": "Actions",
    "common.language": "Language",

    // Sidebar
    "sidebar.dashboard": "Dashboard",
    "sidebar.profile": "Profile",
    "sidebar.education": "Education",
    "sidebar.certifications": "Certifications",
    "sidebar.projects": "Projects",
    "sidebar.work_experience": "Work Experience",
    "sidebar.technologies": "Technologies",
    "sidebar.companies": "Companies",
    "sidebar.testimonials": "Testimonials",
    "sidebar.contact": "Contact",
    "sidebar.translations": "Translations",
    "sidebar.settings": "Settings",
    "sidebar.portfolio_dashboard": "Portfolio Dashboard",
  },
  fr: {
    // Dashboard
    "dashboard.title": "Tableau de Bord du Portfolio",
    "dashboard.work_experience": "Expérience Professionnelle",
    "dashboard.education": "Formation",
    "dashboard.certifications": "Certifications",
    "dashboard.technologies": "Technologies",
    "dashboard.testimonials": "Témoignages",
    "dashboard.positions": "Postes",
    "dashboard.degrees": "Diplômes",
    "dashboard.certificates": "Certificats",
    "dashboard.projects": "Projets",
    "dashboard.contact": "Contact",
    "dashboard.skills": "Compétences",
    "dashboard.reviews": "Avis",
    "dashboard.quick_access": "Accès Rapide",
    "dashboard.profile": "Profil",
    "dashboard.manage_personal": "Gérer vos informations personnelles",
    "dashboard.manage_professional": "Gérer votre historique professionnel",
    "dashboard.manage_academic": "Gérer votre parcours académique",
    "dashboard.showcase_achievements": "Mettre en valeur vos réalisations",
    "dashboard.highlight_skills": "Mettre en avant vos compétences techniques",
    "dashboard.display_feedback": "Afficher les retours clients",
    "dashboard.manage_contact": "Gérer vos informations de contact",

    // Profile
    "profile.title": "Profil",
    "profile.edit_profile": "Modifier le Profil",
    "profile.about_me": "À Propos de Moi",
    "profile.introduction": "Introduction",
    "profile.key_skills": "Compétences Clés",
    "profile.experience": "Expérience",
    "profile.years": "ans",
    "profile.resume": "CV",
    "profile.download_cv": "Télécharger CV",
    "profile.open_to_work": "Ouvert aux opportunités",
    "profile.not_open": "Pas disponible",

    // Work Experience
    "work.title": "Expérience Professionnelle",
    "work.add_experience": "Ajouter une Expérience",
    "work.edit_experience": "Modifier l'Expérience",
    "work.add_new": "Ajouter une Nouvelle Expérience",
    "work.update_details": "Mettre à jour les détails de votre expérience professionnelle.",
    "work.fill_details":
      "Remplissez les détails pour ajouter une nouvelle expérience professionnelle à votre portfolio.",
    "work.job_title": "Titre du Poste",
    "work.company": "Entreprise",
    "work.location": "Lieu",
    "work.period": "Période",
    "work.company_logo": "Logo de l'Entreprise",
    "work.description": "Description",
    "work.responsibilities": "Responsabilités",
    "work.technologies": "Technologies",

    // Common
    "common.cancel": "Annuler",
    "common.save": "Enregistrer",
    "common.update": "Mettre à jour",
    "common.add": "Ajouter",
    "common.edit": "Modifier",
    "common.delete": "Supprimer",
    "common.actions": "Actions",
    "common.language": "Langue",

    // Sidebar
    "sidebar.dashboard": "Tableau de Bord",
    "sidebar.profile": "Profil",
    "sidebar.education": "Formation",
    "sidebar.certifications": "Certifications",
    "sidebar.projects": "Projets",
    "sidebar.work_experience": "Expérience Professionnelle",
    "sidebar.technologies": "Technologies",
    "sidebar.companies": "Entreprises",
    "sidebar.testimonials": "Témoignages",
    "sidebar.contact": "Contact",
    "sidebar.translations": "Traductions",
    "sidebar.settings": "Paramètres",
    "sidebar.portfolio_dashboard": "Tableau de Bord du Portfolio",
  },
  ar: {
    // لوحة التحكم
    "dashboard.title": "لوحة تحكم الملف الشخصي",
    "dashboard.work_experience": "الخبرة المهنية",
    "dashboard.education": "التعليم",
    "dashboard.certifications": "الشهادات",
    "dashboard.technologies": "التقنيات",
    "dashboard.testimonials": "التوصيات",
    "dashboard.positions": "المناصب",
    "dashboard.degrees": "الدرجات العلمية",
    "dashboard.projects": " المشاريع",
    "dashboard.contact": "التواصل",
    "dashboard.certificates": "الشهادات",
    "dashboard.skills": "المهارات",
    "dashboard.reviews": "التقييمات",
    "dashboard.quick_access": "وصول سريع",
    "dashboard.profile": "الملف الشخصي",
    "dashboard.manage_personal": "إدارة معلوماتك الشخصية",
    "dashboard.manage_professional": "إدارة تاريخك المهني",
    "dashboard.manage_academic": "إدارة مسارك الأكاديمي",
    "dashboard.showcase_achievements": "عرض إنجازاتك",
    "dashboard.highlight_skills": "إبراز مهاراتك التقنية",
    "dashboard.display_feedback": "عرض آراء العملاء",
    "dashboard.manage_contact": "إدارة معلومات الاتصال الخاصة بك",
  
    // الملف الشخصي
    "profile.title": "الملف الشخصي",
    "profile.edit_profile": "تعديل الملف الشخصي",
    "profile.about_me": "نبذة عني",
    "profile.introduction": "مقدمة",
    "profile.key_skills": "المهارات الرئيسية",
    "profile.experience": "الخبرة",
    "profile.years": "سنة",
    "profile.resume": "السيرة الذاتية",
    "profile.download_cv": "تحميل السيرة الذاتية",
    "profile.open_to_work": "متاح لفرص العمل",
    "profile.not_open": "غير متاح",
  
    // الخبرة المهنية
    "work.title": "الخبرة المهنية",
    "work.add_experience": "إضافة خبرة",
    "work.edit_experience": "تعديل الخبرة",
    "work.add_new": "إضافة خبرة جديدة",
    "work.update_details": "تحديث تفاصيل خبرتك المهنية.",
    "work.fill_details": "املأ التفاصيل لإضافة خبرة مهنية جديدة إلى ملفك الشخصي.",
    "work.job_title": "المسمى الوظيفي",
    "work.company": "الشركة",
    "work.location": "الموقع",
    "work.period": "الفترة",
    "work.company_logo": "شعار الشركة",
    "work.description": "الوصف",
    "work.responsibilities": "المسؤوليات",
    "work.technologies": "التقنيات",
  
    // مشترك
    "common.cancel": "إلغاء",
    "common.save": "حفظ",
    "common.update": "تحديث",
    "common.add": "إضافة",
    "common.edit": "تعديل",
    "common.delete": "حذف",
    "common.actions": "الإجراءات",
    "common.language": "اللغة",
  
    // الشريط الجانبي
    "sidebar.dashboard": "لوحة التحكم",
    "sidebar.profile": "الملف الشخصي",
    "sidebar.education": "التعليم",
    "sidebar.certifications": "الشهادات",
    "sidebar.projects": "المشاريع",
    "sidebar.work_experience": "الخبرة المهنية",
    "sidebar.technologies": "التقنيات",
    "sidebar.companies": "الشركات",
    "sidebar.testimonials": "التوصيات",
    "sidebar.contact": "اتصل بنا",
    "sidebar.translations": "الترجمات",
    "sidebar.settings": "الإعدادات",
    "sidebar.portfolio_dashboard": "لوحة تحكم الملف الشخصي",
  }
  
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState("en")

  // Load language preference from localStorage on initial render
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage")
    if (savedLanguage) {
      setLanguageState(savedLanguage)
    }
  }, [])

  // Save language preference to localStorage when it changes
  const setLanguage = (lang: string) => {
    setLanguageState(lang)
    localStorage.setItem("preferredLanguage", lang)
  }

  // Translation function
  const t = (key: string): string => {
    if (!translations[language]) {
      return translations["en"][key] || key
    }
    return translations[language][key] || translations["en"][key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

