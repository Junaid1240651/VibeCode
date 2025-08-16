/**
 * Home Page Component
 * 
 * This is the main landing page of the VibeCode application.
 * It displays the hero section with project creation form and recent projects.
 * 
 * Key Features:
 * - Hero section with logo and title
 * - Project creation form for new AI-generated projects
 * - List of user's existing projects
 * - Responsive design with proper spacing
 */

import { ProjectForm } from "@/modules/home/ui/components/project-form"
import { ProjectList } from "@/modules/home/ui/components/project-list"
import Image from "next/image"

/**
 * Home Component
 * 
 * The main page layout with:
 * 1. Hero section - Logo, title, description, and project form
 * 2. Project list - User's existing projects
 */
const Home = () => {
  return (
    <div className='flex flex-col max-w-5xl mx-auto w-full'>
      {/* Hero Section */}
      <section className="space-y-6 py-[16vh] 2xl:py-48">
        <div className="flex flex-col items-center">
          {/* Logo - Hidden on mobile, visible on desktop */}
          <Image
            src="/logo.png"
            alt="Vibe Code"
            width={100}
            height={100}
            className="hidden md:block"
          />
        </div>
        
        {/* Main heading */}
        <h1 className="text-2xl md:text-5xl font-bold text-center">
          Build something with Vibe Code
        </h1>
        
        {/* Subheading description */}
        <p className="text-lg md:text-xl text-muted-foreground text-center ">
          Create apps and website by chatting with AI
        </p>
        
        {/* Project creation form */}
        <div className="max-w-3xl mx-auto w-full">
          <ProjectForm/>
        </div>
      </section>
      
      {/* User's existing projects */}
      <ProjectList/>
    </div>
  )
}

export default Home