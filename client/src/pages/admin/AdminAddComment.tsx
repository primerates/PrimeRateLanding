import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminAddComment() {
  const [location, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/admin/dashboard')}
                className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
                data-testid="button-back-to-dashboard"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-black italic" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
                Comments Management
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="client" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="client" data-testid="tab-client-comments">Client Comments</TabsTrigger>
            <TabsTrigger value="internal" data-testid="tab-internal-messages">Internal Messages</TabsTrigger>
          </TabsList>

          {/* Client Comments Tab */}
          <TabsContent value="client">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                <CardTitle>Client Testimonial</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  data-testid="button-add-client-comment"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Comment
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* First Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-first-name">First Name</Label>
                    <Input 
                      id="client-first-name" 
                      placeholder="Enter first name"
                      data-testid="input-client-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-last-name">Last Name</Label>
                    <Input 
                      id="client-last-name" 
                      placeholder="Enter last name"
                      data-testid="input-client-last-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-city">City</Label>
                    <Input 
                      id="client-city" 
                      placeholder="Enter city"
                      data-testid="input-client-city"
                    />
                  </div>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-rating">Rating</Label>
                    <Select>
                      <SelectTrigger id="client-rating" data-testid="select-client-rating">
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="4">4 Stars</SelectItem>
                        <SelectItem value="3">3 Stars</SelectItem>
                        <SelectItem value="2">2 Stars</SelectItem>
                        <SelectItem value="1">1 Star</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-status">Status</Label>
                    <Select>
                      <SelectTrigger id="client-status" data-testid="select-client-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-date">Date</Label>
                    <Input 
                      id="client-date" 
                      type="date"
                      data-testid="input-client-date"
                    />
                  </div>
                </div>

                {/* Comment Text */}
                <div className="space-y-2">
                  <Label htmlFor="client-comment">Client Comment</Label>
                  <Textarea 
                    id="client-comment"
                    placeholder="Enter client testimonial or comment here..."
                    className="min-h-[150px]"
                    data-testid="textarea-client-comment"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline"
                    data-testid="button-cancel-client-comment"
                  >
                    Cancel
                  </Button>
                  <Button 
                    data-testid="button-save-client-comment"
                  >
                    Save Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Internal Messages Tab */}
          <TabsContent value="internal">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                <CardTitle>Internal Message</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  data-testid="button-add-internal-message"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Message
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* First Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="message-title">Message Title</Label>
                    <Input 
                      id="message-title" 
                      placeholder="Enter message title"
                      data-testid="input-message-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message-category">Category</Label>
                    <Select>
                      <SelectTrigger id="message-category" data-testid="select-message-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="motivation">Motivation</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="update">Company Update</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message-priority">Priority</Label>
                    <Select>
                      <SelectTrigger id="message-priority" data-testid="select-message-priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="message-status">Status</Label>
                    <Select>
                      <SelectTrigger id="message-status" data-testid="select-message-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message-start-date">Start Date</Label>
                    <Input 
                      id="message-start-date" 
                      type="date"
                      data-testid="input-message-start-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message-end-date">End Date</Label>
                    <Input 
                      id="message-end-date" 
                      type="date"
                      data-testid="input-message-end-date"
                    />
                  </div>
                </div>

                {/* Message Text */}
                <div className="space-y-2">
                  <Label htmlFor="message-content">Message Content</Label>
                  <Textarea 
                    id="message-content"
                    placeholder="Enter internal message or motivation content here..."
                    className="min-h-[150px]"
                    data-testid="textarea-message-content"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline"
                    data-testid="button-cancel-internal-message"
                  >
                    Cancel
                  </Button>
                  <Button 
                    data-testid="button-save-internal-message"
                  >
                    Save Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
