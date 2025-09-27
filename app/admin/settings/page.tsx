"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Send, Users, Settings, Eye, Save, Download } from "lucide-react"

// Mock data for subscribers
const mockSubscribers = [
  { id: 1, email: "user1@example.com", name: "Alex Johnson", subscribed: "2024-01-15", status: "active" },
  { id: 2, email: "user2@example.com", name: "Maria Garcia", subscribed: "2024-01-20", status: "active" },
  { id: 3, email: "user3@example.com", name: "David Chen", subscribed: "2024-02-01", status: "active" },
  { id: 4, email: "user4@example.com", name: "Sarah Wilson", subscribed: "2024-02-10", status: "active" },
  { id: 5, email: "user5@example.com", name: "Mike Brown", subscribed: "2024-02-15", status: "active" },
]

export default function AdminSettings() {
  const [emailSubject, setEmailSubject] = useState("")
  const [emailContent, setEmailContent] = useState("")
  const [previewMode, setPreviewMode] = useState(false)
  const [selectedSubscribers, setSelectedSubscribers] = useState<number[]>([])
  const [isSending, setIsSending] = useState(false)
  const [senderEmail, setSenderEmail] = useState("noreply@urban.com")
  const [emailPassword, setEmailPassword] = useState("")
  const [smtpServer, setSmtpServer] = useState("smtp.gmail.com")
  const [smtpPort, setSmtpPort] = useState("587")

  const handleSendEmail = async () => {
    if (!emailSubject || !emailContent) {
      alert("Please fill in both subject and content")
      return
    }

    setIsSending(true)

    // Simulate API call
    setTimeout(() => {
      alert(
        `Email sent to ${selectedSubscribers.length > 0 ? selectedSubscribers.length : mockSubscribers.length} subscribers!`,
      )
      setEmailSubject("")
      setEmailContent("")
      setSelectedSubscribers([])
      setIsSending(false)
    }, 2000)
  }

  const toggleSubscriber = (id: number) => {
    setSelectedSubscribers((prev) => (prev.includes(id) ? prev.filter((subId) => subId !== id) : [...prev, id]))
  }

  const selectAllSubscribers = () => {
    setSelectedSubscribers(mockSubscribers.map((sub) => sub.id))
  }

  const clearSelection = () => {
    setSelectedSubscribers([])
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-streetwear-lg">STORE SETTINGS</h1>
            <p className="text-muted-foreground">Manage your store configuration and email marketing</p>
          </div>
        </div>

        <Tabs defaultValue="email-marketing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email-marketing" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Marketing
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Subscribers
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
          </TabsList>

          {/* Email Marketing Tab */}
          <TabsContent value="email-marketing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  CREATE EMAIL CAMPAIGN
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Enter email subject..."
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Email Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your email content here..."
                    className="min-h-[200px]"
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {previewMode ? "Edit Mode" : "Preview"}
                  </Button>

                  <Button
                    onClick={handleSendEmail}
                    disabled={isSending || !emailSubject || !emailContent}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSending ? "Sending..." : "Send Email"}
                  </Button>
                </div>

                {previewMode && (
                  <Card className="border-2 border-dashed">
                    <CardHeader>
                      <CardTitle className="text-lg">Email Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <strong>Subject:</strong> {emailSubject || "No subject"}
                        </div>
                        <Separator />
                        <div className="whitespace-pre-wrap">{emailContent || "No content"}</div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    EMAIL SUBSCRIBERS ({mockSubscribers.length})
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllSubscribers}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Clear
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedSubscribers.length > 0 && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">
                        <strong>{selectedSubscribers.length}</strong> subscribers selected for next email campaign
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {mockSubscribers.map((subscriber) => (
                      <div
                        key={subscriber.id}
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedSubscribers.includes(subscriber.id)
                            ? "bg-primary/10 border-primary"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => toggleSubscriber(subscriber.id)}
                      >
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedSubscribers.includes(subscriber.id)}
                            onChange={() => toggleSubscriber(subscriber.id)}
                            className="rounded"
                          />
                          <div>
                            <p className="font-medium">{subscriber.name}</p>
                            <p className="text-sm text-muted-foreground">{subscriber.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{subscriber.status}</Badge>
                          <span className="text-sm text-muted-foreground">{subscriber.subscribed}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  GENERAL SETTINGS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input id="store-name" defaultValue="URBAN" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-email">Store Email</Label>
                  <Input id="store-email" type="email" defaultValue="admin@urban.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-description">Store Description</Label>
                  <Textarea id="store-description" defaultValue="Premium streetwear for the urban lifestyle" />
                </div>

                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  EMAIL CONFIGURATION
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="sender-email">Sender Email</Label>
                  <Input
                    id="sender-email"
                    type="email"
                    placeholder="noreply@urban.com"
                    defaultValue="noreply@urban.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-password">Email Password</Label>
                  <Input
                    id="email-password"
                    type="password"
                    placeholder="Enter email password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-server">SMTP Server</Label>
                    <Input
                      id="smtp-server"
                      placeholder="smtp.gmail.com"
                      defaultValue="smtp.gmail.com"
                      value={smtpServer}
                      onChange={(e) => setSmtpServer(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      placeholder="587"
                      defaultValue="587"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> These credentials will be used to send marketing emails to your subscribers.
                    Make sure to use an app-specific password for Gmail or the appropriate credentials for your email
                    provider.
                  </p>
                </div>

                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Email Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
