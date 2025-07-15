import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Course } from "@/entities/Course";
import { Enrollment } from "@/entities/Enrollment";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Lock, 
  ArrowLeft, 
  CheckCircle,
  AlertCircle,
  Shield
} from "lucide-react";

export default function PaymentPage() {
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'error', null
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    email: '',
    country: 'US'
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get("courseId");
    if (courseId) {
      loadPaymentData(courseId);
    }
  }, []);

  const loadPaymentData = async (courseId) => {
    try {
      const [courseData, userData] = await Promise.all([
        Course.get(courseId),
        User.me()
      ]);
      setCourse(courseData);
      setUser(userData);
      setCardData(prev => ({ ...prev, email: userData.email, name: userData.full_name }));
    } catch (error) {
      console.error("Error loading payment data:", error);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'number') {
      // Format card number
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    } else if (field === 'expiry') {
      // Format expiry date
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
    } else if (field === 'cvv') {
      // Only allow 3-4 digits
      value = value.replace(/\D/g, '').slice(0, 4);
    }
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const simulatePaymentProcessing = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate 95% success rate
    const isSuccess = Math.random() > 0.05;
    
    if (isSuccess) {
      // Create enrollment
      await Enrollment.create({
        course_id: course.id,
        student_id: user.id,
        progress: 0,
        completed_lectures: []
      });

      // Update course enrollment count
      await Course.update(course.id, {
        total_enrollments: (course.total_enrollments || 0) + 1
      });

      setPaymentStatus('success');
    } else {
      setPaymentStatus('error');
    }
    
    setIsProcessing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (course.price === 0) {
      // Free course - direct enrollment
      await Enrollment.create({
        course_id: course.id,
        student_id: user.id,
        progress: 0,
        completed_lectures: []
      });
      navigate(createPageUrl(`CourseDetail?id=${course.id}`));
    } else {
      await simulatePaymentProcessing();
    }
  };

  if (!course || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Successful!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You're now enrolled in {course.title}. Start learning right away!
            </p>
            <div className="space-y-3">
              <Button 
                className="w-full"
                onClick={() => navigate(createPageUrl(`CourseDetail?id=${course.id}`))}
              >
                Start Learning
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => navigate(createPageUrl("Dashboard"))}
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't process your payment. Please check your card details and try again.
            </p>
            <div className="space-y-3">
              <Button 
                className="w-full"
                onClick={() => setPaymentStatus(null)}
              >
                Try Again
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => navigate(createPageUrl(`CourseDetail?id=${course.id}`))}
              >
                Back to Course
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl(`CourseDetail?id=${course.id}`))}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Complete Your Purchase
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Secure payment powered by industry-leading encryption
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Card Number
                    </label>
                    <Input
                      value={cardData.number}
                      onChange={(e) => handleInputChange('number', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>

                  {/* Expiry and CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expiry Date
                      </label>
                      <Input
                        value={cardData.expiry}
                        onChange={(e) => handleInputChange('expiry', e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CVV
                      </label>
                      <Input
                        value={cardData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cardholder Name
                    </label>
                    <Input
                      value={cardData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={cardData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  {/* Security Notice */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">Secure Payment</span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Your payment information is encrypted and secure. We never store your card details.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isProcessing}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {isProcessing ? "Processing..." : `Pay $${course.price}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Course Info */}
                  <div className="flex gap-3">
                    <div className="w-16 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        by {course.instructor_name}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Course Price</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${course.price}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Platform Fee</span>
                      <span className="font-medium text-gray-900 dark:text-white">$0</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${course.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* What's Included */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      What's Included:
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Lifetime access
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Certificate of completion
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Mobile and desktop access
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        30-day money-back guarantee
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}