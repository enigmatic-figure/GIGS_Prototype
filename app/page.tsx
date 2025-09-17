/**
 * GIGS Platform Landing Page
 * 
 * Main landing page showcasing the event staffing marketplace.
 * Features hero section, benefits overview, how it works, and call-to-action.
 */

import Link from "next/link";
import { Users, Calendar, MapPin, Star, ArrowRight, CheckCircle, Shield, Clock, Workflow, Briefcase } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { APP_CONFIG } from "@/lib/constants";

/**
 * Feature card data for consistent rendering
 */
const features = [
  {
    icon: Users,
    title: "Instant Staff Matching",
    description: "Find qualified event staff in your area within minutes, not days.",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    icon: Clock,
    title: "Real-time Booking",
    description: "Book staff for your events with live availability and instant confirmation.",
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
  },
  {
    icon: MapPin,
    title: "Location-based Matching",
    description: "Automatically match with staff based on event location and proximity.",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
  },
  {
    icon: Star,
    title: "Ratings & Reviews",
    description: "Make informed decisions with comprehensive staff ratings and reviews.",
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Handle payments securely with automatic invoicing and tax documentation.",
    iconColor: "text-red-600",
    iconBg: "bg-red-100",
  },
  {
    icon: Calendar,
    title: "Event Management",
    description: "Manage all your events, staff, and communications from one dashboard.",
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-100",
  },
];

/**
 * How it works steps data
 */
const howItWorksSteps = [
  {
    step: 1,
    title: "Post Your Event",
    description: "Describe your event, specify staff requirements, date, and location.",
  },
  {
    step: 2,
    title: "Review Applications",
    description: "Browse qualified staff profiles and select the best fit for your event.",
  },
  {
    step: 3,
    title: "Event Success",
    description: "Your staff shows up prepared, and payments are handled automatically.",
  },
];

const employerFlow = [
  {
    title: "Create a job",
    description: "Enter event details, roles, rates, and headcount in under two minutes.",
  },
  {
    title: "Review suggested workers",
    description: "We surface the best matches ranked by skills, availability, and distance.",
  },
  {
    title: "Send invitations",
    description: "Track confirmations in real time and top up invites when needed.",
  },
  {
    title: "Run the event",
    description: "Once the job is filled, invoices and payouts are ready with one click.",
  },
];

const workerFlow = [
  {
    title: "Complete onboarding",
    description: "Tell us your skills, preferred rates, and travel radius to unlock matches.",
  },
  {
    title: "Publish availability",
    description: "Drop-in calendar slots so employers know when you can work.",
  },
  {
    title: "Review invitations",
    description: "Accept or decline offers, chat with organizers, and confirm arrival details.",
  },
  {
    title: "Get paid",
    description: "Automatic payout stubs and earnings history keep everything transparent.",
  },
];

const faqs = [
  {
    question: "How quickly can I staff an event?",
    answer:
      "Most organizers secure confirmed staff within a few hours. Our matching engine prioritizes workers who are nearby, qualified, and currently available.",
  },
  {
    question: "Do workers need special certifications?",
    answer:
      "We support everything from brand ambassadors to technical crew. You can require certifications (e.g., alcohol service permits) and verify them inside the booking.",
  },
  {
    question: "How are payments handled?",
    answer:
      "Employers approve timesheets and generate invoices directly from the dashboard. Workers receive payout stubs with tax information once events are completed.",
  },
  {
    question: "Is there a mobile experience?",
    answer:
      "Yes. The dashboard is fully responsive so teams can confirm shifts, chat, and check-in from any device on-site.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      {/* Navigation Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white font-bold">
                G
              </div>
              <span className="text-xl font-bold text-gray-900">{APP_CONFIG.name}</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                How it Works
              </Link>
              <Link href="#flows" className="text-gray-600 hover:text-gray-900 transition-colors">
                Flows
              </Link>
              <Link href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">
                FAQ
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/signin">
                Sign In
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">
                Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6">
              🚀 MVP Version - Core Features Available
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              On-Demand Event Staffing
              <span className="text-blue-600"> Marketplace</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Connect event organizers with qualified staff instantly. Book, manage, and pay for event services
              all in one platform. Like Uber, but for event staffing.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" className="px-8" asChild>
                <Link href="/jobs">
                Find Staff
                <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/auth/signup?role=worker">
                Join as Staff
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to staff your events
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Streamline your event staffing process with our comprehensive platform
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={feature.title} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${feature.iconBg}`}>
                        <IconComponent className={`h-6 w-6 ${feature.iconColor}`} />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How {APP_CONFIG.name} Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get your event staffed in three simple steps
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {howItWorksSteps.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
                    {step.step}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-3 text-gray-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Role flows */}
      <section id="flows" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Purpose-built for both sides</h2>
            <p className="mt-4 text-lg text-gray-600">Switch between employer and worker flows to see what the experience looks like.</p>
          </div>

          <Tabs defaultValue="employer" className="mx-auto mt-16 max-w-5xl">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="employer" className="flex items-center justify-center gap-2">
                <Briefcase className="h-4 w-4" /> Employer
              </TabsTrigger>
              <TabsTrigger value="worker" className="flex items-center justify-center gap-2">
                <Workflow className="h-4 w-4" /> Worker
              </TabsTrigger>
            </TabsList>
            <TabsContent value="employer" className="mt-8">
              <div className="grid gap-6 md:grid-cols-2">
                {employerFlow.map((step, index) => (
                  <Card key={step.title}>
                    <CardHeader>
                      <Badge variant="secondary" className="w-fit">Step {index + 1}</Badge>
                      <CardTitle>{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="worker" className="mt-8">
              <div className="grid gap-6 md:grid-cols-2">
                {workerFlow.map((step, index) => (
                  <Card key={step.title}>
                    <CardHeader>
                      <Badge variant="secondary" className="w-fit">Step {index + 1}</Badge>
                      <CardTitle>{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-900 py-24 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple pricing for launch</h2>
            <p className="mt-4 text-lg text-gray-300">Use the fully featured MVP for free while we’re in beta.</p>
          </div>
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid gap-8 lg:grid-cols-3">
              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-xl">Employers</CardTitle>
                  <CardDescription className="text-gray-300">Unlimited job posts and invitations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-200">
                  <p className="text-3xl font-semibold text-white">$0</p>
                  <ul className="space-y-2">
                    <li>✓ Unlimited events</li>
                    <li>✓ Team collaboration</li>
                    <li>✓ Invoicing & analytics</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white text-gray-900">
                <CardHeader>
                  <CardTitle className="text-xl">Workers</CardTitle>
                  <CardDescription>Keep 100% of your hourly rate during beta.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p className="text-3xl font-semibold text-gray-900">$0</p>
                  <ul className="space-y-2">
                    <li>✓ Instant payouts</li>
                    <li>✓ Ratings & badges</li>
                    <li>✓ Availability calendar</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-xl">Admin</CardTitle>
                  <CardDescription className="text-gray-300">Operational tooling for finance teams.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-200">
                  <p className="text-3xl font-semibold text-white">$0</p>
                  <ul className="space-y-2">
                    <li>✓ Invoice generation</li>
                    <li>✓ Payout reconciliation</li>
                    <li>✓ KPI dashboards</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to staff your next event?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Join thousands of event organizers who trust {APP_CONFIG.name} for their staffing needs.
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary" className="px-8" asChild>
                <Link href="/auth/signup">
                Get Started Today
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="text-white hover:text-blue-100" asChild>
                <Link href="#features">
                Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-10">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Frequently asked questions</h2>
              <p className="mt-4 text-lg text-gray-600">Everything you need to know before running your next event.</p>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`} className="rounded-lg border bg-white px-4">
                  <AccordionTrigger className="text-left text-base font-medium text-gray-900">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white font-bold">
                G
              </div>
              <span className="text-xl font-bold">{APP_CONFIG.name}</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="mailto:support@gigs.com" className="hover:text-white">
                support@gigs.com
              </Link>
              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms
              </Link>
            </div>
            <p className="text-gray-400">© {new Date().getFullYear()} {APP_CONFIG.name}. {APP_CONFIG.version}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}