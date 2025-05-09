
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, ArrowLeft, Upload, Check, AlertTriangle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNutrify } from "@/context/NutrifyContext";
import { FoodItem, FoodAlternative } from "@/types/nutrify";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { recognizeFood } from "@/services/FoodRecognitionService";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const CameraCapture = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addFoodItem } = useNutrify();
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognizedFood, setRecognizedFood] = useState<FoodItem | null>(null);
  const [alternatives, setAlternatives] = useState<FoodAlternative[]>([]);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    // Reset states when starting a new capture
    setCapturedImage(null);
    setRecognizedFood(null);
    setAlternatives([]);
    setRecognitionError(null);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCapturedImage(event.target.result.toString());
        setIsCapturing(false);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const openGallery = () => {
    fileInputRef.current?.click();
  };
  
  const analyzeImage = async () => {
    if (!capturedImage) return;
    
    setIsAnalyzing(true);
    setRecognitionError(null);
    
    try {
      const result = await recognizeFood(capturedImage);
      
      if (result.error) {
        setRecognitionError(result.error);
        setRecognizedFood(null);
        setAlternatives([]);
      } else {
        setRecognizedFood(result.mainResult ? {
          ...result.mainResult,
          imageUrl: capturedImage
        } : null);
        setAlternatives(result.alternatives || []);
        
        if (!result.mainResult) {
          setRecognitionError("Could not identify the food. Please try again.");
        }
      }
    } catch (error) {
      console.error("Analysis error:", error);
      setRecognitionError("An unexpected error occurred. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
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
    setAlternatives([]);
    setRecognitionError(null);
    setShowAlternatives(false);
    setIsCapturing(true);
  };
  
  const selectAlternative = (alternative: FoodAlternative) => {
    setRecognizedFood({
      ...alternative,
      id: uuidv4(),
      timestamp: Date.now(),
      imageUrl: capturedImage || undefined
    });
    setShowAlternatives(false);
  };
  
  const handleEditFood = (updates: Partial<FoodItem>) => {
    if (recognizedFood) {
      setRecognizedFood({
        ...recognizedFood,
        ...updates
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-nutrify-light pb-20">
      <div className="bg-white p-4 shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft />
          </Button>
          <h1 className="text-xl font-semibold ml-2">Food Snap</h1>
        </div>
      </div>
      
      <div className="pt-16 px-4">
        {!isCapturing && !capturedImage && (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <Card className="w-full max-w-md shadow-md">
              <CardContent className="p-6 text-center">
                <Camera className="mx-auto h-16 w-16 text-nutrify-teal mb-4" />
                <h2 className="text-xl font-semibold mb-2">Ready to capture your food?</h2>
                <p className="text-muted-foreground mb-6">
                  Position your camera so all food items are clearly visible
                </p>
                <div className="space-y-3">
                  <Button 
                    className="bg-nutrify-teal hover:bg-nutrify-teal/90 w-full" 
                    onClick={startCapture}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Open Camera
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={openGallery}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
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
              <div className="absolute inset-0 border-2 border-nutrify-teal rounded-lg"></div>
              
              {/* Camera guidance overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3/4 h-3/4 border-2 border-dashed border-white/70 rounded-lg flex items-center justify-center">
                  <p className="text-white text-sm bg-black/50 p-2 rounded">
                    Center food in this area
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex w-full max-w-md space-x-2">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => setIsCapturing(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button 
                className="bg-nutrify-teal hover:bg-nutrify-teal/90 flex-1"
                onClick={capturePhoto}
              >
                <Camera className="mr-2 h-4 w-4" />
                Capture
              </Button>
            </div>
          </div>
        )}
        
        {capturedImage && !recognizedFood && !recognitionError && (
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-md aspect-square bg-black rounded-lg overflow-hidden mb-4">
              <img 
                src={capturedImage} 
                alt="Captured food" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {isAnalyzing ? (
              <Card className="w-full max-w-md shadow-md p-6">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nutrify-teal mb-4"></div>
                  <p className="text-center">
                    Analyzing your food...<br />
                    <span className="text-sm text-muted-foreground">
                      Our AI is identifying ingredients and nutrition
                    </span>
                  </p>
                </div>
              </Card>
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
        
        {recognitionError && (
          <div className="flex flex-col items-center">
            <Card className="w-full max-w-md shadow-md mb-4">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-red-100 p-3">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mt-4">Recognition Failed</h3>
                <p className="text-muted-foreground mt-2 mb-6">{recognitionError}</p>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={resetCamera}
                  >
                    Try Another Photo
                  </Button>
                  <Button 
                    onClick={() => navigate('/search')}
                  >
                    Search Food Instead
                  </Button>
                </div>
              </CardContent>
            </Card>
            <img 
              src={capturedImage || ''} 
              alt="Food" 
              className="w-full max-w-md rounded-lg opacity-50"
            />
          </div>
        )}
        
        {recognizedFood && (
          <div className="flex flex-col items-center">
            <Card className="w-full max-w-md shadow-md mb-4">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-xl font-semibold mr-2">{recognizedFood.name}</h2>
                      {recognizedFood.confidence && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {Math.round(recognizedFood.confidence)}% match
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">{recognizedFood.portion}</p>
                  </div>
                  <span className="font-bold text-xl">{recognizedFood.calories} kcal</span>
                </div>

                {/* Editable fields */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm text-muted-foreground">Food name</label>
                    <input 
                      type="text"
                      value={recognizedFood.name}
                      onChange={(e) => handleEditFood({ name: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <label className="text-sm text-muted-foreground">Calories</label>
                      <input 
                        type="number"
                        value={recognizedFood.calories}
                        onChange={(e) => handleEditFood({ calories: parseInt(e.target.value) || 0 })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-muted-foreground">Portion</label>
                      <input 
                        type="text"
                        value={recognizedFood.portion}
                        onChange={(e) => handleEditFood({ portion: e.target.value })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-blue-100 rounded">
                      <p className="text-sm text-muted-foreground">Protein</p>
                      <input 
                        type="number" 
                        value={recognizedFood.protein}
                        onChange={(e) => handleEditFood({ protein: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center p-1 border rounded font-medium"
                      />
                      <span className="text-xs">g</span>
                    </div>
                    <div className="text-center p-2 bg-green-100 rounded">
                      <p className="text-sm text-muted-foreground">Carbs</p>
                      <input 
                        type="number"
                        value={recognizedFood.carbs}
                        onChange={(e) => handleEditFood({ carbs: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center p-1 border rounded font-medium"
                      />
                      <span className="text-xs">g</span>
                    </div>
                    <div className="text-center p-2 bg-yellow-100 rounded">
                      <p className="text-sm text-muted-foreground">Fat</p>
                      <input 
                        type="number"
                        value={recognizedFood.fat}
                        onChange={(e) => handleEditFood({ fat: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center p-1 border rounded font-medium"
                      />
                      <span className="text-xs">g</span>
                    </div>
                  </div>
                </div>
                
                {alternatives.length > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full mb-3"
                      >
                        See Alternatives ({alternatives.length})
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0">
                      <div className="p-1 max-h-[300px] overflow-y-auto">
                        {alternatives.map((alt) => (
                          <div 
                            key={alt.id}
                            className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                            onClick={() => selectAlternative(alt)}
                          >
                            <div className="flex justify-between">
                              <span className="font-medium">{alt.name}</span>
                              <span>{alt.calories} kcal</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{alt.portion}</span>
                              <span>{Math.round(alt.confidence)}% match</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    className="bg-nutrify-teal hover:bg-nutrify-teal/90" 
                    onClick={saveFood}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Add to Today's Log
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetCamera}
                  >
                    Take Another Photo
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="w-full max-w-md mb-4">
              <img 
                src={capturedImage || ''} 
                alt={recognizedFood.name} 
                className="w-full rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraCapture;
