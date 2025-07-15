import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import { StoryCreationProvider } from "@/context/StoryCreationContext";
import { HeaderVisibilityProvider } from "@/context/HeaderVisibilityContext";
import Layout from "@/components/Layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Suspense, lazy } from "react";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const Adventure = lazy(() => import("./pages/Adventure"));
const Learning = lazy(() => import("./pages/Learning"));
const Auth = lazy(() => import("./pages/Auth"));
const SignIn = lazy(() => import("./pages/auth/SignIn"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const MyStories = lazy(() => import("./pages/MyStories"));
const Discover = lazy(() => import("./pages/Discover"));
const StoryViewer = lazy(() => import("./pages/StoryViewer"));
const StoryCreation = lazy(() => import("./pages/StoryCreation"));
const CreateGenre = lazy(() => import("./pages/CreateGenre"));
const CreatePrompt = lazy(() => import("./pages/CreatePrompt"));
const CreateStartingPoint = lazy(() => import("./pages/CreateStartingPoint"));
const CreateCustomize = lazy(() => import("./pages/CreateCustomize"));
const StoryDisplay = lazy(() => import("./pages/StoryDisplay"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Beta = lazy(() => import("./pages/Beta"));
const Admin = lazy(() => import("./pages/Admin"));
const Diagnostics = lazy(() => import("./pages/Diagnostics"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-400 mx-auto"></div>
      <p className="text-white mt-4">Loading TaleForge...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime in v5)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <StoryCreationProvider>
              <HeaderVisibilityProvider>
                <BrowserRouter
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                  }}
                >
                  <div className="min-h-screen relative">
                    {/* Apply the astronaut background */}
                    <div className="scene-bg"></div>
                    <Layout>
                      <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/adventure" element={<Adventure />} />
                          <Route path="/learning" element={<Learning />} />
                          <Route path="/about" element={<About />} />
                          
                          {/* Authentication Routes */}
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/auth/signin" element={<SignIn />} />
                          <Route path="/auth/signup" element={<SignUp />} />
                          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                          
                          {/* Story Creation Flow - wrapped with ErrorBoundary */}
                          <Route path="/create/genre" element={<ErrorBoundary><CreateGenre /></ErrorBoundary>} />
                          <Route path="/create/prompt" element={<ErrorBoundary><CreatePrompt /></ErrorBoundary>} />
                          <Route path="/create/starting-point" element={<ErrorBoundary><CreateStartingPoint /></ErrorBoundary>} />
                          <Route path="/create/customize" element={<ErrorBoundary><CreateCustomize /></ErrorBoundary>} />
                          <Route path="/story/:id" element={<ErrorBoundary><StoryDisplay /></ErrorBoundary>} />
                          
                          {/* Legacy Story Creation - wrapped with ErrorBoundary */}
                          <Route path="/create-story" element={<ErrorBoundary><StoryCreation /></ErrorBoundary>} />
                          
                          <Route 
                            path="/my-stories" 
                            element={<MyStories />} 
                          />
                          <Route path="/discover" element={<Discover />} />
                          <Route path="/pricing" element={<Pricing />} />
                          <Route path="/story-viewer/:id" element={<ErrorBoundary><StoryViewer /></ErrorBoundary>} />
                          <Route path="/beta" element={<Beta />} />
                          <Route 
                            path="/admin" 
                            element={
                              <ProtectedRoute>
                                <Admin />
                              </ProtectedRoute>
                            } 
                          />
                          <Route path="/diagnostics" element={<Diagnostics />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </Layout>
                  </div>
                  <Toaster />
                </BrowserRouter>
              </HeaderVisibilityProvider>
            </StoryCreationProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
