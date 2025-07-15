import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { AtSign, Lock } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function Login() {

//   if (user && !user.hasCompletedSetup) {
//   Navigate("/onboardingForm");
// }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-[90%] max-w-md shadow-xl rounded-2xl">
        <CardHeader className="flex flex-col items-center gap-4 pt-8">
          <img
            src="/logo/owl.png"
            alt="Logo"
            className="w-16 h-16 rounded-full border p-1 bg-white"
          />
          <CardTitle className="text-2xl font-bold text-center">Welcome to LectureMate</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Sign in to continue
          </p>
        </CardHeader>

        <CardContent className="space-y-4 pb-8">
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 border-gray-300 dark:border-gray-700"
          >
            <FcGoogle size={20} />
            Continue with Google
          </Button>

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
            <Separator className="flex-1" />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <AtSign className="absolute left-3 top-3 text-gray-400" size={16} />
              <Input
                id="email"
                placeholder="you@example.com"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
              />
            </div>
          </div>

          <Button className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white">
            Sign in
          </Button>

          <div className="flex justify-between text-sm text-gray-500 mt-4">
            <a href="#" className="hover:underline">Forgot password?</a>
            <a href="#" className="hover:underline">Sign up</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
