"use client"

import { useEffect, useState } from "react"
import { Edit, Facebook, Github, Instagram, Linkedin, Mail, Phone, Save, Twitter, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Define types for contact data
type SocialLinks = {
  instagram: string
  facebook: string
  twitter: string
  linkedin: string
  youtube: string
  github: string
}

type ContactData = {
  email: string
  phone: string
  socialLinks: SocialLinks
}

export default function ContactPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [contactData, setContactData] = useState<ContactData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Fetch contact data on component mount
  useEffect(() => {
    const fetchContact = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/contact")
        const data = await response.json()
        if (response.ok) {
          setContactData(data)
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to load contact information",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to connect to the server",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchContact()
  }, [toast])

  // Save contact data
  const saveContact = async () => {
    try {
      setIsSaving(true)
      const response = await fetch("/api/contact", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      })

      const data = await response.json()
      if (response.ok) {
        setContactData(data)
        setIsEditing(false)
        toast({
          title: "Success",
          description: "Contact information updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save contact information",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to the server",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Social media icon mapping
  const socialIcons = {
    linkedin: <Linkedin className="h-5 w-5" />,
    github: <Github className="h-5 w-5" />,
    twitter: <Twitter className="h-5 w-5" />,
    facebook: <Facebook className="h-5 w-5" />,
    instagram: <Instagram className="h-5 w-5" />,
    youtube: <Youtube className="h-5 w-5" />,
  }

  // Social media color mapping
  const socialColors = {
    linkedin: "bg-[#0077B5]/10 text-[#0077B5] group-hover:bg-[#0077B5]/20",
    github: "bg-[#333]/10 text-[#333] dark:text-white group-hover:bg-[#333]/20",
    twitter: "bg-[#1DA1F2]/10 text-[#1DA1F2] group-hover:bg-[#1DA1F2]/20",
    facebook: "bg-[#1877F2]/10 text-[#1877F2] group-hover:bg-[#1877F2]/20",
    instagram: "bg-[#E4405F]/10 text-[#E4405F] group-hover:bg-[#E4405F]/20",
    youtube: "bg-[#FF0000]/10 text-[#FF0000] group-hover:bg-[#FF0000]/20",
  }

  return (
    <div className="mx-8 py-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contact Information</h1>
          </div>
          {!isLoading && contactData && (
            <Button
              onClick={() => {
                if (isEditing) saveContact()
                else setIsEditing(true)
              }}
              disabled={isSaving}
              className="min-w-[140px]"
              size="sm"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : isEditing ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Contact
                </>
              )}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48 mt-1" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48 mt-1" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : contactData ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Contact Details</CardTitle>
                <CardDescription>Your primary contact information</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={contactData.email}
                          onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                          placeholder="your@email.com"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number
                      </Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={contactData.phone}
                          onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <a href={`mailto:${contactData.email}`} className="font-medium hover:underline">
                          {contactData.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Phone</span>
                        <a href={`tel:${contactData.phone}`} className="font-medium hover:underline">
                          {contactData.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Social Media</CardTitle>
                <CardDescription>Your social media profiles</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(contactData.socialLinks).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3 p-3 rounded-lg border border-input">
                        <div
                          className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full",
                            socialColors[key as keyof typeof socialColors],
                          )}
                        >
                          {socialIcons[key as keyof typeof socialIcons]}
                        </div>
                        <Input
                          value={value}
                          onChange={(e) =>
                            setContactData({
                              ...contactData,
                              socialLinks: { ...contactData.socialLinks, [key]: e.target.value },
                            })
                          }
                          placeholder={`https://${key}.com/yourusername`}
                          className="flex-1"
                          aria-label={key}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(contactData.socialLinks).map(([key, value]) =>
                      value ? (
                        <a
                          key={key}
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-primary/10 transition-colors group"
                        >
                          <div
                            className={cn(
                              "flex items-center justify-center w-10 h-10 rounded-full transition-colors",
                              socialColors[key as keyof typeof socialColors],
                            )}
                          >
                            {socialIcons[key as keyof typeof socialIcons]}
                          </div>
                          <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                        </a>
                      ) : (
                        <div
                          key={key}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 text-muted-foreground"
                        >
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50">
                            {socialIcons[key as keyof typeof socialIcons]}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                            <Badge variant="outline" className="mt-1">
                              Not connected
                            </Badge>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex justify-center items-center p-8">
            <p className="text-muted-foreground">Failed to load contact information</p>
          </div>
        )}
      </div>
    </div>
  )
}

