import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MapPin, Star, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white font-bold">
                G
              </div>
              <span className="text-xl font-bold text-gray-900">GIGS</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                How it Works
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button size="sm">
                Get Started
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
              🚀 MVP Version - Core Features Only
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
              <Button size="lg" className="px-8">
                Find Staff
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                Join as Staff
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
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Instant Staff Matching</CardTitle>
                  <CardDescription>
                    Find qualified event staff in your area within minutes, not days.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Real-time Booking</CardTitle>
                  <CardDescription>
                    Book staff for your events with live availability and instant confirmation.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Location-based</CardTitle>
                  <CardDescription>
                    Automatically match with staff based on event location and proximity.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                    <Star className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle>Ratings & Reviews</CardTitle>
                  <CardDescription>
                    Make informed decisions with comprehensive staff ratings and reviews.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                    <CheckCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle>Secure Payments</CardTitle>
                  <CardDescription>
                    Handle payments securely with automatic invoicing and tax documentation.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle>Event Management</CardTitle>
                  <CardDescription>
                    Manage all your events, staff, and communications from one dashboard.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How GIGS Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get your event staffed in three simple steps
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
                  1
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">Post Your Event</h3>
                <p className="mt-3 text-gray-600">
                  Describe your event, specify staff requirements, date, and location.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
                  2
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">Review Applications</h3>
                <p className="mt-3 text-gray-600">
                  Browse qualified staff profiles and select the best fit for your event.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
                  3
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">Event Success</h3>
                <p className="mt-3 text-gray-600">
                  Your staff shows up prepared, and payments are handled automatically.
                </p>
              </div>
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
              Join thousands of event organizers who trust GIGS for their staffing needs.
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary" className="px-8">
                Get Started Today
              </Button>
              <Button size="lg" variant="ghost" className="text-white hover:text-blue-100">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white font-bold">
                G
              </div>
              <span className="text-xl font-bold">GIGS</span>
            </div>
            <p className="text-gray-400">
              © 2024 GIGS. MVP Version - Core features only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}