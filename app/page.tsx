import type { Metadata } from "next";
import { HomeHeader } from "./_components/HomeHeader";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Brian Zhu",
  description: "Explorer, engineer, and creator.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Page Header */}
      <HomeHeader />

      {/* Main Content */}
      <main className="px-6 pb-16 pt-8 lg:px-8 lg:pt-12">
        <div className="mx-auto max-w-5xl">
          {/* Main Card Container */}
          <div className="rounded-2xl p-6 sm:p-8 lg:p-12">
            {/* Hero Section: Two columns on desktop */}
            <section className="mb-12 lg:mb-16">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
                {/* Left Column: Hero Text */}
                <div className="flex-1">
                  {/* Hero Title */}
                  <h1 className="mb-6 text-6xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-8xl lg:text-10xl">
                  Hi there!
                  </h1>

                  {/* Short Intro */}
                  <p className="max-w-lg text-lg leading-relaxed text-zinc-600 sm:text-2xl">
                  Following curiosity wherever it leads, creating through practice, shaping a home full of energy and laughter, and capturing moments that feel alive. <br />
                  Currently enjoying my life in Metro Vancouver, Canada.
                  </p>
                </div>

                {/* Right Column: Profile Image */}
                <div className="flex-shrink-0 lg:w-80">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl">
                    <Image
                      src="https://cdn.dogrod.com/home_heading.jpg"
                      alt="Brian - profile photo"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Body Section: About */}
            <section>
              <h2 className="mb-8 text-4xl font-semibold text-zinc-900">
                My Adventure So Far
              </h2>

              <div className="text-xl">
                {/* Paragraph 1: Life */}
                <div>
                  <p className="mb-4 leading-relaxed text-zinc-600">
                    I spend most of my time balancing family adventures with a
                    few personal hobbies. As a father of 5yo girls, daily life
                    is full of laughter, surprises, and a warm kind of chaos that
                    I enjoy very much. Our corgi, Ramen, tries to join every plan
                    and usually succeeds. I love snowboarding in winter and hiking
                    across British Columbia when the weather is kind, and I occasionally
                    try things that feel exciting, such as bungee jumping. I also enjoy
                    traveling without strict plans, discovering new food, and taking
                    photographs whenever something catches my eye.
                  </p>
                </div>

                {/* Paragraph 2: Work */}
                <div>
                  <p className="leading-relaxed text-zinc-600">
                    I work as a software engineer as well. Over the years, I have
                    led frontend and infrastructure teams and built systems that
                    support large numbers of users. I enjoy creating tools and
                    platforms that make engineering work smoother and more reliable.
                    My interests often shift between software infrastructure, frontend
                    development, and machine learning. If you enjoy these areas too, or
                    simply want to talk about engineering or coffee, I would be glad to
                    meet.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
