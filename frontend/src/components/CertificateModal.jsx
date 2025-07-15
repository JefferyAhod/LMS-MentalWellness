import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download, Share2, Award } from "lucide-react";

export default function CertificateModal({ course, user, onClose }) {
  const generateCertificate = () => {
    // Create a simple certificate design
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Completion', canvas.width / 2, 120);

    // Divider
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.lineTo(650, 150);
    ctx.stroke();

    // Student name
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(user.full_name, canvas.width / 2, 220);

    // Course name
    ctx.fillStyle = '#1e293b';
    ctx.font = '24px Arial';
    ctx.fillText(`has successfully completed`, canvas.width / 2, 270);
    ctx.font = 'bold 24px Arial';
    ctx.fillText(course.title, canvas.width / 2, 320);

    // Instructor
    ctx.font = '18px Arial';
    ctx.fillText(`Instructor: ${course.instructor_name}`, canvas.width / 2, 370);

    // Date
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, canvas.width / 2, 420);

    // LectureMate branding
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Arial';
    ctx.fillText('LectureMate Learning Platform', canvas.width / 2, 500);

    return canvas.toDataURL();
  };

  const downloadCertificate = () => {
    const certificateUrl = generateCertificate();
    const link = document.createElement('a');
    link.download = `${course.title}_certificate.png`;
    link.href = certificateUrl;
    link.click();
  };

  const shareCertificate = () => {
    if (navigator.share) {
      navigator.share({
        title: `Certificate of Completion - ${course.title}`,
        text: `I've successfully completed ${course.title} on LectureMate!`,
        url: window.location.href
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-800">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Congratulations!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  You've completed the course
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Certificate Preview */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8 mb-6 text-center border-2 border-blue-200 dark:border-blue-800">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Certificate of Completion
              </h3>
              <div className="w-24 h-1 bg-blue-500 mx-auto mb-4"></div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              This certifies that
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {user.full_name}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              has successfully completed
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {course.title}
            </p>
            
            <div className="flex justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <p>Instructor</p>
                <p className="font-medium">{course.instructor_name}</p>
              </div>
              <div>
                <p>Date</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                LectureMate Learning Platform
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button onClick={downloadCertificate} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Certificate
            </Button>
            <Button variant="outline" onClick={shareCertificate} className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Achievement
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}