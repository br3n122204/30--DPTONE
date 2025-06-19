"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Menu, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import UserProfile from '@/components/UserProfile'
import { useRouter } from 'next/navigation'
import { Skeleton } from "@/components/ui/skeleton"

// Sample slider images data
const sliderImages = [
  {
    id: 1,
    image: "/images/slider/image1.jpg",
    title: "Street Culture",
    subtitle: "Authentic streetwear for fashion",
  },
  {
    id: 2,
    image: "/images/slider/image2.jpg",
    title: "Urban Style",
    subtitle: "Express your individuality",
  },
  {
    id: 3,
    image: "/images/slider/image3.jpg",
    title: "Modern Fashion",
    subtitle: "Contemporary designs for today",
  },
  {
    id: 4,
    image: "/images/slider/image4.jpg",
    title: "Street Heat",
    subtitle: "Stay raw. Stay real.",
  },
]

// Sample products data with type
interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  backImage: string;
}

const featuredProducts: Product[] = [
  {
    id: 1,
    name: "Strap White Tee",
    price: "₱550.00",
    image: "/images/products/strap-white-tee.jpg",
    backImage: "/images/products/strap-white-tee-back.jpg",
  },
  {
    id: 2,
    name: "Richboyz White Tee",
    price: "₱550.00",
    image: "/images/products/richboyz-white-tee.jpg",
    backImage: "/images/products/richboyz-white-tee-back.jpg",
  },
  {
    id: 3,
    name: "Charlotte Folk White Tee",
    price: "₱550.00",
    image: "/images/products/charlottefolk-white-tee.jpg",
    backImage: "/images/products/charlottefolk-white-tee-back.jpg",
  },
  {
    id: 4,
    name: "Strap Black Tee",
    price: "₱550.00",
    image: "/images/products/strap-black-tee.jpg",
    backImage: "/images/products/strap-black-tee-back.jpg",
  },
  {
    id: 5,
    name: "MN+LA Black Tee",
    price: "₱550.00",
    image: "/images/products/mnla-black-tee.jpg",
    backImage: "/images/products/mnla-black-tee-back.jpg",
  },
  {
    id: 6,
    name: "Richboyz Black Tee",
    price: "₱550.00",
    image: "/images/products/richboyz-black-tee.jpg",
    backImage: "/images/products/richboyz-black-tee-back.jpg",
  },
  {
    id: 7,
    name: "MN+LA White Tee",
    price: "₱550.00",
    image: "/images/products/mnla-white-tee.jpg",
    backImage: "/images/products/mnla-white-tee-back.jpg",
  },
  {
    id: 8,
    name: "Charlotte Folk Black Tee",
    price: "₱550.00",
    image: "/images/products/charlottefolk-black-tee.jpg",
    backImage: "/images/products/charlottefolk-black-tee-back.jpg",
  },
]

function ImageSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
  }

  return (
    <div className="relative w-full h-[600px] overflow-hidden bg-gray-100">
      {/* Slider Images */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {sliderImages.map((slide) => (
          <div key={slide.id} className="relative w-full h-full flex-shrink-0">
            {/* Blurred background image */}
            <Image
              src={slide.image}
              alt={slide.title} 
              fill
              className="object-cover blur-md scale-110"
            />
            {/* Overlay to dim the blurred background */}
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>

            {/* Main, unblurred image (positioned in upper 70%) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[70%] flex items-center justify-center p-4">
              <Image
                src={slide.image}
                alt={slide.title}
                width={500} 
                height={400} 
                className="object-contain max-w-full max-h-full"
              />
            </div>

            {/* Text Overlay (positioned in lower 30%) */}
            <div className="absolute bottom-0 left-0 right-0 h-[30%] flex items-center justify-center text-center p-4 z-20">
              <div>
                <h2 className={`text-4xl font-bold mb-2 text-white`}>{slide.title}</h2>
                <p className={`text-lg opacity-90 text-white`}>{slide.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {sliderImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? "bg-white" : "bg-white bg-opacity-50"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// --- DPTOneFashion Homepage ---
export default function DPTOneFashion() {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)
  const { cartItems, addToCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  // Loading state for demo
  const [loading, setLoading] = useState(false)

  // Memoize product list for performance
  const products = useMemo(() => featuredProducts, [])

  const handleAddToCart = (product: Product) => {
    if (!user) {
      router.push('/login')
      return
    }
    addToCart(product)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Black Side Panels for visual effect */}
      <div className="fixed left-0 top-0 w-16 h-full bg-black z-10" aria-hidden="true"></div>
      <div className="fixed right-0 top-0 w-16 h-full bg-black z-10" aria-hidden="true"></div>

      {/* Main Content Container */}
      <main className="mx-16">
        {/* Image Slider */}
        <ImageSlider />

        {/* Featured Products Section */}
        <section className="py-12" aria-labelledby="featured-products-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="featured-products-heading" className="text-3xl font-bold text-center mb-8">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="list" aria-label="Featured products grid">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-80 w-full rounded-lg" />
                ))
              ) : products.length === 0 ? (
                <div className="col-span-full text-center text-gray-500">No featured products available.</div>
              ) : (
                products.map((product) => (
                  <Card key={product.id} className="overflow-hidden" tabIndex={0} aria-label={product.name}>
                    <CardContent className="p-0">
                      <div
                        className="relative aspect-square"
                        onMouseEnter={() => setHoveredProduct(product.id)}
                        onMouseLeave={() => setHoveredProduct(null)}
                      >
                        <Image
                          src={hoveredProduct === product.id ? product.backImage : product.image}
                          alt={product.name + (hoveredProduct === product.id ? ' back' : ' front')}
                          fill
                          className="object-cover transition-opacity duration-300"
                          sizes="(max-width: 768px) 100vw, 25vw"
                          priority={product.id <= 4}
                          placeholder="blur"
                          blurDataURL="/placeholder.jpg"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.jpg' }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300" />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <p className="text-gray-600">{product.price}</p>
                        <Button
                          onClick={() => handleAddToCart(product)}
                          className="w-full mt-2 bg-black text-white hover:bg-gray-800"
                          aria-label={`Add ${product.name} to cart`}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
