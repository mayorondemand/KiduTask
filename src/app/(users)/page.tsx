"use client";
import dominos from "@/assets/featured-icon/dominos.svg";
import mtn from "@/assets/featured-icon/mtn.svg";
import creatorImage from "@/assets/hero/creator.png";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FlipWords } from "@/components/ui/flip-words";
import { useColumnCount } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Autoscroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";
import {
  Award,
  BanknoteArrowUp,
  CheckIcon,
  Clock,
  Eye,
  Megaphone,
  Palette,
  Play,
  Settings,
  Shield,
  Star,
  Target,
  User2,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  IoBarChart,
  IoCheckmarkCircle,
  IoFlash,
  IoHeadset,
  IoLockClosed,
  IoLogoTiktok,
  IoPeople,
  IoPricetag,
  IoRepeat,
  IoShieldCheckmark,
  IoSparkles,
} from "react-icons/io5";

const heroSamples = [
  {
    id: 1,
    image: "/hero-videos/1.mp4",
  },
  {
    id: 2,
    image: "/hero-videos/2.mp4",
  },
  {
    id: 3,
    image: "/hero-videos/3.mp4",
  },
  {
    id: 4,
    image: "/hero-videos/4.mp4",
  },
  {
    id: 5,
    image: "/hero-videos/5.mp4",
  },
  {
    id: 6,
    image: "/hero-videos/6.mp4",
  },
  {
    id: 7,
    image: "/hero-videos/7.mp4",
  },
  {
    id: 8,
    image: "/hero-videos/8.mp4",
  },
];

const contentTypes = [
  "Instagram Reels",
  "UGC Creators",
  "TikTok Shop",
  "YouTube Shorts",
  "Facebook Reels",
  "Threads",
  "Twitter",
  "LinkedIn",
  "Snapchat",
  "AI Creators",
  "Social Media Influencers",
  "Vloggers",
  "Content Creators",
  "Video Creators",
  "Audio Creators",
  "Podcast Creators",
  "Bloggers",
];

const ourFeatures = [
  {
    title: "Verified Creators",
    icon: IoCheckmarkCircle,
  },
  {
    title: "Performance Tracking",
    icon: IoBarChart,
  },
  {
    title: "Quality Guarantee",
    icon: IoShieldCheckmark,
  },
  {
    title: "Fast Turnaround",
    icon: IoFlash,
  },
  {
    title: "Affordable Pricing",
    icon: IoPricetag,
  },
  {
    title: "AI Matching",
    icon: IoSparkles,
  },
  {
    title: "Secure Payments",
    icon: IoLockClosed,
  },
  {
    title: "Unlimited Revisions",
    icon: IoRepeat,
  },
  {
    title: "Dedicated Support",
    icon: IoHeadset,
  },
  {
    title: "Diverse Creators",
    icon: IoPeople,
  },
];

const featuredLogos = [
  {
    id: 1,
    image: dominos,
    name: "Brand 1",
  },
  {
    id: 2,
    image: mtn,
    name: "Brand 2",
  },
  {
    id: 3,
    image: dominos,
    name: "Brand 3",
  },
  {
    id: 4,
    image: mtn,
    name: "Brand 4,",
  },
  {
    id: 5,
    image: dominos,
    name: "Brand 5",
  },
  {
    id: 6,
    image: mtn,
    name: "Brand 6",
  },
  {
    id: 7,
    image: dominos,
    name: "Brand 7",
  },
  {
    id: 8,
    image: mtn,
    name: "Brand 8",
  },
  {
    id: 9,
    image: dominos,
    name: "Brand 9",
  },
  {
    id: 11,
    image: mtn,
    name: "Brand 11",
  },
  {
    id: 12,
    image: dominos,
    name: "Brand 12",
  },
  {
    id: 13,
    image: mtn,
    name: "Brand 13",
  },
  {
    id: 14,
    image: dominos,
    name: "Brand 14",
  },
  {
    id: 15,
    image: mtn,
    name: "Brand 15",
  },
];

const brandsSay = [
  {
    id: 1,
    video: "/hero-videos/9.mp4",
    name: "Brand 1",
    logoLink: dominos,
  },
  {
    id: 2,
    video: "/hero-videos/1.mp4",
    name: "Brand 2",
    logoLink: mtn,
  },
  {
    id: 3,
    video: "/hero-videos/2.mp4",
    name: "Brand 3",
    logoLink: dominos,
  },
  {
    id: 4,
    video: "/hero-videos/3.mp4",
    name: "Brand 4",
    logoLink: mtn,
  },
  {
    id: 5,
    video: "/hero-videos/4.mp4",
    name: "Brand 5",
    logoLink: mtn,
  },
  {
    id: 6,
    video: "/hero-videos/5.mp4",
    name: "Brand 6",
    logoLink: dominos,
  },
  {
    id: 7,
    video: "/hero-videos/6.mp4",
    name: "Brand 7",
    logoLink: mtn,
  },
  {
    id: 8,
    video: "/hero-videos/7.mp4",
    name: "Brand 8",
    logoLink: dominos,
  },
];

const howItWorksSteps = [
  {
    id: 1,
    title: "Post Your Campaign",
    description:
      "Describe your campaign, set your budget, and specify the type of creators and content you need. Our simple form makes it easy to get started in minutes.",
    icons: [Target, Settings, Palette],
    image: "/hero-images/howto1.webp",
  },
  {
    id: 2,
    title: "Creators Apply & Perform Tasks",
    description:
      "Vetted creators discover your campaign, apply, and get started on your tasks. They produce authentic UGC content based on your requirements.",
    icons: [Users, Zap, Star],
    image: "/hero-images/howto2.webp",
  },
  {
    id: 3,
    title: "Submit, Review & Approve Content",
    description:
      "Creators submit their completed content for your review. Request revisions if needed, then approve the work when you’re satisfied.",
    icons: [CheckIcon, Eye, Clock],
    image: "/hero-images/howto3.webp",
  },
  {
    id: 4,
    title: "Secure Payment & Delivery",
    description:
      "Once you approve the content, payment is released to the creator..",
    icons: [BanknoteArrowUp, Shield, Award],
    image: "/hero-images/howto4.webp",
  },
];

function BrandsCarousel({
  selectedIndex,
  setSelectedIndex,
}: {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    // loop: true,
    align: "start",
  });
  const [isPlaying, setIsPlaying] = React.useState(false);
  const videoRefs = React.useRef<(HTMLVideoElement | null)[]>([]);

  const handleSlideClick = (index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
    setSelectedIndex(index);

    // Pause all other videos
    videoRefs.current.forEach((video, i) => {
      if (video && i !== index) {
        video.pause();
      }
    });

    // Play the selected video
    const selectedVideo = videoRefs.current[index];
    if (selectedVideo) {
      selectedVideo.play();
      setIsPlaying(true);
    }
  };

  React.useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect(); // Initialize

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, setSelectedIndex]);

  return (
    <div className="embla overflow-hidden" ref={emblaRef}>
      <div className="embla__container flex ml-4 pl-4">
        {brandsSay.map((brand, index) => (
          // biome-ignore lint/a11y/noStaticElementInteractions: <Need to fix this>
          <div
            role="presentation"
            key={brand.id}
            className={`embla__slide flex-shrink-0 flex-grow-0 basis-[35%] px-1 transition-transform -ml-10 duration-300 ease-out cursor-pointer ${
              index === selectedIndex ? "scale-90" : "scale-80"
            }`}
            onClick={() => handleSlideClick(index)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleSlideClick(index);
              }
            }}
          >
            <div className="flex flex-col gap-2 relative">
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={brand.video}
                className={cn(
                  "w-full h-full object-cover rounded-2xl",
                  index !== selectedIndex && "blur-xs opacity-50",
                )}
                loop
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`bg-black/50 rounded-full p-3 transition-opacity duration-300 ${
                    index === selectedIndex && isPlaying
                      ? "opacity-0"
                      : "opacity-100"
                  }`}
                >
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const columnCount = useColumnCount();

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Hero Section */}
      <section className="pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="text-sm text-gray-600 mb-4">
              <div className="flex mb-4 items-center justify-center gap-2">
                <span className=" text-lg font-medium">Available in:</span>
                <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:size-12!">
                  <Avatar>
                    <AvatarImage src="countries/ng.svg" alt="Nigeria" />
                    <AvatarFallback>NG</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarImage src="countries/gh.svg" alt="Ghana" />
                    <AvatarFallback>GH</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tighter tracking-tighter transition-all">
                All-in-one UGC
                <br />
                creator marketplace to
                <br />
                hire{" "}
                <FlipWords
                  className="text-primary"
                  words={["brand ambassadors", "influencers", "creators"]}
                />
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                We offer an easy all-in-one platform to find, hire and manage
                UGC creators for your brand.
              </p>
              <Button size="lg" className="text-white px-8 py-3 text-lg">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Full width video section */}
      <section>
        <div className="">
          <Carousel
            className=""
            plugins={[
              Autoscroll({
                speed: 0.5,
                stopOnFocusIn: true,
                stopOnInteraction: false,
              }),
            ]}
            opts={{
              loop: true,
            }}
          >
            <CarouselContent className="p-4 -ml-2">
              {heroSamples.map((sample) => (
                <CarouselItem key={sample.id} className="pl-2 basis-1/6">
                  <video
                    src={sample.image}
                    className="rounded-3xl"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <Carousel
            className=""
            plugins={[
              Autoscroll({
                speed: 0.5,
                direction: "backward",
                stopOnFocusIn: true,
                stopOnInteraction: false,
              }),
            ]}
            opts={{
              loop: true,
            }}
          >
            <CarouselContent className="p-4 -ml-3">
              {contentTypes.map((contentType) => (
                <CarouselItem key={contentType} className="pl-3 basis-auto">
                  <div className="flex items-center justify-center border border-gray-300 p-2 rounded-full px-3">
                    <p className="font-semibold text-sm text-gray-600">
                      {contentType}
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      {/* Featured by section */}
      <section>
        <div className="flex flex-wrap my-10 bg-gray-50 justify-between gap-24  gap-y-10 p-10">
          {featuredLogos.map((logo) => (
            <div
              key={logo.id}
              className="flex w-24 h-6 items-center justify-center relative"
            >
              <Image
                src={logo.image}
                alt={logo.name}
                className="object-contain text-gray-50"
                fill
              />
            </div>
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20" id="about">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-4 text-primary gap-8 pb-20">
            <div className="flex items-center gap-4 justify-center">
              <div className="p-4 bg-primary/10 rounded-lg flex items-center justify-center">
                <BanknoteArrowUp size={28} />
              </div>
              <div className="flex flex-col">
                <div className="text-2xl font-bold  mb-1">₦2M+</div>
                <div className="text-gray-600">Total Paid</div>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <div className="p-4 bg-primary/10 rounded-lg flex items-center justify-center">
                <User2 size={28} />
              </div>
              <div className="flex flex-col">
                <div className="text-2xl font-bold  mb-1">10K+</div>
                <div className="text-gray-600">Active Users</div>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <div className="p-4 bg-primary/10 rounded-lg flex items-center justify-center">
                <Megaphone size={28} />
              </div>
              <div className="flex flex-col">
                <div className="text-2xl font-bold  mb-1">1000+</div>
                <div className="text-gray-600">Active Campaigns</div>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <div className="p-4 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckIcon size={28} />
              </div>
              <div className="flex flex-col">
                <div className="text-2xl font-bold  mb-1">98%</div>
                <div className="text-gray-600">Tasks Completed</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-primary text-white p-4 rounded-2xl">
              <div className="h-40"></div>
              <div className="flex -space-x-1">
                <div className="bg-primary size-11 rounded-full ring-1 ring-white flex items-center justify-center mb-4">
                  <IoLogoTiktok size={20} className="text-white" />
                </div>
                <div className="bg-primary size-11 rounded-full ring-1 ring-white flex items-center justify-center mb-4">
                  <IoLogoTiktok size={20} className="text-white" />
                </div>
                <div className="bg-primary size-11 rounded-full ring-1 ring-white flex items-center justify-center mb-4">
                  <IoLogoTiktok size={20} className="text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Vetted Creators</h3>
              <p className="text-white/90">
                All creators are thoroughly vetted and verified to ensure
                quality.
              </p>
            </div>
            <div className="bg-white shadow-sm p-4 rounded-2xl">
              <div className="h-40"></div>
              <div className="flex -space-x-1">
                <div className="bg-primary size-11 rounded-full ring-2 ring-white flex items-center justify-center mb-4">
                  <IoLogoTiktok size={20} className="text-white" />
                </div>
                <div className="bg-primary size-11 rounded-full ring-2 ring-white flex items-center justify-center mb-4">
                  <IoLogoTiktok size={20} className="text-white" />
                </div>
                <div className="bg-primary size-11 rounded-full ring-2 ring-white flex items-center justify-center mb-4">
                  <IoLogoTiktok size={20} className="text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-2">
                Performance Tracking
              </h3>
              <p className="text-gray-600">
                Track campaign performance with detailed analytics and insights.
              </p>
            </div>
            <div className="bg-white shadow-sm p-4 rounded-2xl">
              <div className="h-40"></div>
              <div className="flex -space-x-1">
                <div className="bg-primary size-11 rounded-full ring-2 ring-white flex items-center justify-center mb-4">
                  <IoLogoTiktok size={20} className="text-white" />
                </div>
                <div className="bg-primary size-11 rounded-full ring-2 ring-white flex items-center justify-center mb-4">
                  <IoLogoTiktok size={20} className="text-white" />
                </div>
                <div className="bg-primary size-11 rounded-full ring-2 ring-white flex items-center justify-center mb-4">
                  <IoLogoTiktok size={20} className="text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">
                100% satisfaction guarantee with unlimited revisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why else Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl bg-white shadow-sm rounded-4xl mx-auto p-10">
          <div className="grid  lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl tracking-tight font-bold text-gray-900 mb-8">
                Why choose us?
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Here are some more reasons why you should choose Kuditask
              </p>
              <div className="grid grid-cols-2 gap-4">
                {ourFeatures.map((feature) => (
                  <div key={feature.title} className="flex items-center gap-2">
                    <feature.icon className="w-6 text-primary h-6" />
                    <span className="font-semibold text-lg text-gray-600">
                      {feature.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-square">
              <Image
                src={creatorImage}
                alt="Happy creator"
                className="w-full rounded-2xl object-cover"
                fill
              />
            </div>
          </div>
        </div>
      </section>

      {/* What our brands say Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto items-center flex">
          <div className="flex text-right mr-6 flex-col w-full gap-4">
            <h2 className="text-4xl tracking-tight  font-bold text-gray-900 mb-4">
              What our brands say about us
            </h2>
            <div className="flex flex-col items-end gap-2">
              <div className="relative size-14 rounded-lg ring-1 ring-gray-200">
                <Image
                  src={brandsSay[selectedIndex].logoLink}
                  alt={brandsSay[selectedIndex].name}
                  className="object-container"
                  fill
                />
              </div>
              <span className="text-2xl font-bold text-gray-500">
                {brandsSay[selectedIndex].name}
              </span>
            </div>
            <p className="text-gray-500 text-lg font-semibold mb-16">
              Hear from our brands about their experience with Kuditask
            </p>
          </div>
          <BrandsCarousel
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
          />
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            How it works?
          </h2>
          <p className="text-center text-gray-600 mb-16">
            From campaign creation to scaling your brand - here&apos;s your
            complete journey
          </p>
          <Carousel
            className="max-w-6xl mx-auto"
            opts={{
              align: "center",
              loop: true,
            }}
          >
            <CarouselContent>
              {howItWorksSteps.map((step) => (
                <CarouselItem key={step.id} className="px-4">
                  <div className="bg-white flex rounded-4xl gap-4 p-8 px-12  border border-gray-100">
                    <div className="py-20 w-2/5">
                      <div className=" -space-x-2 flex items-center mb-6">
                        {step.icons.map((IconComponent, index) => (
                          <div
                            key={index}
                            className="bg-primary justify-center size-11 rounded-full ring-1 ring-white flex items-center mb-4"
                          >
                            <IconComponent size={20} className="text-white" />
                          </div>
                        ))}
                      </div>
                      <h3 className="text-3xl tracking-tight font-bold mb-4 text-gray-900">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-lg">
                        {step.description}
                      </p>
                    </div>
                    <div className="relative rounded-xl overflow-clip w-3/5">
                      <Image
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover"
                        fill
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-7" />
            <CarouselNext className="-right-2.5" />
          </Carousel>
          <div className="text-center mt-4">
            <Button size="lg">Get Started</Button>
          </div>
        </div>
      </section>

      {/* Meet our creators Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Meet our creators
          </h2>
          <div className="grid gap-3 mb-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {heroSamples.map((creator, index) => {
              // Calculate if this item should be staggered based on column position
              const columnPosition = index % columnCount;
              const shouldStagger = columnPosition % 2 === 1;

              return (
                <div
                  key={creator.id}
                  className={cn(
                    "aspect-[9/16] rounded-2xl",
                    shouldStagger && "mt-3",
                  )}
                >
                  <video
                    autoPlay
                    loop
                    muted
                    src={creator.image}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-3xl mb-6">and 250,000+ more...</p>
            <Button size="lg">Browse Creators</Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-center text-gray-600 mb-16">
            Everything you need to know about Kuditask
          </p>
          <div>
            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  question: "How does Kuditask work?",
                  answer:
                    "Kuditask connects brands with vetted UGC creators through our AI-powered matching system. Simply create a campaign, get matched with creators, and receive high-quality content.",
                },
                {
                  question: "What types of content can creators make?",
                  answer:
                    "Our creators specialize in various content types including product reviews, unboxing videos, tutorials, lifestyle content, and social media posts across all major platforms.",
                },
                {
                  question: "How quickly can I receive content?",
                  answer:
                    "Most content is delivered within 3-7 business days, depending on the complexity of your requirements and the number of creators involved in your campaign.",
                },
                {
                  question: "Can I request revisions?",
                  answer:
                    "Yes, we offer unlimited revisions until you're completely satisfied with the content. Our creators are committed to delivering exactly what your brand needs.",
                },
                {
                  question: "Are the creators vetted?",
                  answer:
                    "All creators go through a thorough vetting process including portfolio review, background checks, and quality assessments to ensure brand safety and content quality.",
                },
              ].map((faq) => (
                <AccordionItem
                  key={faq.question}
                  value={faq.question}
                  className="bg-white rounded-2xl border border-gray-200"
                >
                  <AccordionTrigger className="text-lg font-semibold text-gray-900 px-6 py-4 rounded-2xl">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 px-6 pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Signup with Kuditask today!
          </p>
          <Link
            href="/signup"
            className={buttonVariants({ variant: "secondary", size: "lg" })}
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
