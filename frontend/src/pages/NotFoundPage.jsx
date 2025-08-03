import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileX } from "lucide-react";


export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-lg p-8 text-center rounded-3xl shadow-xl bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-800">
        <CardContent>
          {/* Icon to visually represent the error */}
          <div className="flex justify-center mb-6 text-red-500">
            <FileX className="w-16 h-16 animate-bounce" />
          </div>
          
          {/* Main heading for the error code */}
          <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-2">
            404
          </h1>
          
          {/* Friendly message */}
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 font-semibold">
            Oops! The page you're looking for doesn't exist.
          </p>

          {/* Action button to return to the home page */}
          <Link to="/">
            <Button className="px-6 py-3 text-lg font-semibold rounded-full shadow-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-300 transform hover:scale-105">
              Go to Home Page
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
