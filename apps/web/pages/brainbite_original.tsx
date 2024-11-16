
"use client"

import { Loading } from "@/components/ui/loading";
import { z } from "zod";
import React, { useState, useEffect, useRef, useCallback, use } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { event } from '@/lib/telemetry-client';
import { LearnCarouselItem } from "@/types/LearnCarouselItem";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import MarkdownRender from "@/components/markdown-render"
import Image from "next/image";
import { WebSearchImage } from "@/types/WebSearchImage";
import { toast } from "@/components/ui/use-toast";
import { useMakeCopilotReadable } from "@copilotkit/react-core";
import { LuSearch } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { modals } from "@/components/modal-manager";

type BoookRecommendation = {
  userLearningGuide: string;
  bookRecommendations?: string[];
  keyPointsOfBooks?: string[];
  bookImages?: {
    [key: string]: WebSearchImage;
  };
};

export default function LearnPage() {
  const [carouselItems, setCarouselItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [recommendedBooks, setRecommendedBooks] = useState<BoookRecommendation>({});

  const getCopilotrecommendedBooksContext = () => {
    return {
      userLearningGuide: recommendedBooks?.userLearningGuide || "",
      bookRecommendations: recommendedBooks?.bookRecommendations || [],
      keyPointsOfBooks: recommendedBooks?.keyPointsOfBooks || [],
    } || {};
  }
  useMakeCopilotReadable("Recommended Books for user based on input: " + JSON.stringify(getCopilotrecommendedBooksContext()));
  const getCopilotCarouselContext = () => {
    return {
      learningContentSlides: carouselItems.map((item: {
        title: string;
        content: string;
      }) => item.content).join(", "),
    } || {};
  }
  useMakeCopilotReadable("Recommended learning lesson based on input: " + JSON.stringify(getCopilotCarouselContext()));

  const fetchRecommendedBooks = async (input: {
    query: string;
    answers: Record<string, string>;
  }) => {
    setIsLoading(true);
    toast({
      title: "Fetching recommended books",
      duration: 3000,
    })
    try {
      const response = await fetch(`/api/get-recommended-books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch carousel items');
      }
      const data = await response.json();
      setRecommendedBooks(data.response);
    } catch (error) {
      console.error('Failed to fetch carousel items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCarouselItems = async (input: {
    query: string;
    answers: Record<string, string>;
  }) => {
    setIsLoading(true);
    try {
      toast({
        title: "Loading book details content...",
        duration: 3000,
      })
      const response = await fetch(`/api/build-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch carousel items');
      }
      const data = await response.json();
      setCarouselItems(data.response);
    } catch (error) {
      console.error('Failed to fetch carousel items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return <>
    <main className="flex flex-col items-center">
      <div className="w-full max-w-xl">
        <SearchBar
          isLoading={isLoading}
          onSubmit={(data) => {
            console.log('submit', data);
            if (!isLoading) {
              event('fetchcarouselitems', {
                label: 'learn',
                value: JSON.stringify(data),
                category: 'learn',
              });
              void fetchCarouselItems(data);
            }
          }}
          onBookSubmit={(data) => {
            console.log('submit', data);
            if (!isLoading) {
              event('fetchRecommendedBooks', {
                label: 'learn',
                value: JSON.stringify(data),
                category: 'learn',
              });
              void fetchRecommendedBooks(data);
            }
          }}
        />
        <BookRecommendationSection
          isLoading={isLoading}
          onBookClick={(book) => {
            console.log('clicked book:', book);
            if (!isLoading) {
              event('fetchcarouselitems', {
                label: 'learn',
                value: book,
                category: 'learn',
              });
              void fetchCarouselItems({
                query: `${book} book`,
                answers: {}
              });
            }
          }}
          bookRecommendations={recommendedBooks} />
        <LearnCarousel carouselItems={carouselItems} />
      </div>
    </main>
  </>
}

export const BookRecommendationSection = ({
  bookRecommendations,
  onBookClick,
  isLoading,
}: {
  bookRecommendations?: BoookRecommendation
  onBookClick: (book: string) => void;
  isLoading?: boolean;
}) => {
  return (
    <section>
      <div className="grid grid-cols-3 gap-4">
        {bookRecommendations?.bookRecommendations?.length && bookRecommendations.bookRecommendations.map((book) => (
          <div
            key={book}
            className="flex flex-col items-center cursor-pointer hover:opacity-75"
            onClick={() => {
              if (isLoading) return;
              onBookClick(book)
            }}>
            <Image
              src={bookRecommendations?.bookImages?.[book]?.contentUrl || "https://via.placeholder.com/150"}
              alt={`Cover of ${book}`}
              width={bookRecommendations?.bookImages?.[book]?.width || 150}
              height={bookRecommendations?.bookImages?.[book]?.height || 150}
              className="transition-opacity duration-300 ease-in-out"
            />
            {/* <h3>{book}</h3> */}
          </div>
        ))}
      </div>
      {bookRecommendations?.userLearningGuide && <Card className="mt-4">
        <CardHeader className="mt-8 text-2xl font-semibold tracking-tight scroll-m-20">
          Your Learning Guide
        </CardHeader>
        <CardContent className="">
          {bookRecommendations?.userLearningGuide}
        </CardContent>
      </Card>}
      {bookRecommendations?.keyPointsOfBooks?.length && <Card className="mt-5">
        <CardHeader className="mt-8 text-2xl font-semibold tracking-tight scroll-m-20">
          Personalized Key Learning Points
        </CardHeader>
        <CardContent className="">
          {bookRecommendations?.keyPointsOfBooks?.slice(0, 3)?.map((point, index) => (
            <p key={index}>{point}</p>
          ))}
        </CardContent>
      </Card>}
    </section>
  );
}


export const LearnCarousel = ({
  carouselItems,
}: {
  carouselItems: LearnCarouselItem[];
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [audioCache, setAudioCache] = useState<Map<number, HTMLAudioElement>>(new Map());
  const audioRef = useRef<HTMLAudioElement>(null);
  const [autoplay, setAutoplay] = useState(false);

  const handleAudioEnd = useCallback(() => {
    if (autoplay && api) {
      api.scrollNext();
    }
  }, [autoplay, api]);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  useEffect(() => {
    if (!autoplay) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return;
    }

    const speakCurrentItem = async () => {
      const currentItemText = carouselItems[current - 1]?.full_slide_content || carouselItems[current - 1]?.content;
      if (!currentItemText) return;

      if (audioCache.has(current - 1)) {
        const cachedAudio = audioCache.get(current - 1);
        audioRef.current = cachedAudio;
        audioRef.current.onended = handleAudioEnd;
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      } else {
        const endpoint = `/api/tts`;
        const data = { input: currentItemText };
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioEl = new Audio(audioUrl);
        audioEl.onended = handleAudioEnd;
        setAudioCache(new Map(audioCache.set(current - 1, audioEl)));
        audioRef.current = audioEl;
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      }
    };

    if (autoplay) {
      speakCurrentItem();
    }
  }, [current, carouselItems, audioCache, autoplay, handleAudioEnd]);

  const toggleAutoplay = () => {
    setAutoplay(!autoplay);
  };

  return carouselItems.length > 0 ? (
    <>
      <div className="flex flex-col items-center">
        {current === 1 && (
          <button onClick={toggleAutoplay} className="px-4 py-2 mb-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">
            {autoplay ? "Stop Autoplay" : "Start Autoplay"}
          </button>
        )}
        {current > 1 && autoplay && (
          <div className="flex mb-4 space-x-2">
            <button onClick={() => {
              if (audioRef.current && !audioRef.current.paused) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
              api?.scrollTo(0);
            }} className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700">
              Stop
            </button>
            <button onClick={() => api?.scrollTo(0)} className="px-4 py-2 font-bold text-white bg-yellow-500 rounded hover:bg-yellow-700">
              Reset
            </button>
          </div>
        )}
        <Carousel
          setApi={setApi} className="w-full max-w-xs">
          <CarouselContent>
            {carouselItems.map((item, index) => (
              <CarouselItem key={item.id}>
                <LearnCarouselContent item={item} />
                {index === current - 1 && audioRef.current && (
                  <audio controls src={audioRef.current.src} className="mt-2" />
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="py-2 text-sm text-center text-muted-foreground">
          Slide {current} of {carouselItems?.length || 0}
        </div>
      </div>
    </>
  ) : null;
};

const LearnCarouselContent = ({
  item
}: {
  item: LearnCarouselItem
}) => {
  return <Card>
    <CardContent className="aspect-square">
      <h2 className="pb-2 mt-4 text-3xl font-semibold tracking-tight border-b transition-colors scroll-m-20">
        {item.title}
      </h2>
      {/* <p className="leading-7 [&:not(:first-child)]:mt-6">
      {item.content}
    </p> */}
      {/* @ts-ignore */}
      <MarkdownRender>
        {item.content || ""}
      </MarkdownRender>
      {
        item.mainImage && (<Image
          src={item.mainImage?.contentUrl || "/placeholder.jpg"}
          alt={item.mainImage?.name || item.title}
          width={item.mainImage?.width || 400}
          height={item.mainImage?.height || 300}
          className="object-cover rounded-lg"
        />)
      }
    </CardContent>
    <MarkdownRender>
      {item.full_slide_content || ""}
    </MarkdownRender>
  </Card>
}

function SearchBar({
  onSubmit,
  onBookSubmit,
  isLoading,
}: {
  onSubmit: (data: any) => void;
  onBookSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [query, setQuery] = useState('');
  const [extraQuestions, setExtraQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  useMakeCopilotReadable("User input: " + JSON.stringify({ query, answers }));

  const handleQuerySubmit = async (e: any) => {
    e.preventDefault();
    const response = await fetch(`/api/get-recommended-question?query=${encodeURIComponent(query)}`);
    if (response.ok) {
      const data = await response.json();
      setExtraQuestions(data.response || []);
    }
  };

  const handleAnswerChange = (question, answer) => {
    setAnswers(prev => ({ ...prev, [question]: answer }));
  };

  const handleSubmitAll = (e: any) => {
    e.preventDefault();
    // onSubmit({
    //   query,
    //   answers,
    // });
    onBookSubmit({
      query,
      answers,
    });
  };

  return (
    <div className="flex flex-col justify-center items-center p-4 min-h-screen">
      <main className="w-full max-w-3xl">
        <form onSubmit={handleQuerySubmit} className="mb-8">
          <h1 className="mb-6 text-4xl font-bold">Get Personalized Learning Content from Books</h1>
          <div className="flex overflow-hidden items-center text-gray-900 bg-white rounded shadow-lg">
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} className="px-4 py-2 w-full" placeholder="What do you want to learn about?" />
            <button
              disabled={isLoading}
              type="submit" className="flex justify-center items-center px-4 border-l">
              {
                isLoading ? <Loading /> : <LuSearch />
              }

            </button>
          </div>
          <Button
            type="button"
            variant={'link'}
            className="pl-0 text-xs text-gray-500 underline flex-start"
            onClick={() => {
              modals.openConfirmModal({
                children: (<>
                  <div style={{
                    position: 'relative',
                    paddingTop: '62.5%'
                  }}>
                    <iframe
                      src="https://player.vimeo.com/video/926740918?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                      title="BrainBite Hackathon Demo" />
                  </div>
                </>),
                labels: {
                  confirm: "Ok",
                  cancel: "Cancel",
                },
              })
            }}
          >
            How it works?
          </Button>
        </form>
        <section id='extraQuestion'>
          {extraQuestions.length > 0 && (
            <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
              <h2 className="mb-4 text-lg font-semibold">Please provide more information:</h2>
              {extraQuestions.map((question, index) => (
                <div key={index} className="mb-4">
                  <label className="block mb-2">{question}</label>
                  <input type="text" value={answers[question] || ''} onChange={(e) => handleAnswerChange(question, e.target.value)} className="px-4 py-2 w-full bg-gray-700 rounded" />
                </div>
              ))}
              <button
                disabled={isLoading}
                onClick={handleSubmitAll} className="px-4 py-2 mt-4 text-white bg-blue-500 rounded">
                {
                  isLoading ? <Loading /> : "Submit All"
                }
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
