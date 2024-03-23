"use client"

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form"
import { Loading } from "@/components/ui/loading";
import { z } from "zod";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { LearnCarouselItem } from "@/types/LearnCarouselItem";
import { Card, CardContent } from "@/components/ui/card";
import MarkdownRender from "@/components/markdown-render"
import Image from "next/image";

const form = z.object({
  learnTopic: z.string().nonempty(),
})
export default function LearnPage() {
  const [carouselItems, setCarouselItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCarouselItems = async (topic: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/build-lesson?query=${encodeURIComponent(topic)}`, {
        method: 'GET',
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
        <AutoForm
          className="mt-4"
          formSchema={form} onSubmit={(data) => {
            console.log('submit', data);
            if (!isLoading) {
              void fetchCarouselItems(data.learnTopic);
            }
          }}>
          <AutoFormSubmit
            // type="button"
            disabled={isLoading}>
            {isLoading ? <Loading /> : 'Learn'}
          </AutoFormSubmit>
        </AutoForm>
        <LearnCarousel carouselItems={carouselItems} />
      </div>
    </main>
  </>
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

  return (
    <div className="flex flex-col items-center">
      {current === 1 && (
        <button onClick={toggleAutoplay} className="px-4 py-2 mb-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">
          {autoplay ? "Stop Autoplay" : "Start Autoplay"}
        </button>
      )}
      {current > 1 && autoplay && (
        <div className="flex mb-4 space-x-2">
          <button onClick={() => api?.scrollTo(0)} className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700">
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
  );
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