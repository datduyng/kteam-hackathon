import { WebSearchImage } from "./WebSearchImage";

export interface LearnCarouselItem {
  id: string;
  title: string;
  description: string;
  image_search_query: string;
  content: string;
  full_slide_content: string;
  mainImage?: WebSearchImage;
  images: WebSearchImage[];
}