
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNutrify } from "@/context/NutrifyContext";
import { FoodItem } from "@/types/nutrify";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";

const CameraCapture = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addFoodItem } = useNutrify();
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognizedFood, setRecognizedFood] = useState<FoodItem | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Setup camera stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const setupCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        toast({
          title: "Camera Error",
          description: "Could not access your camera. Please check permissions.",
          variant: "destructive"
        });
      }
    };
    
    if (isCapturing && !capturedImage) {
      setupCamera();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCapturing, capturedImage, toast]);
  
  const startCapture = () => {
    setIsCapturing(true);
  };
  
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        
        // Stop the camera stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };
  
  const analyzeImage = () => {
    setIsAnalyzing(true);
    
    // In a real app, we would send the image to an AI service
    // For now, we'll simulate a response after a delay
    setTimeout(() => {
      const mockFood: FoodItem = {
        id: uuidv4(),
        name: "Mixed Salad with Grilled Chicken",
        calories: 350,
        protein: 25,
        carbs: 12,
        fat: 18,
        portion: "1 bowl (300g)",
        imageUrl: capturedImage || undefined,
        timestamp: Date.now(),
      };
      
      setRecognizedFood(mockFood);
      setIsAnalyzing(false);
    }, 2000);
  };
  
  const saveFood = () => {
    if (recognizedFood) {
      addFoodItem(recognizedFood);
      toast({
        title: "Food Added",
        description: `${recognizedFood.name} has been added to your log.`
      });
      navigate('/');
    }
  };
  
  const resetCamera = () => {
    setCapturedImage(null);
    setRecognizedFood(null);
    setIsCapturing(true);
  };
  
  return (
    <div className="min-h-screen bg-nutrify-light p-4">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-semibold ml-2">Food Snap</h1>
      </div>
      
      {!isCapturing && !capturedImage && (
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <Card className="w-full max-w-md shadow-md">
            <CardContent className="p-6 text-center">
              <Camera className="mx-auto h-16 w-16 text-nutrify-teal mb-4" />
              <h2 className="text-xl font-semibold mb-2">Ready to capture your food?</h2>
              <p className="text-muted-foreground mb-6">
                Position your camera so all food items are clearly visible
              </p>
              <Button 
                className="bg-nutrify-teal hover:bg-nutrify-teal/90 w-full" 
                onClick={startCapture}
              >
                Open Camera
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      {isCapturing && !capturedImage && (
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-md aspect-square bg-black rounded-lg overflow-hidden mb-4">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="absolute w-full h-full object-cover"
            />
            <div className="absolute top-0 left-0 w-full h-full border-2 border-nutrify-teal rounded-lg"></div>
          </div>
          
          <Button 
            className="bg-nutrify-teal hover:bg-nutrify-teal/90 w-full max-w-md"
            onClick={capturePhoto}
          >
            Capture Food
          </Button>
        </div>
      )}
      
      {capturedImage && !recognizedFood && (
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-md aspect-square bg-black rounded-lg overflow-hidden mb-4">
            <img 
              src={capturedImage} 
              alt="Captured food" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {isAnalyzing ? (
            <div className="text-center w-full max-w-md">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 bg-nutrify-teal/30 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-nutrify-teal/30 rounded w-1/2"></div>
              </div>
              <p className="mt-3 text-muted-foreground">Analyzing your food...</p>
            </div>
          ) : (
            <div className="flex flex-col w-full max-w-md space-y-2">
              <Button 
                className="bg-nutrify-teal hover:bg-nutrify-teal/90" 
                onClick={analyzeImage}
              >
                Analyze Food
              </Button>
              <Button 
                variant="outline" 
                onClick={resetCamera}
              >
                Retake Photo
              </Button>
            </div>
          )}
        </div>
      )}
      
      {recognizedFood && (
        <div className="flex flex-col items-center">
          <Card className="w-full max-w-md shadow-md mb-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{recognizedFood.name}</h2>
                <span className="font-bold">{recognizedFood.calories} kcal</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-blue-100 rounded">
                  <p className="text-sm text-muted-foreground">Protein</p>
                  <p className="font-medium">{recognizedFood.protein}g</p>
                </div>
                <div className="text-center p-2 bg-green-100 rounded">
                  <p className="text-sm text-muted-foreground">Carbs</p>
                  <p className="font-medium">{recognizedFood.carbs}g</p>
                </div>
                <div className="text-center p-2 bg-yellow-100 rounded">
                  <p className="text-sm text-muted-foreground">Fat</p>
                  <p className="font-medium">{recognizedFood.fat}g</p>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm mb-4">Portion: {recognizedFood.portion}</p>
              
              <div className="flex flex-col space-y-2">
                <Button 
                  className="bg-nutrify-teal hover:bg-nutrify-teal/90" 
                  onClick={saveFood}
                >
                  Add to Today's Log
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetCamera}
                >
                  Retake Photo
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="w-full max-w-md">
            <p className="text-sm text-muted-foreground text-center">
              Not accurate? You can edit details after adding to your log.
            </p>
          </div>
        </div>
      )}
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraCapture;
