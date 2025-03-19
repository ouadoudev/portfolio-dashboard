"use client";

import { useEffect, useState } from "react";
import UserProfileSection from "@/components/user-profile-section";
import UserCreationForm from "@/components/user-creation-form";

interface User {
  id: number;
  fullName: string;
  image: string;
  title: string;
  tagline: string;
  introduction: string;
  keySkills: string[];
  status: string;
  cv: string;
  yearsOfExperience: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/portfolio");
        if (response.ok) {
          const users = await response.json();
          if (users.length > 0) {
            setUser(users[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleUserCreated = (newUser: User) => {
    setUser(newUser);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-8 py-4">
      {user ? (
        <UserProfileSection initialUser={user} />
      ) : (
        <UserCreationForm onUserCreated={handleUserCreated} />
      )}
    </div>
  );
}
